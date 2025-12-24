import api from './api';

const maquinaService = {
  // Criar nova máquina
  async create(maquinaData) {
    const response = await api.post('/api/maquinas', maquinaData);
    return response.data;
  },

  // Listar todas as máquinas
  async getAll(page = 1, limit = 10, search = '') {
    const response = await api.get('/api/maquinas', {
      params: { page, limit, search }
    });
    return response.data;
  },

  // Listar máquinas do dia
  async getToday() {
    const response = await api.get('/api/maquinas/dia');
    return response.data;
  },

  // Buscar máquina por ID
  async getById(id) {
    const response = await api.get(`/api/maquinas/${id}`);
    return response.data;
  },

  // Atualizar máquina
  async update(id, maquinaData) {
    const response = await api.put(`/api/maquinas/${id}`, maquinaData);
    return response.data;
  },

  // Excluir máquina
  async delete(id) {
    const response = await api.delete(`/api/maquinas/${id}`);
    return response.data;
  },

  // Imprimir etiqueta
  async printLabel(id) {
    const response = await api.post(`/api/maquinas/${id}/print`, {}, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Exportar para Excel
  async exportToExcel() {
    const response = await api.get('/api/maquinas/export', {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default maquinaService;