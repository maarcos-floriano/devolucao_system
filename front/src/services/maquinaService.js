import api from './api';

const maquinaService = {
  async create(payload) {
    const res = await api.post('/maquinas', payload);
    return res.data;
  },

  async update(id, payload) {
    const res = await api.put(`/maquinas/${id}`, payload);
    return res.data;
  },

  async delete(id) {
    const res = await api.delete(`/maquinas/${id}`);
    return res.data;
  },

  async getAll(page = 1, limit = 10, search = '') {
    const res = await api.get('/maquinas', { params: { page, limit, search } });
    return res.data;
  },

  async getConfigs(search = '') {
    const res = await api.get('/maquinas/configuracoes', { params: { search } });
    return res.data.data || [];
  },

  async createConfig(payload) {
    const res = await api.post('/maquinas/configuracoes', payload);
    return res.data;
  },
};

export default maquinaService;
