// Simulação - substitua pela sua API real
const maquinaService = {
  async create(maquinaData) {
    console.log('Salvando máquina:', maquinaData);
    return { id: Math.floor(Math.random() * 1000) + 1 };
  },

  async getAll(page = 1, limit = 10, search = '') {
    // Simulação
    return {
      dados: [],
      totalRegistros: 0,
      pagina: page,
      totalPaginas: 1
    };
  },

  async getToday() {
    // Simulação
    return [];
  },

  async printLabel(id) {
    console.log('Imprimindo etiqueta para máquina ID:', id);
    return true;
  }
};

export default maquinaService;