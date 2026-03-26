import api from './api';

const skuService = {
  async getAll(tipo, search = '') {
    const res = await api.get(`/skus/${tipo}`, { params: { search } });
    return res.data?.data || [];
  },

  async create(tipo, payload) {
    const res = await api.post(`/skus/${tipo}`, payload);
    return res.data?.data;
  },
};

export default skuService;
