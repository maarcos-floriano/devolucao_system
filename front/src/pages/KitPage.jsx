import React, { useState, useEffect, useCallback } from 'react';
import { Paper, Typography, Box, Button, Alert, CircularProgress } from '@mui/material';
import { Save, Refresh, Download } from '@mui/icons-material';
import KitForm from '../components/forms/KitForm';
import DataTable from '../components/tables/DataTable';
import SearchBar from '../components/tables/SearchBar';
import api from '../services/api';
import skuService from '../services/skuService';
import { useAuth } from '../contexts/AuthContext';

const KitPage = () => {
  const { hasRole, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [kits, setKits] = useState([]);
  const [skus, setSkus] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [newSku, setNewSku] = useState({ sku: '', codigo: '' });

  const [formData, setFormData] = useState({ skuId: '', sku: '', codigo: '', quantidade: 1, origem: '', responsavel: '', defeito: '' });

  const loadSkus = useCallback(async () => {
    setSkus(await skuService.getAll('kits'));
  }, []);

  const loadKits = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/kits', { params: { page: page + 1, limit: rowsPerPage, search: searchTerm } });
      setKits(response.data.dados || []);
      setTotalRows(response.data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => { loadSkus(); }, [loadSkus]);
  useEffect(() => { loadKits(); }, [loadKits]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/kits', formData);
      setFormData({ skuId: '', sku: '', codigo: '', quantidade: 1, origem: '', responsavel: '', defeito: '' });
      loadKits();
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSku = async () => {
    if (!hasRole('admin')) return alert('Somente administrador pode criar SKU');
    await skuService.create('kits', { ...newSku, role: user?.role });
    setNewSku({ sku: '', codigo: '' });
    loadSkus();
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'sku', headerName: 'SKU', width: 420 },
    { field: 'codigo', headerName: 'Código', width: 120 },
    { field: 'quantidade', headerName: 'Quantidade', width: 120 },
    { field: 'defeito', headerName: 'Defeito', width: 240 },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>Kits</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Cadastro de Kit por SKU</Typography>
        <KitForm formData={formData} onChange={setFormData} loading={submitting} skus={skus} />
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button variant="contained" startIcon={<Save />} onClick={handleSubmit} disabled={submitting}>
            {submitting ? <CircularProgress size={20} color="inherit" /> : 'Salvar Kit'}
          </Button>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>Somente administrador pode criar novos SKUs de kit.</Alert>
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <input placeholder="Novo SKU Kit" value={newSku.sku} onChange={(e) => setNewSku((p) => ({ ...p, sku: e.target.value }))} style={{ flex: 1 }} />
          <input placeholder="Código" value={newSku.codigo} onChange={(e) => setNewSku((p) => ({ ...p, codigo: e.target.value }))} style={{ width: 120 }} />
          <Button variant="outlined" disabled={!hasRole('admin')} onClick={handleCreateSku}>Criar SKU</Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Estoque de Kits</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button startIcon={<Refresh />} onClick={loadKits} disabled={loading}>Atualizar</Button>
            <Button variant="contained" startIcon={<Download />} onClick={() => alert('Funcionalidade em desenvolvimento')}>Exportar Excel</Button>
          </Box>
        </Box>
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Pesquisar por SKU/Código" sx={{ mb: 2 }} />
        <DataTable
          columns={columns}
          data={kits}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={totalRows}
          onPageChange={setPage}
          onRowsPerPageChange={(value) => { setRowsPerPage(value); setPage(0); }}
          loading={loading}
        />
      </Paper>
    </Box>
  );
};

export default KitPage;
