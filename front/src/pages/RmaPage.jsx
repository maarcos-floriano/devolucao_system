import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Typography } from '@mui/material';
import { Delete as DeleteIcon, Refresh, Save } from '@mui/icons-material';
import DataTable from '../components/tables/DataTable';
import SearchBar from '../components/tables/SearchBar';
import RmaForm from '../components/forms/RmaForm';
import rmaService from '../services/rmaService';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const initialForm = {
  tipo_item: '',
  descricao_item: '',
  problema: '',
  destino: '',
  status: 'aberto',
  observacao: '',
  responsavel: '',
  fkDevolucao: null,
};

const RmaPage = () => {
  const { hasRole } = useAuth();
  const [formData, setFormData] = useState(initialForm);
  const [devolucoes, setDevolucoes] = useState([]);
  const [rmas, setRmas] = useState([]);
  const [pendencias, setPendencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rmaToDelete, setRmaToDelete] = useState(null);

  const canDelete = () => hasRole('admin');

  const loadDevolucoes = useCallback(async () => {
    try {
      const response = await api.get('/devolucao', { params: { page: 1, limit: 200 } });
      setDevolucoes(response.data.dados || []);
    } catch (error) {
      console.error('Erro ao carregar devoluções para vínculo:', error);
    }
  }, []);

  const loadRmas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await rmaService.getAll(page + 1, rowsPerPage, searchTerm);
      setRmas(response.dados || []);
      setTotalRows(response.total || 0);
    } catch (error) {
      console.error('Erro ao carregar RMAs:', error);
      alert('Erro ao carregar registros de RMA');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  const loadPendencias = useCallback(async () => {
    try {
      const response = await rmaService.getDevolucoesSemVinculo();
      setPendencias(response.dados || []);
    } catch (error) {
      console.error('Erro ao carregar pendências de devolução:', error);
    }
  }, []);

  useEffect(() => {
    loadRmas();
  }, [loadRmas]);

  useEffect(() => {
    loadDevolucoes();
    loadPendencias();
  }, [loadDevolucoes, loadPendencias]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tipo_item || !formData.problema) {
      alert('Tipo do item e problema são obrigatórios.');
      return;
    }

    setSubmitting(true);
    try {
      await rmaService.create(formData);
      alert('Registro de RMA salvo com sucesso!');
      setFormData(initialForm);
      await Promise.all([loadRmas(), loadPendencias()]);
    } catch (error) {
      console.error('Erro ao salvar RMA:', error);
      alert('Erro ao salvar RMA');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (rma) => {
    if (!canDelete()) {
      alert('Apenas administradores podem excluir registros de RMA.');
      return;
    }

    setRmaToDelete(rma);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!rmaToDelete) return;

    try {
      await rmaService.remove(rmaToDelete.id);
      setDeleteDialogOpen(false);
      setRmaToDelete(null);
      await loadRmas();
    } catch (error) {
      console.error('Erro ao excluir RMA:', error);
      alert('Erro ao excluir RMA');
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'tipo_item', headerName: 'Tipo', width: 120 },
    { field: 'descricao_item', headerName: 'Descrição', width: 220 },
    { field: 'problema', headerName: 'Problema', width: 220 },
    { field: 'status', headerName: 'Status', width: 130 },
    { field: 'destino', headerName: 'Destino', width: 160 },
    {
      field: 'fkDevolucao',
      headerName: 'Devolução',
      width: 220,
      render: (_, row) => row.fkDevolucao ? `#${row.fkDevolucao} - ${row.devolucao_cliente || '-'}` : '-',
    },
    { field: 'responsavel', headerName: 'Responsável', width: 150 },
    { field: 'data', headerName: 'Data', type: 'datetime', width: 160 },
  ];

  const pendenciasColumns = [
    { field: 'id', headerName: 'Devolução #', width: 90 },
    { field: 'origem', headerName: 'Origem', width: 140 },
    { field: 'cliente', headerName: 'Cliente', width: 180 },
    { field: 'produto', headerName: 'Produto', width: 140 },
    { field: 'codigo', headerName: 'Código', width: 130 },
    { field: 'observacao', headerName: 'Observação', width: 250 },
    { field: 'data', headerName: 'Data', type: 'datetime', width: 160 },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, color: '#166534', fontWeight: 700 }}>
        Área de RMA
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Registrar item em RMA
        </Typography>
        <form onSubmit={handleSubmit}>
          <RmaForm formData={formData} onChange={setFormData} devolucoes={devolucoes} loading={submitting} />
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button type="submit" variant="contained" startIcon={<Save />} disabled={submitting}>
              Salvar RMA
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                setFormData(initialForm);
                loadPendencias();
              }}
            >
              Limpar
            </Button>
          </Box>
        </form>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Registros de RMA
        </Typography>
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar RMA por tipo, problema, cliente..."
        />
        <DataTable
          columns={columns}
          data={rmas}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={totalRows}
          onPageChange={setPage}
          onRowsPerPageChange={(rows) => {
            setRowsPerPage(rows);
            setPage(0);
          }}
          onDelete={handleDelete}
        />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Relatório rápido: devoluções sem vínculo
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: '#6b7280' }}>
          Essas devoluções ainda não foram relacionadas em Máquinas, Monitores, Kits ou RMA.
        </Typography>
        <DataTable
          columns={pendenciasColumns}
          data={pendencias}
          loading={false}
          page={0}
          rowsPerPage={Math.max(10, pendencias.length || 10)}
          totalRows={pendencias.length}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
        />
      </Paper>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Excluir registro de RMA</DialogTitle>
        <DialogContent>
          Deseja realmente excluir o registro #{rmaToDelete?.id}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button color="error" variant="contained" startIcon={<DeleteIcon />} onClick={confirmDelete}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RmaPage;
