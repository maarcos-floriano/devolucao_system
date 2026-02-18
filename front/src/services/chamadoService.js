import api from './api';

const chamadoService = {
  async getAll({ page = 1, limit = 10, search = '', status = '' } = {}) {
    const response = await api.get('/chamados', {
      params: { page, limit, search, status: status || undefined },
    });
    return response.data;
  },

  async create(payload) {
    const response = await api.post('/chamados', payload);
    return response.data;
  },

  async update(id, payload) {
    const response = await api.put(`/chamados/${id}`, payload);
    return response.data;
  },

  async getOpenCount() {
    const response = await api.get('/chamados/abertos/contador');
    return response.data;
  },
};

export default chamadoService;
