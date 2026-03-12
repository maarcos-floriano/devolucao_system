import api from './api';

const rmaService = {
  async getAll(page = 1, limit = 10, search = '') {
    const response = await api.get('/rma', { params: { page, limit, search } });
    return response.data;
  },

  async create(payload) {
    const response = await api.post('/rma', payload);
    return response.data;
  },

  async remove(id) {
    const response = await api.delete(`/rma/${id}`);
    return response.data;
  },

  async getDevolucoesSemVinculo() {
    const response = await api.get('/rma/relatorio/devolucoes-sem-vinculo');
    return response.data;
  },
};

export default rmaService;
