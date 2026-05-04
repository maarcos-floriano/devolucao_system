const DualDatabase = require('../middleware/dualDatabase');
const { buildSearchWhere } = require('../utils/search');

const MAQUINA_REPORT_TYPES = ['detalhado', 'soma', 'sku', 'defeito', 'sku_defeito'];

function toDateOnly(value, fallbackDate = new Date()) {
  const date = value ? new Date(value) : new Date(fallbackDate);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Data invalida para o relatorio');
  }

  return date.toISOString().slice(0, 10);
}

function normalizeMachineReportType(tipo) {
  return MAQUINA_REPORT_TYPES.includes(tipo) ? tipo : 'sku';
}

class Relatorio {
  // Relatório de máquinas agrupadas (Paulinho/Nick)
  static async relatorioMaquinasAgrupadas() {
    try {
      const sql = `
        SELECT
          COALESCE(config, 'Sem configuração') AS configuracao,
          COALESCE(codigo, 'Sem defeito informado') AS codigo,
          COUNT(*) AS quantidade
        FROM maquinas
        WHERE DATE(data_registro) = CURDATE()
        GROUP BY config, codigo
        ORDER BY quantidade DESC;
      `;

      const rows = await DualDatabase.executeOnMainPool(sql);
      return rows;
    } catch (error) {
      throw new Error(`Erro ao gerar relatório de máquinas: ${error.message}`);
    }
  }

  // Relatório de monitores da semana
  static async relatorioMonitoresDia() {
    try {
      const sql = `
        SELECT 
          tamanho,
          COUNT(*) AS quantidade
        FROM monitores
        WHERE rma = 0
        AND DATE(data) BETWEEN DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND CURDATE()
        GROUP BY tamanho
        ORDER BY quantidade DESC
      `;

      const rows = await DualDatabase.executeOnMainPool(sql);
      return rows;
    } catch (error) {
      throw new Error(`Erro ao gerar relatório de monitores: ${error.message}`);
    }
  }

  // Relatório de kits agrupados
  static async relatorioKitsAgrupados() {
    try {
      const sql = `
        SELECT 
          CONCAT(processador, ' ', memoria, ' ', placaMae) AS configuracao,
          GROUP_CONCAT(id ORDER BY id SEPARATOR '-') AS ids,
          COUNT(*) AS quantidade
        FROM kit
        WHERE saiu_venda = 0
          AND DATE(data) BETWEEN DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND CURDATE()
        GROUP BY processador, memoria, placaMae
        ORDER BY quantidade DESC
      `;

      const rows = await DualDatabase.executeOnMainPool(sql);
      return rows;
    } catch (error) {
      throw new Error(`Erro ao gerar relatório de kits: ${error.message}`);
    }
  }

