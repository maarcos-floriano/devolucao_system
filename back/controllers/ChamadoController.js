const Chamado = require('../models/Chamado');
const Devolucao = require('../models/Devolucao');
const emailService = require('../services/emailService');

const VALID_TYPES = ['acompanhar_devolucao', 'acesso_remoto', 'divergencia'];

async function validateLinkedDevolucao(devolucaoId) {
  if (!devolucaoId) return null;

  const devolucao = await Devolucao.findById(Number.parseInt(devolucaoId, 10));
  if (!devolucao) {
    const error = new Error('Devolucao nao encontrada');
    error.status = 404;
    throw error;
  }

  return devolucao;
}

class ChamadoController {
  static async create(req, res) {
    try {
      const payload = req.body;
      const tipo = payload.tipo || (payload.acesso_remoto_em ? 'acesso_remoto' : 'acompanhar_devolucao');

      if (!VALID_TYPES.includes(tipo)) {
        return res.status(400).json({ success: false, error: 'Tipo de chamado invalido' });
      }

      if (tipo === 'acompanhar_devolucao' && (!payload.cliente || !payload.item_esperado || !payload.data_previsao)) {
        return res.status(400).json({
          success: false,
          error: 'Para ficar de olho, informe cliente, o que vai chegar e data de previsao',
        });
      }

      if (tipo === 'acesso_remoto' && (!payload.cliente || !payload.acesso_remoto_em)) {
        return res.status(400).json({
          success: false,
          error: 'Para acesso remoto, informe cliente e data/hora do acesso',
        });
      }

      if (payload.devolucao_id) {
        await validateLinkedDevolucao(payload.devolucao_id);
      }

      const chamado = await Chamado.create({ ...payload, tipo });

      if (tipo === 'acesso_remoto') {
        try {
          await emailService.notifyRemoteAccess(chamado);
        } catch (emailError) {
          console.warn('Chamado criado, mas falhou ao enviar e-mail:', emailError.message);
        }
      }

      return res.status(201).json({ success: true, data: chamado });
    } catch (error) {
      console.error('Erro ao criar chamado:', error);
      return res.status(error.status || 500).json({ success: false, error: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const { page = 1, limit = 10, search = '', status, tipo } = req.query;

      const [dados, total, totalAbertos] = await Promise.all([
        Chamado.findAll({
          page,
          limit,
          search: search.toString(),
          status: status?.toString(),
          tipo: tipo?.toString(),
        }),
        Chamado.count(search.toString(), status?.toString(), tipo?.toString()),
        Chamado.countOpen(),
      ]);

      return res.json({
        success: true,
        dados,
        total,
        totalAbertos,
        totalPaginas: Math.ceil(total / Number(limit || 10)),
      });
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async findMatches(req, res) {
    try {
      const chamados = await Chamado.findOpenMatches({
        cliente: req.query.cliente,
        produto: req.query.produto,
        codigo: req.query.codigo,
      });

      return res.json({ success: true, dados: chamados, total: chamados.length });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async update(req, res) {
    try {
      if (req.body.devolucao_id) {
        await validateLinkedDevolucao(req.body.devolucao_id);
      }

      const chamado = await Chamado.update(Number.parseInt(req.params.id, 10), req.body);
      return res.json({ success: true, data: chamado, message: 'Chamado atualizado com sucesso' });
    } catch (error) {
      const statusCode = error.status || (error.message.includes('nao encontrado') ? 404 : 500);
      return res.status(statusCode).json({ success: false, error: error.message });
    }
  }

  static async getOpenCount(req, res) {
    try {
      const total = await Chamado.countOpen();
      return res.json({ success: true, total });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      await Chamado.delete(Number.parseInt(req.params.id, 10));
      return res.json({ success: true, message: 'Chamado excluido com sucesso' });
    } catch (error) {
      const statusCode = error.message.includes('nao encontrado') ? 404 : 500;
      return res.status(statusCode).json({ success: false, error: error.message });
    }
  }
}

module.exports = ChamadoController;
