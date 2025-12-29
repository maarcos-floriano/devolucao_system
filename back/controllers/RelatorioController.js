const ExcelJS = require('exceljs');
const Relatorio = require('../models/Relatorio');

class RelatorioController {
  // Relatório Excel simples por tabela e data
  static async relatorioExcel(req, res) {
    try {
      const { tabela } = req.params;
      const { data } = req.query;

      const tabelasPermitidas = ["devolucao", "maquinas", "monitores", "kit"];
      if (!tabelasPermitidas.includes(tabela)) {
        return res.status(400).json({ error: "Tabela inválida" });
      }

      const sql = `SELECT * FROM ${tabela} WHERE DATE(data) = ? ORDER BY data DESC`;
      const [rows] = await DualDatabase.executeOnMainPool(sql, [data]);

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
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=relatorio_${tabela}_${data}.xlsx`
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

      dados.forEach(r => worksheet.addRow(r));

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

      dados.forEach(r => worksheet.addRow(r));

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

      dados.forEach(r => worksheet.addRow(r));

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

  // Relatório SAC semanal
  static async relatorioSACSemanal(req, res) {
    try {
      const { dataInicio, dataFim } = req.query;
      const resultado = await Relatorio.relatorioSACSemanal(dataInicio, dataFim);

      // Gerar Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`Relatório SAC - ${resultado.periodo.inicio} a ${resultado.periodo.fim}`);

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
      worksheet.insertRow(1, [`Relatório SAC - Período: ${resultado.periodo.inicio} a ${resultado.periodo.fim}`]);
      worksheet.mergeCells('A1:L1');
      worksheet.getRow(1).font = { bold: true, size: 14 };
      worksheet.getRow(1).alignment = { horizontal: 'center' };

      // Preencher dados
      let linhaAtual = 3;
      resultado.dados.forEach(devolucao => {
        if (devolucao.itens.length === 0) {
          worksheet.addRow({
            devolucao_id: devolucao.devolucao_id,
            origem: devolucao.origem,
            cliente: devolucao.cliente,
            produto: devolucao.produto,
            codigo: devolucao.codigo,
            obs_devolucao: devolucao.obs_devolucao,
            data_devolucao: devolucao.data_devolucao,
            tipo_item: "Nenhum item",
            item_id: "",
            defeito: "",
            descricao: "Nenhum item associado a esta devolução",
            observacao_item: ""
          });
          linhaAtual++;
        } else {
          devolucao.itens.forEach((item, idx) => {
            worksheet.addRow({
              devolucao_id: idx === 0 ? devolucao.devolucao_id : "",
              origem: idx === 0 ? devolucao.origem : "",
              cliente: idx === 0 ? devolucao.cliente : "",
              produto: idx === 0 ? devolucao.produto : "",
              codigo: idx === 0 ? devolucao.codigo : "",
              obs_devolucao: idx === 0 ? devolucao.obs_devolucao : "",
              data_devolucao: idx === 0 ? devolucao.data_devolucao : "",
              tipo_item: item.tipo,
              item_id: item.item_id,
              defeito: item.defeito,
              descricao: item.descricao,
              observacao_item: item.observacao
            });
            linhaAtual++;
          });
        }
      });

      // Adicionar estatísticas
      worksheet.addRow([]);
      worksheet.addRow(["RESUMO DO PERÍODO:"]);
      worksheet.addRow([`Total de devoluções: ${resultado.totalDevolucoes}`]);
      worksheet.addRow([`Total de itens associados: ${resultado.totalItens}`]);

      // Configurar resposta
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=relatorio_sac_${resultado.periodo.inicio}_a_${resultado.periodo.fim}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error("Erro ao gerar relatório SAC semanal:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

  // Relatório SAC diário
  static async relatorioSACDiario(req, res) {
    try {
      const { data } = req.query;
      const resultado = await Relatorio.relatorioSACDiario(data);

      // Gerar Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`Relatório SAC - ${resultado.data}`);

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
      worksheet.insertRow(1, [`Relatório SAC - Dia: ${resultado.data}`]);
      worksheet.mergeCells('A1:L1');
      worksheet.getRow(1).font = { bold: true, size: 14 };
      worksheet.getRow(1).alignment = { horizontal: 'center' };

      // Preencher dados
      let linhaAtual = 3;
      resultado.dados.forEach(devolucao => {
        if (devolucao.itens.length === 0) {
          worksheet.addRow({
            devolucao_id: devolucao.devolucao_id,
            origem: devolucao.origem,
            cliente: devolucao.cliente,
            produto: devolucao.produto,
            codigo: devolucao.codigo,
            obs_devolucao: devolucao.obs_devolucao,
            data_devolucao: devolucao.data_devolucao,
            tipo_item: "Nenhum item",
            item_id: "",
            defeito: "",
            descricao: "Nenhum item associado a esta devolução",
            observacao_item: ""
          });
          linhaAtual++;
        } else {
          devolucao.itens.forEach((item, idx) => {
            worksheet.addRow({
              devolucao_id: idx === 0 ? devolucao.devolucao_id : "",
              origem: idx === 0 ? devolucao.origem : "",
              cliente: idx === 0 ? devolucao.cliente : "",
              produto: idx === 0 ? devolucao.produto : "",
              codigo: idx === 0 ? devolucao.codigo : "",
              obs_devolucao: idx === 0 ? devolucao.obs_devolucao : "",
              data_devolucao: idx === 0 ? devolucao.data_devolucao : "",
              tipo_item: item.tipo,
              item_id: item.item_id,
              defeito: item.defeito,
              descricao: item.descricao,
              observacao_item: item.observacao
            });
            linhaAtual++;
          });
        }
      });

      // Adicionar estatísticas
      worksheet.addRow([]);
      worksheet.addRow(["RESUMO DO DIA:"]);
      worksheet.addRow([`Total de devoluções: ${resultado.totalDevolucoes}`]);
      worksheet.addRow([`Total de itens associados: ${resultado.totalItens}`]);

      // Configurar resposta
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=relatorio_sac_diario_${resultado.data}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error("Erro ao gerar relatório SAC diário:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = RelatorioController;
