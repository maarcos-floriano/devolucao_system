import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Refresh, Save } from '@mui/icons-material';
import DataTable from '../components/tables/DataTable';
import SearchBar from '../components/tables/SearchBar';
import chamadoService from '../services/chamadoService';
import { ORIGENS } from '../utils/constants';

const initialFormData = {
  tipo: 'acompanhar_devolucao',
  cliente: '',
  origem: '',
  item_esperado: '',
  data_previsao: '',
  acesso_remoto_em: '',
  problema: '',
  observacao: '',
  email_solicitante: '',
  email_responsavel: '',
  status: 'aberto',
  acao_tomada: '',
  devolucao_id: '',
};

const tipoLabels = {
  acompanhar_devolucao: 'Ficar de olho',
  acesso_remoto: 'Acesso remoto',
  divergencia: 'Divergencia',
};

const toDateInput = (value) => {
  if (!value) return '';
  return String(value).slice(0, 10);
};

const toDateTimeInput = (value) => {
  if (!value) return '';
  return String(value).replace(' ', 'T').slice(0, 16);
};

const ChamadosPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [chamados, setChamados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('aberto');
  const [tipoFilter, setTipoFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingChamado, setEditingChamado] = useState(null);
  const [deletingChamado, setDeletingChamado] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  const loadChamados = useCallback(async () => {
    setLoading(true);
    try {
      const response = await chamadoService.getAll({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        status: statusFilter,
        tipo: tipoFilter,
      });

      setChamados(response.dados || []);
      setTotalRows(response.total || 0);
    } catch (error) {
      console.error('Erro ao carregar chamados:', error);
      setChamados([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, statusFilter, tipoFilter]);

  useEffect(() => {
    loadChamados();
  }, [loadChamados]);

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.cliente.trim()) {
      alert('Informe o cliente.');
      return false;
    }

    if (formData.tipo === 'acompanhar_devolucao' && (!formData.item_esperado.trim() || !formData.data_previsao)) {
      alert('Informe o que vai chegar e a data de previsao.');
      return false;
    }

    if (formData.tipo === 'acesso_remoto' && !formData.acesso_remoto_em) {
      alert('Informe a data/hora do acesso remoto.');
      return false;
    }

    return true;
  };

  const buildPayload = () => ({
    ...formData,
    devolucao_id: formData.devolucao_id ? Number(formData.devolucao_id) : null,
    problema: formData.problema || formData.observacao,
  });

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await chamadoService.create(buildPayload());
      setFormData(initialFormData);
      setPage(0);
      loadChamados();
      alert('Chamado registrado com sucesso');
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao registrar chamado');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (chamado) => {
    setEditingChamado(chamado);
    setFormData({
      tipo: chamado.tipo || 'acompanhar_devolucao',
      cliente: chamado.cliente || chamado.devolucao_cliente || '',
      origem: chamado.origem || chamado.devolucao_origem || '',
      item_esperado: chamado.item_esperado || chamado.produto || '',
      data_previsao: toDateInput(chamado.data_previsao),
      acesso_remoto_em: toDateTimeInput(chamado.acesso_remoto_em),
      problema: chamado.problema || '',
      observacao: chamado.observacao || '',
      email_solicitante: chamado.email_solicitante || '',
      email_responsavel: chamado.email_responsavel || '',
      status: chamado.status || 'aberto',
      acao_tomada: chamado.acao_tomada || '',
      devolucao_id: chamado.devolucao_id ? String(chamado.devolucao_id) : '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingChamado || !validateForm()) return;

    if (formData.status === 'resolvido' && !formData.acao_tomada.trim()) {
      alert('Para resolver o chamado, informe qual acao foi tomada.');
      return;
    }

    setSubmitting(true);
    try {
      await chamadoService.update(editingChamado.id, buildPayload());
      setEditDialogOpen(false);
      setEditingChamado(null);
      setFormData(initialFormData);
      loadChamados();
      alert('Chamado atualizado com sucesso');
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao atualizar chamado');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (chamado) => {
    setDeletingChamado(chamado);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingChamado) return;

    setSubmitting(true);
    try {
      await chamadoService.delete(deletingChamado.id);
      setDeleteDialogOpen(false);
      setDeletingChamado(null);
      loadChamados();
      alert('Chamado excluido com sucesso');
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao excluir chamado');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = useMemo(() => ([
    { field: 'id', headerName: 'ID', width: 60 },
    {
      field: 'tipo',
      headerName: 'Tipo',
      width: 140,
      render: (value) => tipoLabels[value] || value || '-',
    },
    { field: 'cliente', headerName: 'Cliente', width: 160 },
    { field: 'item_esperado', headerName: 'Vai chegar', width: 180 },
    { field: 'data_previsao', headerName: 'Previsao', width: 120, type: 'date' },
    { field: 'acesso_remoto_em', headerName: 'Acesso remoto', width: 160, type: 'datetime' },
    { field: 'problema', headerName: 'Descricao', width: 220 },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      render: (value) => (
        <Box
          component="span"
          sx={{
            px: 1.25,
            py: 0.5,
            borderRadius: 1,
            fontWeight: 700,
            color: value === 'aberto' ? '#991b1b' : '#065f46',
            backgroundColor: value === 'aberto' ? '#fee2e2' : '#d1fae5',
            textTransform: 'capitalize',
          }}
        >
          {value}
        </Box>
      ),
    },
    { field: 'devolucao_id', headerName: 'Devolucao', width: 100, render: (value) => value ? `#${value}` : '-' },
    { field: 'acao_tomada', headerName: 'Acao tomada', width: 220 },
    { field: 'criado_em', headerName: 'Criado em', width: 160, type: 'datetime' },
  ]), []);

  const renderChamadoForm = (isEditing = false) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '220px 1fr 1fr' }, gap: 1.5 }}>
      <TextField
        select
        label="Tipo"
        value={formData.tipo}
        onChange={(e) => updateForm('tipo', e.target.value)}
        fullWidth
      >
        <MenuItem value="acompanhar_devolucao">Ficar de olho</MenuItem>
        <MenuItem value="acesso_remoto">Acesso remoto</MenuItem>
        <MenuItem value="divergencia">Divergencia</MenuItem>
      </TextField>

      <TextField label="Cliente" value={formData.cliente} onChange={(e) => updateForm('cliente', e.target.value)} required fullWidth />

      <TextField
        select
        label="Origem"
        value={formData.origem}
        onChange={(e) => updateForm('origem', e.target.value)}
        fullWidth
      >
        <MenuItem value=""><em>Selecione...</em></MenuItem>
        {ORIGENS.map((origem) => (
          <MenuItem key={origem.value} value={origem.value}>{origem.label}</MenuItem>
        ))}
      </TextField>

      {formData.tipo === 'acompanhar_devolucao' && (
        <>
          <TextField
            label="O que vai chegar"
            value={formData.item_esperado}
            onChange={(e) => updateForm('item_esperado', e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Data de previsao"
            type="date"
            value={formData.data_previsao}
            onChange={(e) => updateForm('data_previsao', e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
            fullWidth
          />
        </>
      )}

      {formData.tipo === 'acesso_remoto' && (
        <TextField
          label="Data/hora do acesso"
          type="datetime-local"
          value={formData.acesso_remoto_em}
          onChange={(e) => updateForm('acesso_remoto_em', e.target.value)}
          InputLabelProps={{ shrink: true }}
          required
          fullWidth
        />
      )}

      <TextField
        label="E-mail de quem pediu"
        value={formData.email_solicitante}
        onChange={(e) => updateForm('email_solicitante', e.target.value)}
        fullWidth
      />

      <TextField
        label="E-mail para aviso"
        value={formData.email_responsavel}
        onChange={(e) => updateForm('email_responsavel', e.target.value)}
        fullWidth
      />

      <TextField
        label="Descricao"
        value={formData.problema}
        onChange={(e) => updateForm('problema', e.target.value)}
        multiline
        minRows={2}
        fullWidth
        sx={{ gridColumn: { xs: 'auto', md: '1 / -1' } }}
      />

      {isEditing && (
        <>
          <TextField
            select
            label="Status"
            value={formData.status}
            onChange={(e) => updateForm('status', e.target.value)}
            fullWidth
          >
            <MenuItem value="aberto">Aberto</MenuItem>
            <MenuItem value="resolvido">Resolvido</MenuItem>
          </TextField>
          <TextField
            label="Acao tomada"
            value={formData.acao_tomada}
            onChange={(e) => updateForm('acao_tomada', e.target.value)}
            multiline
            minRows={2}
            fullWidth
            sx={{ gridColumn: { xs: 'auto', md: 'span 2' } }}
          />
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: { xs: 2, md: 3 }, fontSize: { xs: 26, md: 34 } }}>
        Chamados SAC
      </Typography>

      <Paper elevation={1} sx={{ p: { xs: 1.5, md: 3 }, mb: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Abrir chamado
        </Typography>

        {renderChamadoForm(false)}

        <Button sx={{ mt: 2 }} variant="contained" startIcon={<Save />} onClick={handleSubmit} disabled={submitting} fullWidth>
          {submitting ? <CircularProgress size={22} color="inherit" /> : 'Registrar chamado'}
        </Button>

        <Alert severity="info" sx={{ mt: 2 }}>
          Ficar de olho fecha automaticamente quando uma devolucao do cliente for registrada. Acesso remoto envia aviso por e-mail quando SMTP estiver configurado.
        </Alert>
      </Paper>

      <Paper elevation={1} sx={{ p: { xs: 1.5, md: 3 }, border: '1px solid', borderColor: 'primary.main', borderRadius: 1, height: { xs: 'auto', md: '72vh' }, overflow: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, mb: 2, gap: 1.5, flexDirection: { xs: 'column', md: 'row' } }}>
          <Typography variant="h6">Chamados em acompanhamento</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '160px 180px auto' }, gap: 1 }}>
            <TextField
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="aberto">Aberto</MenuItem>
              <MenuItem value="resolvido">Resolvido</MenuItem>
            </TextField>
            <TextField
              select
              size="small"
              label="Tipo"
              value={tipoFilter}
              onChange={(e) => {
                setTipoFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="acompanhar_devolucao">Ficar de olho</MenuItem>
              <MenuItem value="acesso_remoto">Acesso remoto</MenuItem>
              <MenuItem value="divergencia">Divergencia</MenuItem>
            </TextField>
            <Button startIcon={<Refresh />} onClick={loadChamados} disabled={loading}>Atualizar</Button>
          </Box>
        </Box>

        <SearchBar
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            setPage(0);
          }}
          placeholder="Pesquisar por cliente, item, devolucao, descricao ou e-mail..."
          sx={{ mb: 2 }}
        />

        <DataTable
          columns={columns}
          data={chamados}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={totalRows}
          onPageChange={setPage}
          onRowsPerPageChange={(value) => {
            setRowsPerPage(value);
            setPage(0);
          }}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          loading={loading}
        />
      </Paper>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <EditIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Atualizar chamado #{editingChamado?.id}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {renderChamadoForm(true)}
        </DialogContent>
        <DialogActions sx={{ p: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'stretch' }}>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" startIcon={<Save />} onClick={handleSaveEdit} disabled={submitting}>
            {submitting ? <CircularProgress size={20} color="inherit" /> : 'Salvar atualizacao'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <DeleteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Excluir chamado #{deletingChamado?.id}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography>Cliente: {deletingChamado?.cliente}</Typography>
          <Typography>Tipo: {tipoLabels[deletingChamado?.tipo] || deletingChamado?.tipo}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>Cancelar</Button>
          <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={handleConfirmDelete} disabled={submitting}>
            {submitting ? <CircularProgress size={20} color="inherit" /> : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChamadosPage;
