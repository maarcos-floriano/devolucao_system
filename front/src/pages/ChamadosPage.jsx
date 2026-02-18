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
import { AddAlert, Save, Refresh, Edit as EditIcon } from '@mui/icons-material';
import DataTable from '../components/tables/DataTable';
import SearchBar from '../components/tables/SearchBar';
import chamadoService from '../services/chamadoService';

const initialFormData = {
  devolucao_id: '',
  problema: '',
  status: 'aberto',
  acao_tomada: '',
};

const ChamadosPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [chamados, setChamados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingChamado, setEditingChamado] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  const loadChamados = useCallback(async () => {
    setLoading(true);
    try {
      const response = await chamadoService.getAll({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        status: statusFilter,
      });

      setChamados(response.dados || []);
      setTotalRows(response.total || 0);
    } catch (error) {
      console.error('Erro ao carregar chamados:', error);
      alert('Erro ao carregar chamados');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, statusFilter]);

  useEffect(() => {
    loadChamados();
  }, [loadChamados]);

  const handleSubmit = async () => {
    if (!formData.devolucao_id || !formData.problema.trim()) {
      alert('Informe ID da devolução e o problema.');
      return;
    }

    setSubmitting(true);
    try {
      await chamadoService.create({
        ...formData,
        devolucao_id: Number(formData.devolucao_id),
      });
      setFormData(initialFormData);
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
      devolucao_id: String(chamado.devolucao_id),
      problema: chamado.problema || '',
      status: chamado.status || 'aberto',
      acao_tomada: chamado.acao_tomada || '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingChamado) return;
    if (formData.status === 'resolvido' && !formData.acao_tomada.trim()) {
      alert('Para resolver o chamado, informe qual ação foi tomada.');
      return;
    }

    setSubmitting(true);
    try {
      await chamadoService.update(editingChamado.id, {
        ...formData,
        devolucao_id: Number(formData.devolucao_id),
      });
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

  const columns = useMemo(() => ([
    { field: 'id', headerName: 'ID', width: 60 },
    { field: 'devolucao_id', headerName: 'Devolução #', width: 100 },
    { field: 'cliente', headerName: 'Cliente', width: 150 },
    { field: 'produto', headerName: 'Produto', width: 140 },
    { field: 'problema', headerName: 'Problema', width: 220 },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      render: (value) => (
        <Box
          component="span"
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
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
    { field: 'acao_tomada', headerName: 'Ação tomada', width: 220 },
    { field: 'criado_em', headerName: 'Criado em', width: 160, type: 'datetime' },
    { field: 'resolvido_em', headerName: 'Resolvido em', width: 160, type: 'datetime' },
  ]), []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Chamados de Divergência
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3, border: '2px solid', borderColor: 'primary.main', borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>
          Abrir Chamado de Acompanhamento
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '140px 1fr' }, gap: 2 }}>
          <TextField
            label="Devolução #"
            type="number"
            value={formData.devolucao_id}
            onChange={(e) => setFormData((prev) => ({ ...prev, devolucao_id: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Qual é o problema?"
            value={formData.problema}
            onChange={(e) => setFormData((prev) => ({ ...prev, problema: e.target.value }))}
            fullWidth
            multiline
            minRows={2}
          />
        </Box>

        <Button
          sx={{ mt: 2 }}
          variant="contained"
          startIcon={<Save />}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? <CircularProgress size={22} color="inherit" /> : 'Registrar chamado'}
        </Button>

        <Alert severity="info" sx={{ mt: 2 }}>
          Use esta área para sinalizar devoluções com divergência e manter o time técnico/SAC alinhado até a resolução.
        </Alert>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, border: '2px solid', borderColor: 'primary.main', borderRadius: 3, height: '70vh' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
          <Typography variant="h6">Chamados em acompanhamento</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="aberto">Aberto</MenuItem>
              <MenuItem value="resolvido">Resolvido</MenuItem>
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
          placeholder="Pesquisar por devolução, cliente, produto ou descrição do problema..."
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
          loading={loading}
        />
      </Paper>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <EditIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Atualizar chamado #{editingChamado?.id}
        </DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
          <TextField
            label="Problema"
            value={formData.problema}
            onChange={(e) => setFormData((prev) => ({ ...prev, problema: e.target.value }))}
            multiline
            minRows={2}
            fullWidth
          />
          <TextField
            select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
            fullWidth
          >
            <MenuItem value="aberto">Aberto</MenuItem>
            <MenuItem value="resolvido">Resolvido</MenuItem>
          </TextField>
          <TextField
            label="Ação tomada"
            value={formData.acao_tomada}
            onChange={(e) => setFormData((prev) => ({ ...prev, acao_tomada: e.target.value }))}
            multiline
            minRows={3}
            fullWidth
            helperText="Descreva o que foi feito para resolver o problema"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" startIcon={<Save />} onClick={handleSaveEdit} disabled={submitting}>
            {submitting ? <CircularProgress size={20} color="inherit" /> : 'Salvar atualização'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChamadosPage;
