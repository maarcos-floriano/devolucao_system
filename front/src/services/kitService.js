import api from './api';

const kitService = {
  async create(kitData) {
    const response = await api.post('/api/kits', kitData);
    return response.data;
  },

  async getAll(page = 1, limit = 10, search = '') {
    const response = await api.get('/api/kits', {
      params: { page, limit, search }
    });
    return response.data;
  },

  async exportToExcel() {
    const response = await this.getAll(1, 1000);
    return response.dados || response;
  }
};

export default kitService;