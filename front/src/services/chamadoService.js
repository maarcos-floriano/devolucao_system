import api from './api';

const chamadoService = {
  async getAll({ page = 1, limit = 10, search = '', status = '', tipo = '' } = {}) {
    const response = await api.get('/chamados', {
      params: { page, limit, search, status: status || undefined, tipo: tipo || undefined },
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

  async delete(id) {
    const response = await api.delete(`/chamados/${id}`);
    return response.data;
  },

  async getOpenCount() {
    const response = await api.get('/chamados/abertos/contador');
    return response.data;
  },

  async findMatches({ cliente = '', produto = '', codigo = '' } = {}) {
    const response = await api.get('/chamados/matches', {
      params: { cliente, produto, codigo },
    });
    return response.data;
  },
};

export default chamadoService;
