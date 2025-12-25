import api from './api';

const devolucaoService = {
  async create(devolucaoData) {
    const response = await api.post('/api/devolucao', devolucaoData);
    return response.data;
  },

  async getAll(page = 1, limit = 10, search = '') {
    const response = await api.get('/api/devolucao', {
      params: { page, limit, search }
    });
    return response.data;
  },

  async getToday() {
    const response = await api.get('/api/devolucao/dia');
    return response.data;
  },

  async getLast() {
    const response = await api.get('/api/devolucao/ultima');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/api/devolucao/${id}`);
    return response.data;
  },

  async update(id, field, value) {
    const response = await api.put(`/api/devolucao/${id}`, { field, value });
    return response.data;
  },

  async exportToExcel() {
    const devolucoes = await this.getToday();
    return devolucoes;
  },

  async getDevolucoesForSelect(search = '') {
    const response = await this.getAll(1, 100, search);
    return response.dados;
  }
};

export default devolucaoService;