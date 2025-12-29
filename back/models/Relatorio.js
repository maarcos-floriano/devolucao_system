const DualDatabase = require('../middleware/dualDatabase');

class Relatorio {
  // Relatório de máquinas agrupadas (Paulinho/Nick)
  static async relatorioMaquinasAgrupadas() {
    try {
      const sql = `
        SELECT 
          CONCAT(
            COALESCE(processador, ''),
            ' ',
            COALESCE(memoria, ''),
            ' ',
            COALESCE(armazenamento, ''),
            ' ',
            COALESCE(fonte, 'S/Fonte'),
            ' ',
            COALESCE(placaVideo, 'S/Vídeo')
          ) AS configuracao,
          GROUP_CONCAT(id ORDER BY id SEPARATOR '-') AS ids,
          COUNT(*) AS quantidade
        FROM maquinas
        WHERE DATE(data) = CURDATE()
          AND saiu_venda = 0
        GROUP BY processador, memoria, armazenamento, fonte, placaVideo
        ORDER BY quantidade DESC;
      `;

      const rows = await DualDatabase.executeOnMainPool(sql);
      return rows;
    } catch (error) {
      throw new Error(`Erro ao gerar relatório de máquinas: ${error.message}`);
    }
  }

  // Relatório de monitores do dia
  static async relatorioMonitoresDia() {
    try {
      const sql = `
        SELECT 
          tamanho,
          COUNT(*) AS quantidade
        FROM monitores
        WHERE rma = 0
        AND DATE(data) = CURDATE()
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
      const [devolucoes] = await DualDatabase.executeOnMainPool(`
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

  // Relatório SAC diário
  static async relatorioSACDiario(data) {
    try {
      const dataBusca = data ? data : new Date().toISOString().slice(0, 10);

      console.log(`Gerando relatório SAC do dia: ${dataBusca}`);

      // Busca devoluções do dia
      const [devolucoes] = await DualDatabase.executeOnMainPool(`
        SELECT 
          d.id AS devolucao_id,
          d.origem,
          d.cliente,
          d.produto,
          d.codigo,
          d.observacao AS obs_devolucao,
          DATE_FORMAT(d.data, '%d/%m/%Y %H:%i') AS data_devolucao
        FROM devolucao d
        WHERE DATE(d.data) = ?
        ORDER BY d.data DESC
      `, [dataBusca]);

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
        data: dataBusca,
        dados: resultado,
        totalDevolucoes: resultado.length,
        totalItens: resultado.reduce((acc, dev) => acc + dev.itens.length, 0)
      };
    } catch (error) {
      throw new Error(`Erro ao gerar relatório SAC diário: ${error.message}`);
    }
  }

  // Métodos auxiliares privados
  static async _buscarItensComputadorCompleto(devolucaoId, item) {
    // Máquinas
    const [maquinas] = await DualDatabase.executeOnMainPool(`
      SELECT id, processador, memoria, armazenamento, fonte, placaVideo, gabinete, defeito, observacao
      FROM maquinas WHERE fkDevolucao = ?
    `, [devolucaoId]);

    // Monitores
    const [monitores] = await DualDatabase.executeOnMainPool(`
      SELECT id, marca, tamanho, observacao
      FROM monitores WHERE fkDevolucao = ?
    `, [devolucaoId]);

    // Periféricos
    const [perifericos] = await DualDatabase.executeOnMainPool(`
      SELECT id, periferico, quantidade, observacao
      FROM periferico WHERE fkDevolucao = ?
    `, [devolucaoId]);

    // Adicionar ao array de itens
    maquinas.forEach(m => {
      item.itens.push({
        item_id: m.id,
        tipo: 'Máquina',
        defeito: m.defeito,
        descricao: `Processador: ${m.processador || 'N/A'}, Memória: ${m.memoria || 'N/A'}, Armazenamento: ${m.armazenamento || 'N/A'}, Fonte: ${m.fonte || 'N/A'}, Placa de Vídeo: ${m.placaVideo || 'N/A'}`,
        observacao: m.observacao
      });
    });

    monitores.forEach(m => {
      item.itens.push({
        item_id: m.id,
        tipo: 'Monitor',
        defeito: 'N/A',
        descricao: `Marca: ${m.marca || 'N/A'}, Tamanho: ${m.tamanho || 'N/A'}`,
        observacao: m.observacao
      });
    });

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

  static async _buscarMaquinas(devolucaoId, item) {
    const [maquinas] = await DualDatabase.executeOnMainPool(`
      SELECT id, processador, memoria, armazenamento, fonte, placaVideo, gabinete, defeito, observacao
      FROM maquinas WHERE fkDevolucao = ?
    `, [devolucaoId]);

    maquinas.forEach(m => {
      item.itens.push({
        item_id: m.id,
        tipo: 'Máquina',
        defeito: m.defeito,
        descricao: `Processador: ${m.processador || 'N/A'}, Memória: ${m.memoria || 'N/A'}, Armazenamento: ${m.armazenamento || 'N/A'}, Fonte: ${m.fonte || 'N/A'}, Placa de Vídeo: ${m.placaVideo || 'N/A'}`,
        observacao: m.observacao
      });
    });
  }

  static async _buscarMonitores(devolucaoId, item) {
    const [monitores] = await DualDatabase.executeOnMainPool(`
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
    const [kits] = await DualDatabase.executeOnMainPool(`
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
    const [perifericos] = await DualDatabase.executeOnMainPool(`
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
}

module.exports = Relatorio; 