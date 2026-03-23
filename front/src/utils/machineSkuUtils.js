import { listarTodosSKUs } from './constants.js';

const MACHINE_SKU_OPTIONS = listarTodosSKUs().filter((sku) => /i5|i7/i.test(sku.cpu || ''));

const normalizeText = (value = '') => String(value).trim().toLowerCase();

const normalizeCpu = (value = '') => {
  const normalized = normalizeText(value)
    .replace(/intel\s+core\s*/g, '')
    .replace(/core\s*/g, '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ');

  const matchGeracao = normalized.match(/(i[57])\s*(\d+)(?:ª\s*gera[cç][aã]o|th)/i);
  if (matchGeracao) {
    return `${matchGeracao[1].toLowerCase()} ${matchGeracao[2]}ª geração`;
  }

  return normalized;
};

const normalizeMemoria = (value = '') => normalizeText(value).replace(/\s*ddr\d/gi, '').trim();

const normalizeStorage = (value = '') => {
  const normalized = normalizeText(value);
  const tipo = normalized.includes('nvme') ? 'NVMe' : normalized.includes('hd') ? 'HD' : 'SSD';
  const sizeMatch = normalized.match(/(\d+)\s*gb|(\d+)\s*tb/);

  if (!sizeMatch) return normalized;

  const size = sizeMatch[1] ? `${sizeMatch[1]}GB` : `${sizeMatch[2]}TB`;
  return `${size} ${tipo}`;
};

const storageCandidatesFromSku = (value = '') => {
  const normalized = normalizeText(value);
  const tipo = normalized.includes('nvme') ? 'NVMe' : normalized.includes('hd') ? 'HD' : 'SSD';

  if (/480\s*ou\s*512/.test(normalized)) {
    return [`480GB ${tipo}`, `512GB ${tipo}`];
  }

  if (/240\s*ou\s*256/.test(normalized)) {
    return [`240GB ${tipo}`, `256GB ${tipo}`];
  }

  if (/960.*1tb|1tb.*960/.test(normalized)) {
    return [`960GB ${tipo}`, `1TB ${tipo}`];
  }

  const sizeMatch = normalized.match(/(\d+)\s*gb|(\d+)\s*tb/);
  if (!sizeMatch) return [value];

  const size = sizeMatch[1] ? `${sizeMatch[1]}GB` : `${sizeMatch[2]}TB`;
  return [`${size} ${tipo}`];
};

const fonteCandidatesFromSku = (value = '') => {
  const normalized = normalizeText(value);
  const watts = normalized.match(/\d+\s*w/g) || [];
  return watts.map((item) => item.replace(/\s+/g, '').toUpperCase());
};

const normalizeFonte = (value = '') => normalizeText(value).replace(/\s+/g, '').toUpperCase();
const normalizeGpu = (value = '') => normalizeText(value).replace(/\s+/g, ' ').trim();
const normalizeGabinete = (value = '') => normalizeText(value).replace(/\s+/g, ' ').trim();

const isSkuWithoutGpu = (sku) => ['n/a', 's/ gpu', 'sem gpu', ''].includes(normalizeGpu(sku?.GPU));
const isSkuWithoutGabinete = (sku) => ['n/a', 'n110', ''].includes(normalizeGabinete(sku?.gabinete));

const matchesMachineSku = (sku, machine = {}) => {
  const sameCpu = normalizeCpu(sku.cpu) === normalizeCpu(machine.processador);
  const sameMemoria = normalizeMemoria(sku.ram) === normalizeMemoria(machine.memoria);
  const sameArmazenamento = storageCandidatesFromSku(sku.storage).some(
    (candidate) => normalizeStorage(candidate) === normalizeStorage(machine.armazenamento)
  );
  const sameFonte = fonteCandidatesFromSku(sku.fonte).includes(normalizeFonte(machine.fonte));

  if (!sameCpu || !sameMemoria || !sameArmazenamento || !sameFonte) {
    return false;
  }

  const gpu = normalizeGpu(machine.placaVideo);
  if (gpu && gpu !== normalizeGpu(sku.GPU)) {
    return false;
  }

  const gabinete = normalizeGabinete(machine.gabinete);
  if (gabinete && gabinete !== normalizeGabinete(sku.gabinete)) {
    return false;
  }

  return true;
};

export const getMatchingMachineSku = (machine = {}) => {
  const matches = MACHINE_SKU_OPTIONS.filter((sku) => matchesMachineSku(sku, machine));

  if (matches.length <= 1) {
    return matches[0] || null;
  }

  const exactGpuMatch = matches.find((sku) => {
    const gpu = normalizeGpu(machine.placaVideo);
    return gpu && gpu === normalizeGpu(sku.GPU);
  });
  if (exactGpuMatch) return exactGpuMatch;

  const exactGabineteMatch = matches.find((sku) => {
    const gabinete = normalizeGabinete(machine.gabinete);
    return gabinete && gabinete === normalizeGabinete(sku.gabinete);
  });
  if (exactGabineteMatch) return exactGabineteMatch;

  return matches.find((sku) => isSkuWithoutGpu(sku) && isSkuWithoutGabinete(sku)) || matches[0] || null;
};

export const getMachineSkuCode = (machine = {}) => getMatchingMachineSku(machine)?.cod || '';
