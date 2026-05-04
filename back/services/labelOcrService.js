const path = require('path');
const { recognize } = require('tesseract.js');
const { normalizeForMatch } = require('../utils/search');

const KNOWN_ORIGINS = [
  'Mercado Livre',
  'Shopee',
  'Correios',
  'Loggi',
  'Mineiro Express',
  'Pex',
];

const SKIP_CLIENT_LINES = [
  'destinatario',
  'remetente',
  'cliente',
  'comprador',
  'endereco',
  'cep',
  'cpf',
  'cnpj',
  'nota fiscal',
  'pedido',
  'produto',
  'codigo',
  'origem',
  'item',
  'rastreamento',
  'devolucao',
  'mercado livre',
  'shopee',
  'correios',
];

function cleanLine(line) {
  return String(line || '')
    .replace(/\s+/g, ' ')
    .replace(/[|_~]/g, '')
    .trim();
}

function getLines(rawText = '') {
  return String(rawText || '')
    .split(/\r?\n/)
    .map(cleanLine)
    .filter((line) => line.length >= 2);
}

function extractOrigin(rawText) {
  const normalizedText = normalizeForMatch(rawText);
  return KNOWN_ORIGINS.find((origin) => normalizedText.includes(normalizeForMatch(origin))) || '';
}

function extractTrackingCode(rawText) {
  const upperText = String(rawText || '').toUpperCase();
  const brazilPostCode = upperText.match(/\b[A-Z]{2}\d{9}[A-Z]{2}\b/);
  if (brazilPostCode) {
    return brazilPostCode[0];
  }

  const labeledCode = upperText.match(/(?:RASTREAMENTO|COD(?:IGO)?|PEDIDO|ETIQUETA)\s*[:#-]?\s*([A-Z0-9-]{6,40})/);
  if (labeledCode) {
    return labeledCode[1].replace(/[^A-Z0-9]/g, '');
  }

  const longNumericCode = upperText.match(/\b\d{9,30}\b/);
  return longNumericCode ? longNumericCode[0] : '';
}

function valueAfterLabel(line) {
  const match = line.match(/(?:destinat[aá]rio|cliente|comprador|nome)\s*:?\s*(.+)$/i);
  if (!match) return '';
  const value = cleanLine(match[1]).replace(/^(destinat[aá]rio|cliente|comprador|nome)\s*:?\s*/i, '');
  return value.length > 2 ? value : '';
}

function looksLikePersonOrCompany(line) {
  const normalized = normalizeForMatch(line);
  if (!normalized || normalized.length < 5) return false;
  if (SKIP_CLIENT_LINES.some((skip) => normalized.includes(skip))) return false;
  if (/\d{4,}/.test(line)) return false;
  if (/^(rua|avenida|av |rodovia|estrada|bairro|cidade|uf)\b/i.test(normalized)) return false;

  const words = normalized.split(' ').filter((word) => word.length > 1);
  return words.length >= 2 && words.length <= 8;
}

function extractClient(lines) {
  for (let index = 0; index < lines.length; index += 1) {
    const inlineValue = valueAfterLabel(lines[index]);
    if (inlineValue && looksLikePersonOrCompany(inlineValue)) {
      return inlineValue;
    }

    if (/(destinat[aá]rio|cliente|comprador|nome)/i.test(lines[index])) {
      const nextLine = lines[index + 1];
      if (nextLine && looksLikePersonOrCompany(nextLine)) {
        return nextLine;
      }
    }
  }

  return lines.find(looksLikePersonOrCompany) || '';
}

function extractProduct(lines) {
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const inlineMatch = line.match(/(?:produto|descricao|descri[cç][aã]o|item|conte[uú]do)\s*:?\s*(.+)$/i);
    if (inlineMatch && cleanLine(inlineMatch[1]).length > 2) {
      return cleanLine(inlineMatch[1]);
    }

    if (/(produto|descricao|descri[cç][aã]o|item|conte[uú]do)/i.test(line) && lines[index + 1]) {
      return lines[index + 1];
    }
  }

  return '';
}

function inferFields(rawText, ocrConfidence = 0) {
  const lines = getLines(rawText);
  const cliente = extractClient(lines);
  const origem = extractOrigin(rawText);
  const codigo = extractTrackingCode(rawText);
  const produto = extractProduct(lines);
  const confidenceParts = [
    cliente ? 35 : 0,
    origem ? 20 : 0,
    codigo ? 20 : 0,
    produto ? 10 : 0,
    Math.max(0, Math.min(15, Math.round(Number(ocrConfidence || 0) * 0.15))),
  ];

  return {
    fields: {
      cliente,
      origem,
      codigo,
      produto,
      observacao: '',
    },
    confidence: confidenceParts.reduce((total, part) => total + part, 0),
    warnings: cliente ? [] : ['Nao foi possivel identificar o cliente com seguranca. Preencha manualmente.'],
    lines,
  };
}

async function analyzeLabelImage(filePath) {
  const absolutePath = path.resolve(filePath);
  const langs = process.env.OCR_LANGS || 'por+eng';

  try {
    const result = await recognize(absolutePath, langs, {
      logger: () => {},
    });

    const rawText = result?.data?.text || '';
    const inferred = inferFields(rawText, result?.data?.confidence || 0);

    return {
      success: true,
      rawText: rawText.slice(0, 4000),
      ...inferred,
    };
  } catch (error) {
    console.error('Erro ao analisar etiqueta por OCR:', error.message);
    return {
      success: false,
      rawText: '',
      fields: {
        cliente: '',
        origem: '',
        codigo: '',
        produto: '',
        observacao: '',
      },
      confidence: 0,
      warnings: ['OCR indisponivel ou imagem sem leitura. Preencha o formulario manualmente.'],
      error: error.message,
      lines: [],
    };
  }
}

module.exports = {
  analyzeLabelImage,
  inferFields,
};
