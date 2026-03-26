import React, { useState, useEffect, useCallback } from 'react';
import { Paper, Typography, Box, Button, Alert, CircularProgress } from '@mui/material';
import { Save, Refresh, Download } from '@mui/icons-material';
import MaquinaForm from '../components/forms/MaquinaForm';
import DataTable from '../components/tables/DataTable';
import SearchBar from '../components/tables/SearchBar';
import maquinaService from '../services/maquinaService';
import skuService from '../services/skuService';
import { useAuth } from '../contexts/AuthContext';

const MaquinaPage = () => {
  const { hasRole, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [maquinas, setMaquinas] = useState([]);
  const [skus, setSkus] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [newSku, setNewSku] = useState({ sku: '', codigo: '' });

  const [formData, setFormData] = useState({
    skuId: '',
    sku: '',
    codigo: '',
    quantidade: 1,
    origem: '',
    responsavel: '',
    defeito: '',
  });

  const loadSkus = useCallback(async () => {
    const data = await skuService.getAll('maquinas');
    setSkus(data);
  }, []);

  const loadMaquinas = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await maquinaService.getAll(page + 1, rowsPerPage, searchTerm);
      setMaquinas(resp.dados || []);
      setTotalRows(resp.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => { loadSkus(); }, [loadSkus]);
  useEffect(() => { loadMaquinas(); }, [loadMaquinas]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await maquinaService.create(formData);
      alert('Máquina cadastrada com sucesso');
      setFormData({ skuId: '', sku: '', codigo: '', quantidade: 1, origem: '', responsavel: '', defeito: '' });
      loadMaquinas();
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao salvar máquina');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSku = async () => {
    if (!hasRole('admin')) {
      alert('Somente administrador pode criar SKU');
      return;
    }

    await skuService.create('maquinas', { ...newSku, role: user?.role });
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
      <Typography variant="h4" gutterBottom sx={{ mb: 3, color: '#15803d' }}>Máquinas</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Cadastro por SKU</Typography>
        <MaquinaForm formData={formData} onChange={setFormData} skus={skus} loading={submitting} />
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button variant="contained" startIcon={<Save />} onClick={handleSubmit} disabled={submitting}>
            {submitting ? <CircularProgress size={18} color="inherit" /> : 'Salvar Máquina'}
          </Button>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>Somente administrador pode criar novos SKUs.</Alert>
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <input placeholder="Novo SKU" value={newSku.sku} onChange={(e) => setNewSku((p) => ({ ...p, sku: e.target.value }))} style={{ flex: 1 }} />
          <input placeholder="Código" value={newSku.codigo} onChange={(e) => setNewSku((p) => ({ ...p, codigo: e.target.value }))} style={{ width: 120 }} />
          <Button variant="outlined" disabled={!hasRole('admin')} onClick={handleCreateSku}>Criar SKU</Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Estoque de Máquinas</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<Refresh />} onClick={loadMaquinas}>Atualizar</Button>
            <Button variant="contained" startIcon={<Download />} onClick={() => alert('Exportação em desenvolvimento')}>Exportar</Button>
          </Box>
        </Box>

        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Pesquisar por SKU/Código" sx={{ mb: 2 }} />
        <DataTable
          columns={columns}
          data={maquinas}
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

export default MaquinaPage;
