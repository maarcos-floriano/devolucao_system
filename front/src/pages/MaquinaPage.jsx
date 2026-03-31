import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Save, Print, Refresh, Download, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import MaquinaForm from '../components/forms/MaquinaForm';
import DataTable from '../components/tables/DataTable';
import SearchBar from '../components/tables/SearchBar';
import maquinaService from '../services/maquinaService';
import { useAuth } from '../contexts/AuthContext';

const MaquinaPage = () => {
  const { hasRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [maquinas, setMaquinas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [editingMaquina, setEditingMaquina] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [maquinaToDelete, setMaquinaToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [configuracoes, setConfiguracoes] = useState([]);
  const [newConfig, setNewConfig] = useState({ codigo: '', config: '' });
  const [creatingConfig, setCreatingConfig] = useState(false);

  const formDataInicial = { codigo: '', config: '', configId: '' };
  const [formData, setFormData] = useState(formDataInicial);

  const canEdit = () => hasRole('admin') || hasRole('tecnico');
  const canDelete = () => hasRole('admin');

  const loadConfiguracoes = useCallback(async () => {
    try {
      const resp = await maquinaService.getConfigs();
      setConfiguracoes(resp || []);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  }, []);

  const loadMaquinas = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await maquinaService.getAll(page + 1, rowsPerPage, searchTerm);
      setMaquinas(resp.dados || []);
      setTotalRows(resp.total || 0);
    } catch (error) {
      alert('Erro ao carregar máquinas');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    loadMaquinas();
  }, [loadMaquinas]);

  useEffect(() => {
    loadConfiguracoes();
  }, [loadConfiguracoes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.codigo || !formData.config) {
      alert('Informe código e configuração');
      return;
    }

    setSubmitting(true);
    try {
      const res = await maquinaService.create({ codigo: formData.codigo, config: formData.config });
      alert('Máquina cadastrada!');
      handlePrint({ id: res.data?.id || res.id, ...formData });
      setFormData(formDataInicial);
      loadMaquinas();
    } catch (error) {
      alert('Erro ao salvar máquina');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateConfig = async () => {
    if (!hasRole('admin')) return;
    if (!newConfig.codigo || !newConfig.config) {
      alert('Preencha código e configuração');
      return;
    }

    setCreatingConfig(true);
    try {
      await maquinaService.createConfig(newConfig);
      alert('Configuração criada com sucesso');
      setNewConfig({ codigo: '', config: '' });
      loadConfiguracoes();
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao criar configuração');
    } finally {
      setCreatingConfig(false);
    }
  };

  const handleEditClick = (maquina) => {
    if (!canEdit()) return;
    setEditingMaquina(maquina);
    setFormData({ codigo: maquina.codigo || '', config: maquina.config || '', configId: '' });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMaquina) return;
    setSubmitting(true);
    try {
      await maquinaService.update(editingMaquina.id, { codigo: formData.codigo, config: formData.config });
      alert('Máquina atualizada com sucesso!');
      setEditDialogOpen(false);
      loadMaquinas();
    } catch (error) {
      alert('Erro ao atualizar máquina');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (maquina) => {
    if (!canDelete()) return;
    setMaquinaToDelete(maquina);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!maquinaToDelete) return;
    setDeleting(true);
    try {
      await maquinaService.delete(maquinaToDelete.id);
      alert('Máquina excluída com sucesso!');
      setDeleteDialogOpen(false);
      loadMaquinas();
    } catch (error) {
      alert('Erro ao excluir máquina');
    } finally {
      setDeleting(false);
    }
  };

  const handlePrint = (maquina) => {
    const data = maquina.id === 'new' ? formData : maquina;
    const janela = window.open('', '_blank');
    janela.document.write(`<html><body onload="window.print();window.close();"><h2>ID: ${data.id || ''}</h2><p><b>${data.codigo}</b></p><p>${data.config}</p></body></html>`);
    janela.document.close();
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'codigo', headerName: 'Código', width: 180 },
    { field: 'config', headerName: 'Configuração', width: 560 },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, color: '#15803d' }}>Máquinas</Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3, border: '2px solid', borderColor: 'primary.main', borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 2, color: 'primary.dark' }}>Cadastro de Máquina</Typography>

        <MaquinaForm formData={formData} onChange={setFormData} configuracoes={configuracoes} loading={submitting} />

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button variant="contained" startIcon={<Save />} onClick={handleSubmit} disabled={submitting} sx={{ flex: 1, py: 1.5 }}>
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Salvar Máquina'}
          </Button>
          <Button variant="outlined" startIcon={<Print />} onClick={() => handlePrint({ id: 'new', ...formData })} sx={{ flex: 1, py: 1.5 }}>
            Imprimir Etiqueta
          </Button>
        </Box>
      </Paper>

      {hasRole('admin') && (
        <Paper elevation={2} sx={{ p: 3, mb: 3, border: '2px dashed', borderColor: 'warning.main', borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>Admin - Criar configuração do ENUM</Typography>
          <Alert severity="info" sx={{ mb: 2 }}>A tabela inicia vazia. Cadastre aqui novas opções de configuração para o select dos técnicos.</Alert>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '200px 1fr auto' }, gap: 2 }}>
            <TextField label="Código" value={newConfig.codigo} onChange={(e) => setNewConfig((prev) => ({ ...prev, codigo: e.target.value }))} />
            <TextField label="Configuração" value={newConfig.config} onChange={(e) => setNewConfig((prev) => ({ ...prev, config: e.target.value }))} />
            <Button variant="contained" onClick={handleCreateConfig} disabled={creatingConfig}>{creatingConfig ? 'Salvando...' : 'Criar'}</Button>
          </Box>
        </Paper>
      )}

      <Paper elevation={2} sx={{ p: 3, border: '2px solid', borderColor: 'primary.main', borderRadius: 3, height: '90vh', overflow: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Máquinas cadastradas</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<Refresh />} onClick={loadMaquinas} disabled={loading} size="small">Atualizar</Button>
            <Button variant="contained" startIcon={<Download />} size="small" disabled>Exportar Excel</Button>
          </Box>
        </Box>

        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Pesquisar por código/config..." sx={{ mb: 2 }} />

        <DataTable
          columns={columns}
          data={maquinas}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={totalRows}
          onPageChange={setPage}
          onRowsPerPageChange={(v) => { setRowsPerPage(v); setPage(0); }}
          onPrint={handlePrint}
          onEdit={canEdit() ? handleEditClick : null}
          onDelete={canDelete() ? handleDeleteClick : null}
          loading={loading}
        />
      </Paper>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle><EditIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Editar Máquina #{editingMaquina?.id}</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <MaquinaForm formData={formData} onChange={setFormData} configuracoes={configuracoes} loading={submitting} />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)} variant="outlined" disabled={submitting}>Cancelar</Button>
          <Button onClick={handleSaveEdit} variant="contained" startIcon={<Save />} disabled={submitting}>Salvar Alterações</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle><DeleteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Excluir Máquina #{maquinaToDelete?.id}</DialogTitle>
        <DialogContent sx={{ pt: 3 }}><Typography>Código: {maquinaToDelete?.codigo}</Typography><Typography>Config: {maquinaToDelete?.config}</Typography></DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined" disabled={deleting}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} variant="contained" startIcon={<DeleteIcon />} disabled={deleting}>{deleting ? <CircularProgress size={24} color="inherit" /> : 'Excluir Máquina'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaquinaPage;
