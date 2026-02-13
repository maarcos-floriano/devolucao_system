const ExcelJS = require('exceljs');
const Relatorio = require('../models/Relatorio');

class RelatorioController {
  // Relatório Excel simples por tabela (período semanal)
  static async relatorioExcel(req, res) {
    try {
      const { tabela } = req.params;
      const { data } = req.query; // usado como data final opcional

      const tabelasPermitidas = ["devolucao", "maquinas", "monitores", "kit"];
      if (!tabelasPermitidas.includes(tabela)) {
        return res.status(400).json({ error: "Tabela inválida" });
      }

      const rows = await Relatorio.gerarRelatorioSimples(tabela, data);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`Relatório ${tabela}`);

      if (rows.length === 0) {
        worksheet.addRow(["Nenhum registro encontrado"]);
      } else {
        // Cabeçalhos
        worksheet.columns = Object.keys(rows[0]).map(col => ({
          header: col,
          key: col,
          width: 20
        }));

        // Dados
        rows.forEach(row => worksheet.addRow(row));
      }

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      const dataReferencia = data || new Date().toISOString().slice(0, 10);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=relatorio_${tabela}_semanal_${dataReferencia}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Erro ao gerar relatório Excel:', error);
      res.status(500).json({ erro: error.message });
    }
  }

  // Relatório Paulinho/Nick - Máquinas
  static async relatorioPaulinhoMaquinas(req, res) {
    try {
      const dados = await Relatorio.relatorioMaquinasAgrupadas();

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Relatorio Paulinho");

      worksheet.columns = [
        { header: "CONFIGURAÇÃO", key: "configuracao", width: 40 },
        { header: "IDS", key: "ids", width: 30 },
        { header: "QTD", key: "quantidade", width: 15 }
      ];

      // Verificar se dados é um array antes de iterar
      if (dados && Array.isArray(dados)) {
        dados.forEach(r => worksheet.addRow(r));
      } else {
        worksheet.addRow(["Nenhum dado disponível"]);
      }

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=relatorio_paulinho_${new Date().toISOString().slice(0, 10)}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Erro ao gerar relatório Paulinho:', error);
      res.status(500).json({ erro: error.message });
    }
  }

  // Relatório Paulinho/Nick - Monitores
  static async relatorioPaulinhoMonitores(req, res) {
    try {
      const dados = await Relatorio.relatorioMonitoresDia();

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Relatorio Paulinho Monitores");

      worksheet.columns = [
        { header: "TAMANHO", key: "tamanho", width: 15 },
        { header: "QTD", key: "quantidade", width: 15 }
      ];

      // Verificar se dados é um array antes de iterar
      if (dados && Array.isArray(dados)) {
        dados.forEach(r => worksheet.addRow(r));
      } else {
        worksheet.addRow(["Nenhum dado disponível"]);
      }

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=relatorio_paulinho_monitores_${new Date().toISOString().slice(0, 10)}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Erro ao gerar relatório monitores:', error);
      res.status(500).json({ erro: error.message });
    }
  }

  // Relatório Paulinho/Nick - Kits
  static async relatorioPaulinhoKit(req, res) {
    try {
      const dados = await Relatorio.relatorioKitsAgrupados();

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Relatorio Paulinho Kit");

      worksheet.columns = [
        { header: "CONFIGURAÇÃO", key: "configuracao", width: 40 },
        { header: "IDS", key: "ids", width: 30 },
        { header: "QTD", key: "quantidade", width: 15 }
      ];

      // Verificar se dados é um array antes de iterar
      if (dados && Array.isArray(dados)) {
        dados.forEach(r => worksheet.addRow(r));
      } else {
        worksheet.addRow(["Nenhum dado disponível"]);
      }

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=relatorio_paulinho_kit_${new Date().toISOString().slice(0, 10)}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Erro ao gerar relatório kits:', error);
      res.status(500).json({ erro: error.message });
    }
  }

  // Relatório SAC semanal - CORRIGIDO
  static async relatorioSACSemanal(req, res) {
    try {

      const hoje = new Date();
      const dataFim = new Date(hoje);
      const dataInicio = new Date(hoje);

      // Data fim é hoje
      dataFim.setHours(23, 59, 59, 999);

      // Data início é 7 dias atrás (00:00:00)
      dataInicio.setDate(hoje.getDate() - 6); // -6 para incluir hoje
      dataInicio.setHours(0, 0, 0, 0);

      

      // Validação de datas
      if (!dataInicio || !dataFim) {
        return res.status(400).json({
          error: "As datas de início e fim são obrigatórias"
        });
      }

      const resultado = await Relatorio.relatorioSACSemanal(dataInicio, dataFim);

      // Verificar se resultado existe e tem a estrutura esperada
      if (!resultado) {
        return res.status(404).json({
          error: "Nenhum dado encontrado para o período especificado"
        });
      }

      // Garantir que resultado.dados é um array
      const dados = resultado.dados || [];
      const periodo = resultado.periodo || { inicio: dataInicio, fim: dataFim };
      const totalDevolucoes = resultado.totalDevolucoes || 0;
      const totalItens = resultado.totalItens || 0;

      // Gerar Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(
        `Relatório SAC - ${periodo.inicio} a ${periodo.fim}`
      );

      // Cabeçalho
      worksheet.columns = [
        { header: "ID Devolução", key: "devolucao_id", width: 12 },
        { header: "Origem", key: "origem", width: 20 },
        { header: "Cliente", key: "cliente", width: 25 },
        { header: "Produto", key: "produto", width: 20 },
        { header: "Código", key: "codigo", width: 15 },
        { header: "Obs. Devolução", key: "obs_devolucao", width: 30 },
        { header: "Data Devolução", key: "data_devolucao", width: 18 },
        { header: "Tipo Item", key: "tipo_item", width: 15 },
        { header: "ID Item", key: "item_id", width: 12 },
        { header: "Defeito", key: "defeito", width: 30 },
        { header: "Descrição/Configuração", key: "descricao", width: 50 },
        { header: "Observação", key: "observacao_item", width: 30 }
      ];

      // Adicionar título
      worksheet.insertRow(1, [
        `Relatório SAC - Período: ${periodo.inicio} a ${periodo.fim}`
      ]);
      worksheet.mergeCells('A1:L1');
      worksheet.getRow(1).font = { bold: true, size: 14 };
      worksheet.getRow(1).alignment = { horizontal: 'center' };

      // Preencher dados - COM VERIFICAÇÃO DE SEGURANÇA
      let linhaAtual = 3;

      if (Array.isArray(dados) && dados.length > 0) {
        dados.forEach(devolucao => {
          // Garantir que devolucao.itens é um array
          const itens = devolucao.itens || [];

          if (itens.length === 0) {
            worksheet.addRow({
              devolucao_id: devolucao.devolucao_id || '',
              origem: devolucao.origem || '',
              cliente: devolucao.cliente || '',
              produto: devolucao.produto || '',
              codigo: devolucao.codigo || '',
              obs_devolucao: devolucao.obs_devolucao || '',
              data_devolucao: devolucao.data_devolucao || '',
              tipo_item: "Nenhum item",
              item_id: "",
              defeito: "",
              descricao: "Nenhum item associado a esta devolução",
              observacao_item: ""
            });
            linhaAtual++;
          } else {
            itens.forEach((item, idx) => {
              worksheet.addRow({
                devolucao_id: idx === 0 ? (devolucao.devolucao_id || '') : "",
                origem: idx === 0 ? (devolucao.origem || '') : "",
                cliente: idx === 0 ? (devolucao.cliente || '') : "",
                produto: idx === 0 ? (devolucao.produto || '') : "",
                codigo: idx === 0 ? (devolucao.codigo || '') : "",
                obs_devolucao: idx === 0 ? (devolucao.obs_devolucao || '') : "",
                data_devolucao: idx === 0 ? (devolucao.data_devolucao || '') : "",
                tipo_item: item.tipo || '',
                item_id: item.item_id || '',
                defeito: item.defeito || '',
                descricao: item.descricao || '',
                observacao_item: item.observacao || ''
              });
              linhaAtual++;
            });
          }
        });
      } else {
        // Se não houver dados, adicionar mensagem
        worksheet.addRow(["Nenhum registro encontrado para o período especificado"]);
        linhaAtual++;
      }

      // Adicionar estatísticas
      worksheet.addRow([]);
      worksheet.addRow(["RESUMO DO PERÍODO:"]);
      worksheet.addRow([`Total de devoluções: ${totalDevolucoes}`]);
      worksheet.addRow([`Total de itens associados: ${totalItens}`]);

      // Configurar resposta
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=relatorio_sac_${periodo.inicio}_a_${periodo.fim}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error("Erro ao gerar relatório SAC semanal:", error.message);
      res.status(500).json({
        error: "Erro interno ao gerar relatório",
        details: error.message
      });
    }
  }

  // Relatório SAC diário (compatibilidade): agora responde com dados semanais
  static async relatorioSACDiario(req, res) {
    try {

      const resultado = await Relatorio.relatorioSACDiario();

      // Verificar se resultado existe e tem a estrutura esperada
      if (!resultado) {
        return res.status(404).json({
          error: "Nenhum dado encontrado para a data especificada"
        });
      }

      // Garantir que resultado.dados é um array
      const dados = resultado.dados || [];
      const periodoRelatorio = resultado.periodo || {};
      const dataRelatorio = `${periodoRelatorio.inicio || 'inicio'}_a_${periodoRelatorio.fim || 'fim'}`;
      const totalDevolucoes = resultado.totalDevolucoes || 0;
      const totalItens = resultado.totalItens || 0;

      // Gerar Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`Relatório SAC - ${dataRelatorio}`);

      // Cabeçalho
      worksheet.columns = [
        { header: "ID Devolução", key: "devolucao_id", width: 12 },
        { header: "Origem", key: "origem", width: 20 },
        { header: "Cliente", key: "cliente", width: 25 },
        { header: "Produto", key: "produto", width: 20 },
        { header: "Código", key: "codigo", width: 15 },
        { header: "Obs. Devolução", key: "obs_devolucao", width: 30 },
        { header: "Data Devolução", key: "data_devolucao", width: 18 },
        { header: "Tipo Item", key: "tipo_item", width: 15 },
        { header: "ID Item", key: "item_id", width: 12 },
        { header: "Defeito", key: "defeito", width: 30 },
        { header: "Descrição/Configuração", key: "descricao", width: 50 },
        { header: "Observação", key: "observacao_item", width: 30 }
      ];

      // Adicionar título
      worksheet.insertRow(1, [`Relatório SAC - Período: ${dataRelatorio}`]);
      worksheet.mergeCells('A1:L1');
      worksheet.getRow(1).font = { bold: true, size: 14 };
      worksheet.getRow(1).alignment = { horizontal: 'center' };

      // Preencher dados - COM VERIFICAÇÃO DE SEGURANÇA
      let linhaAtual = 3;

      if (Array.isArray(dados) && dados.length > 0) {
        dados.forEach(devolucao => {
          // Garantir que devolucao.itens é um array
          const itens = devolucao.itens || [];

          if (itens.length === 0) {
            worksheet.addRow({
              devolucao_id: devolucao.devolucao_id || '',
              origem: devolucao.origem || '',
              cliente: devolucao.cliente || '',
              produto: devolucao.produto || '',
              codigo: devolucao.codigo || '',
              obs_devolucao: devolucao.obs_devolucao || '',
              data_devolucao: devolucao.data_devolucao || dataRelatorio,
              tipo_item: "Nenhum item",
              item_id: "",
              defeito: "",
              descricao: "Nenhum item associado a esta devolução",
              observacao_item: ""
            });
            linhaAtual++;
          } else {
            itens.forEach((item, idx) => {
              worksheet.addRow({
                devolucao_id: idx === 0 ? (devolucao.devolucao_id || '') : "",
                origem: idx === 0 ? (devolucao.origem || '') : "",
                cliente: idx === 0 ? (devolucao.cliente || '') : "",
                produto: idx === 0 ? (devolucao.produto || '') : "",
                codigo: idx === 0 ? (devolucao.codigo || '') : "",
                obs_devolucao: idx === 0 ? (devolucao.obs_devolucao || '') : "",
                data_devolucao: idx === 0 ? (devolucao.data_devolucao || dataRelatorio) : "",
                tipo_item: item.tipo || '',
                item_id: item.item_id || '',
                defeito: item.defeito || '',
                descricao: item.descricao || '',
                observacao_item: item.observacao || ''
              });
              linhaAtual++;
            });
          }
        });
      } else {
        // Se não houver dados, adicionar mensagem
        worksheet.addRow(["Nenhum registro encontrado para a data especificada"]);
        linhaAtual++;
      }

      // Adicionar estatísticas
      worksheet.addRow([]);
      worksheet.addRow(["RESUMO DO PERÍODO:"]);
      worksheet.addRow([`Total de devoluções: ${totalDevolucoes}`]);
      worksheet.addRow([`Total de itens associados: ${totalItens}`]);

      // Configurar resposta
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=relatorio_sac_semanal_${dataRelatorio}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error("Erro ao gerar relatório SAC semanal (compatibilidade /diario):", error.message);
      res.status(500).json({
        error: "Erro interno ao gerar relatório",
        details: error.message
      });
    }
  }
}

module.exports = RelatorioController;