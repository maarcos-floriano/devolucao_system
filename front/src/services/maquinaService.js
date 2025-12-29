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

  async getAll(page = 1, limit = 10, search = '') {
    const res = await api.get('/maquinas', {
      params: { page, limit, search }
    });
    return res.data; // { pagina, totalPaginas, totalRegistros, dados }
  },

  async getToday() {
    const res = await api.get('/maquinas/dia');
    return res.data; // { data: [...] }
  },

  async printLabel(id) {
    // Se houver endpoint de impressão, usar aqui; por enquanto só simula
    try {
      await api.get(`/maquinas/${id}`);
      return true;
    } catch (err) {
      console.error('Erro ao solicitar etiqueta:', err);
      return false;
    }
  },
};

export default maquinaService;