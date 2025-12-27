// Simulação - substitua pela sua API real
const monitorService = {
  async create(monitorData) {
    return { id: Math.floor(Math.random() * 1000) + 1 };
  },

  async getAll() {
    // Simulação
    return [];
  },

  async getToday() {
    // Simulação
    return [];
  }
};

export default monitorService;