  // Relatório SAC semanal
  static async relatorioSACSemanal(dataInicio, dataFim) {
    try {
      if (!dataInicio || !dataFim) {
        // Semana atual (segunda a domingo)
        const hoje = new Date();
        const diaSemana = hoje.getDay(); // 0 = domingo, 1 = segunda

        // Calcula segunda-feira
        const segunda = new Date(hoje);
        segunda.setDate(hoje.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
        segunda.setHours(0, 0, 0, 0);

        // Calcula domingo
        const domingo = new Date(segunda);
        domingo.setDate(segunda.getDate() + 6);
        domingo.setHours(23, 59, 59, 999);

        dataInicio = segunda.toISOString().slice(0, 10);
        dataFim = domingo.toISOString().slice(0, 10);
      }

      console.log(`Gerando relatório SAC de ${dataInicio} até ${dataFim}`);

      // Busca devoluções do período
      const devolucoes = await DualDatabase.executeOnMainPool(`
        SELECT 
          d.id AS devolucao_id,
          d.origem,
          d.cliente,
          d.produto,
          d.codigo,
          d.observacao AS obs_devolucao,
          DATE_FORMAT(d.data, '%d/%m/%Y %H:%i') AS data_devolucao,
          DATE(d.data) AS data_sem_data
        FROM devolucao d
        WHERE DATE(d.data) BETWEEN ? AND ?
        ORDER BY d.data DESC
      `, [dataInicio, dataFim]);

      const resultado = [];

      for (const dev of devolucoes) {
        const item = {
          devolucao_id: dev.devolucao_id,
          origem: dev.origem,
          cliente: dev.cliente,
          produto: dev.produto,
          codigo: dev.codigo,
          obs_devolucao: dev.obs_devolucao,
          data_devolucao: dev.data_devolucao,
          data_sem_data: dev.data_sem_data,
          itens: []
        };

        // Buscar itens baseado no tipo de produto
        switch (dev.produto) {
          case 'Computador Completo':
            await this._buscarItensComputadorCompleto(dev.devolucao_id, item);
            break;
          case 'Máquina':
            await this._buscarMaquinas(dev.devolucao_id, item);
            break;
          case 'Monitor':
            await this._buscarMonitores(dev.devolucao_id, item);
            break;
          case 'Kit':
            await this._buscarKits(dev.devolucao_id, item);
            break;
          case 'Periferico':
            await this._buscarPerifericos(dev.devolucao_id, item);
            break;
        }

        resultado.push(item);
      }

      return {
        periodo: { inicio: dataInicio, fim: dataFim },
        dados: resultado,
        totalDevolucoes: resultado.length,
        totalItens: resultado.reduce((acc, dev) => acc + dev.itens.length, 0)
      };
    } catch (error) {
      throw new Error(`Erro ao gerar relatório SAC semanal: ${error.message}`);
    }
  }

  // Relatório SAC diário (compatibilidade): agora retorna o período semanal
  static async relatorioSACDiario() {
    return this.relatorioSACSemanal();
  }

  static async _buscarItensComputadorCompleto(devolucaoId, item) {
    await this._buscarMaquinas(devolucaoId, item);
    await this._buscarMonitores(devolucaoId, item);
    await this._buscarPerifericos(devolucaoId, item);
  }

  static async _buscarMaquinas(devolucaoId, item) {
    const maquinas = await DualDatabase.executeOnMainPool(`
      SELECT id, codigo, config, defeito
      FROM maquinas WHERE fkDevolucao = ?
    `, [devolucaoId]);

    maquinas.forEach(m => {
      item.itens.push({
        item_id: m.id,
        tipo: 'Máquina',
        defeito: m.defeito,
        descricao: `SKU: ${m.codigo || 'N/A'}, Configuracao: ${m.config || 'N/A'}`,
        observacao: ''
      });
    });
  }

  static async _buscarMonitores(devolucaoId, item) {
    const monitores = await DualDatabase.executeOnMainPool(`
      SELECT id, marca, tamanho, observacao
      FROM monitores WHERE fkDevolucao = ?
    `, [devolucaoId]);

    monitores.forEach(m => {
      item.itens.push({
        item_id: m.id,
        tipo: 'Monitor',
        defeito: 'N/A',
        descricao: `Marca: ${m.marca || 'N/A'}, Tamanho: ${m.tamanho || 'N/A'}`,
        observacao: m.observacao
      });
    });
  }

  static async _buscarKits(devolucaoId, item) {
    const kits = await DualDatabase.executeOnMainPool(`
      SELECT id, processador, memoria, placaMae, defeito, observacao
      FROM kit WHERE fkDevolucao = ?
    `, [devolucaoId]);

    kits.forEach(k => {
      item.itens.push({
        item_id: k.id,
        tipo: 'Kit',
        defeito: k.defeito,
        descricao: `Processador: ${k.processador || 'N/A'}, Memória: ${k.memoria || 'N/A'}, Placa Mãe: ${k.placaMae || 'N/A'}`,
        observacao: k.observacao
      });
    });
  }

  static async _buscarPerifericos(devolucaoId, item) {
    const perifericos = await DualDatabase.executeOnMainPool(`
      SELECT id, periferico, quantidade, observacao
      FROM periferico WHERE fkDevolucao = ?
    `, [devolucaoId]);

    perifericos.forEach(p => {
      item.itens.push({
        item_id: p.id,
        tipo: 'Periférico',
        defeito: 'N/A',
        descricao: `Periférico: ${p.periferico || 'N/A'}, Quantidade: ${p.quantidade || '1'}`,
        observacao: p.observacao
      });
    });
  }

  static async gerarRelatorioSimples(tabela, dataFim, dataInicioCustom) {
    try {
      const fim = dataFim ? new Date(dataFim) : new Date();
      if (Number.isNaN(fim.getTime())) {
        throw new Error('Data inválida para o relatório');
      }

      const inicio = dataInicioCustom ? new Date(dataInicioCustom) : new Date(fim);
      if (Number.isNaN(inicio.getTime())) {
        throw new Error('Data inicial inválida para o relatório');
      }

      if (!dataInicioCustom) {
        inicio.setDate(fim.getDate() - 6);
      }

      if (inicio > fim) {
        throw new Error('A data inicial não pode ser maior que a data final');
      }

      const dataInicio = inicio.toISOString().slice(0, 10);
      const dataFinal = fim.toISOString().slice(0, 10);

      const dateField = tabela === 'maquinas' ? 'data_registro' : 'data';
      const sql = `SELECT * FROM ${tabela} WHERE DATE(${dateField}) BETWEEN ? AND ? ORDER BY ${dateField} DESC`;
      const rows = await DualDatabase.executeOnMainPool(sql, [dataInicio, dataFinal]);
      return rows || [];
    } catch (error) {
      throw new Error(`Erro ao gerar relatório semanal: ${error.message}`);
    }
  }

  static async relatorioMaquinasFlexivel({
    dataInicio,
    dataFim,
    sku = '',
    defeito = '',
    tipo = 'sku',
  } = {}) {
    try {
      const fim = toDateOnly(dataFim);
      const inicio = dataInicio ? toDateOnly(dataInicio) : fim;

      if (new Date(inicio) > new Date(fim)) {
        throw new Error('A data inicial nao pode ser maior que a data final');
      }

      const reportType = normalizeMachineReportType(tipo);
      const filters = ['DATE(data_registro) BETWEEN ? AND ?'];
      const params = [inicio, fim];

      const skuWhere = buildSearchWhere(['codigo', 'config'], sku);
      if (skuWhere.clause !== '1 = 1') {
        filters.push(skuWhere.clause);
        params.push(...skuWhere.params);
      }

      const defeitoWhere = buildSearchWhere(['defeito'], defeito);
      if (defeitoWhere.clause !== '1 = 1') {
        filters.push(defeitoWhere.clause);
        params.push(...defeitoWhere.params);
      }

      const whereClause = filters.join(' AND ');

      const totalRows = await DualDatabase.executeOnMainPool(
        `
          SELECT
            COUNT(*) AS total_maquinas,
            COUNT(DISTINCT codigo) AS total_skus
          FROM maquinas
          WHERE ${whereClause}
        `,
        params
      );

      const total = totalRows[0] || { total_maquinas: 0, total_skus: 0 };
      let sql = '';

      if (reportType === 'soma') {
        sql = `
          SELECT
            COUNT(*) AS total_maquinas,
            COUNT(DISTINCT codigo) AS total_skus
          FROM maquinas
          WHERE ${whereClause}
        `;
      }

      if (reportType === 'sku') {
        sql = `
          SELECT
            codigo,
            COALESCE(config, 'Sem configuracao') AS configuracao,
            COUNT(*) AS quantidade,
            GROUP_CONCAT(id ORDER BY id SEPARATOR ', ') AS ids
          FROM maquinas
          WHERE ${whereClause}
          GROUP BY codigo, config
          ORDER BY quantidade DESC, codigo ASC
        `;
      }

      if (reportType === 'defeito') {
        sql = `
          SELECT
            COALESCE(NULLIF(defeito, ''), 'Sem defeito informado') AS defeito,
            COUNT(*) AS quantidade,
            GROUP_CONCAT(id ORDER BY id SEPARATOR ', ') AS ids
          FROM maquinas
          WHERE ${whereClause}
          GROUP BY COALESCE(NULLIF(defeito, ''), 'Sem defeito informado')
          ORDER BY quantidade DESC, defeito ASC
        `;
      }

      if (reportType === 'sku_defeito') {
        sql = `
          SELECT
            codigo,
            COALESCE(config, 'Sem configuracao') AS configuracao,
            COALESCE(NULLIF(defeito, ''), 'Sem defeito informado') AS defeito,
            COUNT(*) AS quantidade,
            GROUP_CONCAT(id ORDER BY id SEPARATOR ', ') AS ids
          FROM maquinas
          WHERE ${whereClause}
          GROUP BY codigo, config, COALESCE(NULLIF(defeito, ''), 'Sem defeito informado')
          ORDER BY quantidade DESC, codigo ASC, defeito ASC
        `;
      }

      if (reportType === 'detalhado') {
        sql = `
          SELECT
            id,
            codigo,
            config,
            defeito,
            DATE_FORMAT(data_registro, '%d/%m/%Y %H:%i') AS data_registro
          FROM maquinas
          WHERE ${whereClause}
          ORDER BY data_registro DESC, id DESC
        `;
      }

      const rows = await DualDatabase.executeOnMainPool(sql, params);

      return {
        periodo: { inicio, fim },
        filtros: { sku, defeito, tipo: reportType },
        totalMaquinas: total.total_maquinas || 0,
        totalSkus: total.total_skus || 0,
        dados: rows || [],
      };
    } catch (error) {
      throw new Error(`Erro ao gerar relatorio de maquinas: ${error.message}`);
    }
  }
}

module.exports = Relatorio;
