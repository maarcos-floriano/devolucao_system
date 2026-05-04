import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Download,
  Edit as EditIcon,
  Print,
  Refresh,
  Save,
} from '@mui/icons-material';
import MaquinaForm from '../components/forms/MaquinaForm';
import DataTable from '../components/tables/DataTable';
import SearchBar from '../components/tables/SearchBar';
import maquinaService from '../services/maquinaService';
import { useAuth } from '../contexts/AuthContext';
import { printMaquinaLabel } from '../utils/labelPrinter';

const formDataInicial = { codigo: '', config: '', configId: '', defeito: '' };

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
  const [loadingConfiguracoes, setLoadingConfiguracoes] = useState(false);
  const [adminConfiguracoes, setAdminConfiguracoes] = useState([]);
  const [adminConfigSearch, setAdminConfigSearch] = useState('');
  const [newConfig, setNewConfig] = useState({ codigo: '', config: '' });
  const [editingConfigId, setEditingConfigId] = useState(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [formData, setFormData] = useState(formDataInicial);

  const canEdit = () => hasRole('admin') || hasRole('tecnico');
  const canDelete = () => hasRole('admin');

  const loadConfiguracoes = useCallback(async () => {
    setLoadingConfiguracoes(true);
    try {
      const resp = await maquinaService.getConfigs('');
      setConfiguracoes(resp || []);
    } catch (error) {
      console.error('Erro ao carregar SKUs:', error);
      setConfiguracoes([]);
    } finally {
      setLoadingConfiguracoes(false);
    }
  }, []);

  const loadAdminConfiguracoes = useCallback(async (search = adminConfigSearch) => {
    const term = search.trim();
    if (term.length < 2) {
      setAdminConfiguracoes([]);
      return;
    }

    try {
      const resp = await maquinaService.getConfigs(term);
      setAdminConfiguracoes(resp || []);
    } catch (error) {
      console.error('Erro ao carregar configuracoes:', error);
    }
  }, [adminConfigSearch]);

  const loadMaquinas = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await maquinaService.getAll(page + 1, rowsPerPage, searchTerm);
      setMaquinas(resp.dados || []);
      setTotalRows(resp.total || 0);
    } catch (error) {
      alert('Erro ao carregar maquinas');
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

  const resetMachineForm = () => {
    setFormData(formDataInicial);
  };

  const validateMachineForm = () => {
    if (!formData.codigo || !formData.config || !formData.defeito?.trim()) {
      alert('Informe SKU de configuracao e o defeito identificado antes de registrar.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateMachineForm()) return;

    setSubmitting(true);
    try {
      const res = await maquinaService.create({
        codigo: formData.codigo,
        config: formData.config,
        defeito: formData.defeito,
      });
      const maquina = { id: res.data?.id || res.id, ...formData };
      alert('Maquina cadastrada!');
      printMaquinaLabel(maquina);
      resetMachineForm();
      loadMaquinas();
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao salvar maquina');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!hasRole('admin')) return;
    if (!newConfig.codigo || !newConfig.config) {
      alert('Preencha codigo e configuracao');
      return;
    }

    setSavingConfig(true);
    try {
      if (editingConfigId) {
        await maquinaService.updateConfig(editingConfigId, newConfig);
        alert('Configuracao atualizada com sucesso');
      } else {
        await maquinaService.createConfig(newConfig);
        alert('Configuracao criada com sucesso');
      }

      setNewConfig({ codigo: '', config: '' });
      setEditingConfigId(null);
      loadAdminConfiguracoes();
      loadConfiguracoes();
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao salvar configuracao');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleEditConfig = (config) => {
    setEditingConfigId(config.id);
    setNewConfig({ codigo: config.codigo || '', config: config.config || '' });
  };

  const handleDeleteConfig = async (config) => {
    if (!window.confirm(`Excluir configuracao ${config.codigo}?`)) return;

    try {
      await maquinaService.deleteConfig(config.id);
      loadAdminConfiguracoes();
      loadConfiguracoes();
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao excluir configuracao');
    }
  };

  const handleEditClick = (maquina) => {
    if (!canEdit()) return;
    setEditingMaquina(maquina);
    setFormData({
      codigo: maquina.codigo || '',
      config: maquina.config || '',
      configId: '',
      defeito: maquina.defeito || '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMaquina || !validateMachineForm()) return;

    setSubmitting(true);
    try {
      await maquinaService.update(editingMaquina.id, {
        codigo: formData.codigo,
        config: formData.config,
        defeito: formData.defeito,
      });
      alert('Maquina atualizada com sucesso!');
      setEditDialogOpen(false);
      resetMachineForm();
      loadMaquinas();
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao atualizar maquina');
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
      alert('Maquina excluida com sucesso!');
      setDeleteDialogOpen(false);
      loadMaquinas();
    } catch (error) {
      alert('Erro ao excluir maquina');
    } finally {
      setDeleting(false);
    }
  };

  const handlePrint = (maquina) => {
    try {
      printMaquinaLabel(maquina.id === 'new' ? formData : maquina);
    } catch (error) {
      alert(error.message || 'Erro ao imprimir etiqueta');
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'codigo', headerName: 'Codigo', width: 180 },
    { field: 'config', headerName: 'Configuracao', width: 420 },
    { field: 'defeito', headerName: 'Defeito', width: 220 },
    { field: 'data_registro', headerName: 'Data Registro', width: 180, type: 'datetime' },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: { xs: 2, md: 3 }, color: '#15803d', fontSize: { xs: 26, md: 34 } }}>
        Maquinas
      </Typography>

      <Paper elevation={1} sx={{ p: { xs: 1.5, md: 3 }, mb: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'primary.dark' }}>
          Cadastro de Maquina
        </Typography>

        <MaquinaForm
          formData={formData}
          onChange={setFormData}
          configuracoes={configuracoes}
          loading={submitting || loadingConfiguracoes}
          isAdmin={hasRole('admin')}
        />

        <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          <Button variant="contained" startIcon={<Save />} onClick={handleSubmit} disabled={submitting} fullWidth>
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Salvar Maquina'}
          </Button>
          <Button variant="outlined" startIcon={<Print />} onClick={() => handlePrint({ id: 'new', ...formData })} fullWidth>
            Imprimir Etiqueta
          </Button>
        </Box>
      </Paper>

      {hasRole('admin') && (
        <Paper elevation={1} sx={{ p: { xs: 1.5, md: 3 }, mb: 2, border: '1px dashed', borderColor: 'warning.main', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>ADM - SKUs de configuracao</Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Tecnicos usam apenas os SKUs cadastrados aqui.
          </Alert>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '180px 1fr auto auto' }, gap: 1.5, mb: 2 }}>
            <TextField label="Codigo" value={newConfig.codigo} onChange={(e) => setNewConfig((prev) => ({ ...prev, codigo: e.target.value }))} />
            <TextField label="Configuracao" value={newConfig.config} onChange={(e) => setNewConfig((prev) => ({ ...prev, config: e.target.value }))} />
            <Button variant="contained" onClick={handleSaveConfig} disabled={savingConfig}>
              {savingConfig ? 'Salvando...' : editingConfigId ? 'Atualizar' : 'Criar'}
            </Button>
            {editingConfigId && (
              <Button variant="outlined" onClick={() => { setEditingConfigId(null); setNewConfig({ codigo: '', config: '' }); }}>
                Cancelar
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr auto' }, gap: 1.5, mb: 2 }}>
            <TextField
              label="Pesquisar SKUs cadastrados"
              value={adminConfigSearch}
              onChange={(e) => setAdminConfigSearch(e.target.value)}
              placeholder="Codigo ou configuracao"
            />
            <Button variant="outlined" onClick={() => loadAdminConfiguracoes(adminConfigSearch)}>
              Buscar
            </Button>
          </Box>

          <Box sx={{ display: 'grid', gap: 1 }}>
            {adminConfiguracoes.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Pesquise por pelo menos 2 caracteres para carregar somente os SKUs que deseja editar.
              </Typography>
            )}
            {adminConfiguracoes.map((config) => (
              <Box
                key={config.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr auto', md: '160px 1fr auto' },
                  gap: 1,
                  alignItems: 'center',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1,
                  backgroundColor: 'white',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{config.codigo}</Typography>
                <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{config.config}</Typography>
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => handleEditConfig(config)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton size="small" color="error" onClick={() => handleDeleteConfig(config)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      <Paper
        elevation={1}
        sx={{
          p: { xs: 1.5, md: 3 },
          border: '1px solid',
          borderColor: 'primary.main',
          borderRadius: 1,
          height: { xs: 'auto', md: '86vh' },
          overflow: 'auto',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Typography variant="h6">Maquinas cadastradas</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button variant="outlined" startIcon={<Refresh />} onClick={loadMaquinas} disabled={loading} size="small">Atualizar</Button>
            <Button variant="contained" startIcon={<Download />} size="small" disabled>Exportar Excel</Button>
          </Box>
        </Box>

        <SearchBar
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            setPage(0);
          }}
          placeholder="Pesquisar por codigo, configuracao, defeito ou data..."
          sx={{ mb: 2 }}
        />

        <DataTable
          columns={columns}
          data={maquinas}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={totalRows}
          onPageChange={setPage}
          onRowsPerPageChange={(value) => {
            setRowsPerPage(value);
            setPage(0);
          }}
          onPrint={handlePrint}
          onEdit={canEdit() ? handleEditClick : null}
          onDelete={canDelete() ? handleDeleteClick : null}
          loading={loading}
        />
      </Paper>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <EditIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Editar Maquina #{editingMaquina?.id}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <MaquinaForm
            formData={formData}
            onChange={setFormData}
            configuracoes={configuracoes}
            loading={submitting || loadingConfiguracoes}
            isAdmin={hasRole('admin')}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'stretch' }}>
          <Button onClick={() => setEditDialogOpen(false)} variant="outlined" disabled={submitting}>Cancelar</Button>
          <Button onClick={handleSaveEdit} variant="contained" startIcon={<Save />} disabled={submitting}>Salvar Alteracoes</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <DeleteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Excluir Maquina #{maquinaToDelete?.id}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography>Codigo: {maquinaToDelete?.codigo}</Typography>
          <Typography>Config: {maquinaToDelete?.config}</Typography>
          <Typography>Defeito: {maquinaToDelete?.defeito || 'N/A'}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined" disabled={deleting}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} variant="contained" startIcon={<DeleteIcon />} disabled={deleting} color="error">
            {deleting ? <CircularProgress size={24} color="inherit" /> : 'Excluir Maquina'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaquinaPage;
