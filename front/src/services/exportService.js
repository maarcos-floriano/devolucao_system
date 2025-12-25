import * as XLSX from 'xlsx';

const exportService = {
  exportToExcel(data, filename, sheetName = 'Sheet1') {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `${filename}_${today}.xlsx`);
  },

  exportMaquinasToExcel(data) {
    this.exportToExcel(data, 'resumo_maquinas', 'Resumo do Dia');
  },

  exportMonitoresToExcel(data) {
    this.exportToExcel(data, 'resumo_monitores', 'Resumo do Dia');
  },

  exportDevolucoesToExcel(data) {
    this.exportToExcel(data, 'devolucao', 'Resumo Devolução');
  },

  exportKitsToExcel(data) {
    this.exportToExcel(data, 'resumo_kits', 'Resumo do Dia');
  }
};

export default exportService;