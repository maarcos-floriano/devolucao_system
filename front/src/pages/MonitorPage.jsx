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
  Container,
} from '@mui/material';
import { Save, Refresh, Download, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import MonitorForm from '../components/forms/MonitorForm';
import DataTable from '../components/tables/DataTable';
import SearchBar from '../components/tables/SearchBar';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MonitorPage = () => {
  const { hasRole } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [monitores, setMonitores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [editingMonitor, setEditingMonitor] = useState(null);
  const [deletingMonitor, setDeletingMonitor] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [devolucoes, setDevolucoes] = useState([]);
  const [loadingDevolucoes, setLoadingDevolucoes] = useState(false);
  const [formData, setFormData] = useState({
    marca: '',
    tamanho: '',
    origem: '',
    rma: false,
    responsavel: '',
    fkDevolucao: null,
    observacao: ''
  });

  // Verificar permissões
  const canEdit = () => hasRole('admin') || hasRole('tecnico');
  const canDelete = () => hasRole('admin');

  // Funções de paginação
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // Buscar devoluções baseado na origem selecionada
  const loadDevolucoesByOrigem = useCallback(async (origemSelecionada) => {
    if (!origemSelecionada || origemSelecionada === '') {
      setDevolucoes([]);
      setLoadingDevolucoes(false);
      return;
    }
    
    setLoadingDevolucoes(true);
    
    try {
      const response = await api.get('/devolucao', {
        params: {
          search: origemSelecionada,
          limit: 100
        },
      });
      
      const devolucoesFormatadas = response.data.dados?.map(devolucao => ({
        id: devolucao.id,
        label: `#${devolucao.id} - ${devolucao.cliente} - ${devolucao.produto}`,
        cliente: devolucao.cliente,
        produto: devolucao.produto,
        origem: devolucao.origem,
      })) || [];
      
      setDevolucoes(devolucoesFormatadas);
    } catch (error) {
      console.error('Erro ao buscar devoluções:', error);
      setDevolucoes([]);
    } finally {
      setLoadingDevolucoes(false);
    }
  }, []);

  const loadMonitores = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/monitores', {
        params: {
          search: searchTerm,
          page: page + 1,
          limit: rowsPerPage,
        },
      });

      const data = response.data;

      setMonitores(data.dados || []);
      setTotalRows(data.total || 0);

    } catch (error) {
      console.error('Erro ao carregar monitores:', error);
      alert('Erro ao carregar monitores');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    loadMonitores();
  }, [loadMonitores]);

  // ABRIR MODAL DE EDIÇÃO
  const handleEditClick = (monitor) => {
    if (!canEdit()) {
      alert('Você não tem permissão para editar monitores. Apenas administradores e técnicos podem editar.');
      return;
    }
    
    setEditingMonitor(monitor);
    setFormData({
      marca: monitor.marca || '',
      tamanho: monitor.tamanho || '',
      origem: monitor.origem || '',
      rma: monitor.rma || false,
      responsavel: monitor.responsavel || '',
      fkDevolucao: monitor.fkDevolucao || null,
      observacao: monitor.observacao || ''
    });
    
    // Carregar devoluções para a origem do monitor sendo editado
    if (monitor.origem) {
      loadDevolucoesByOrigem(monitor.origem);
    }
    
    setEditDialogOpen(true);
  };

  // ABRIR MODAL DE EXCLUSÃO
  const handleDeleteClick = (monitor) => {
    if (!canDelete()) {
      alert('Você não tem permissão para excluir monitores. Apenas administradores podem excluir.');
      return;
    }
    
    setDeletingMonitor(monitor);
    setDeleteDialogOpen(true);
  };

  // FECHAR MODAL DE EDIÇÃO
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingMonitor(null);
    setFormData({
      marca: '',
      tamanho: '',
      origem: '',
      rma: false,
      responsavel: '',
      fkDevolucao: null,
      observacao: ''
    });
    setDevolucoes([]);
  };

  // FECHAR MODAL DE EXCLUSÃO
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeletingMonitor(null);
  };

  const handleFormDataChange = (newFormData) => {
    const origemAnterior = formData.origem;
    const novaOrigem = newFormData.origem;
    
    setFormData(newFormData);
    
    if (origemAnterior !== novaOrigem) {
      loadDevolucoesByOrigem(novaOrigem);
      
      if (origemAnterior !== novaOrigem) {
        setFormData(prev => ({
          ...prev,
          fkDevolucao: null
        }));
      }
    }
  };

  // SALVAR EDIÇÃO
  const handleSaveEdit = async () => {
    if (!editingMonitor) return;
    
    setSubmitting(true);
    try {
      const payload = { ...formData };
      await api.put(`/monitores/${editingMonitor.id}`, payload);

      alert('Monitor atualizado com sucesso!');
      
      handleCloseEditDialog();
      loadMonitores();
      
    } catch (error) {
      alert('Erro ao atualizar monitor');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // EXCLUIR MONITOR
  const handleConfirmDelete = async () => {
    if (!deletingMonitor) return;
    
    const confirmacao = window.confirm(`Tem certeza que deseja excluir o monitor #${deletingMonitor.id}?\n\nEsta ação não pode ser desfeita!`);
    if (!confirmacao) {
      handleCloseDeleteDialog();
      return;
    }

    setSubmitting(true);
    try {
      await api.delete(`/monitores/${deletingMonitor.id}`);

      alert('Monitor excluído com sucesso!');
      
      handleCloseDeleteDialog();
      loadMonitores();
      
    } catch (error) {
      console.error('Erro ao excluir monitor:', error);
      alert(error.response?.data?.error || 'Erro ao excluir monitor');
    } finally {
      setSubmitting(false);
    }
  };

  // Salvar novo monitor
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.marca || !formData.tamanho || !formData.responsavel || !formData.origem) {
      alert('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    if (formData.rma && !formData.fkDevolucao) {
      const confirmarSemDevolucao = window.confirm(
        'Monitor marcado como RMA (defeito) mas sem devolução vinculada. Deseja continuar?'
      );
      if (!confirmarSemDevolucao) return;
    }
    
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        data: new Date().toISOString().split('T')[0],
      };

      await api.post('/monitores', payload);

      alert('Monitor salvo com sucesso!');
      
      setFormData({
        marca: '',
        tamanho: '',
        origem: '',
        rma: false,
        responsavel: '',
        fkDevolucao: null,
        observacao: ''
      });
      
      setDevolucoes([]);
      setLoadingDevolucoes(false);

      loadMonitores();
      
    } catch (error) {
      alert('Erro ao salvar monitor');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Exportar para Excel
  const handleExport = async () => {
    alert('Funcionalidade de exportação em desenvolvimento');
  };

  // Colunas da tabela
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'marca', headerName: 'Marca', width: 130 },
    { field: 'tamanho', headerName: 'Tamanho', width: 100 },
    { field: 'origem', headerName: 'Origem', width: 130 },
    { 
      field: 'rma', 
      headerName: 'RMA', 
      width: 100,
      align: 'center',
      render: (value) => value ? (
        <span style={{ color: '#f44336', fontWeight: 'bold' }}>Sim</span>
      ) : (
        <span style={{ color: '#4caf50' }}>Não</span>
      )
    },
    { field: 'responsavel', headerName: 'Responsável', width: 130 },
    { 
      field: 'fkDevolucao', 
      headerName: 'Devolução', 
      width: 120,
      align: 'center',
      render: (value) => value ? (
        <span style={{ 
          backgroundColor: '#dcfce7',
          color: '#166534',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          #{value}
        </span>
      ) : '-'
    },
    { field: 'data', headerName: 'Data', width: 120, type: 'date' },
    { field: 'observacao', headerName: 'Observação', width: 200 },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
        Monitores
      </Typography>

      {/* Formulário */}
      <Paper 
        elevation={2}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          border: '2px solid',
          borderColor: 'primary.main',
          borderRadius: 3,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Cadastro de Monitor
        </Typography>

        <MonitorForm
          formData={formData}
          onChange={handleFormDataChange}
          devolucoes={devolucoes}
          loadingDevolucoes={loadingDevolucoes}
          loading={submitting}
          isEditing={!!editingMonitor}
        />

        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSubmit}
            disabled={submitting}
            fullWidth
          >
            {submitting ? <CircularProgress size={24} /> : editingMonitor ? 'Atualizar Monitor' : 'Salvar Monitor'}
          </Button>
        </Box>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Permissões:</strong> 
            {hasRole('admin') ? ' Administrador (pode editar e excluir)' : ''}
            {hasRole('tecnico') ? ' Técnico (pode editar)' : ''}
            {!hasRole('admin') && !hasRole('tecnico') ? ' Visualização apenas' : ''}
          </Typography>
        </Alert>
      </Paper>

      {/* Tabela de Histórico */}
      <Paper 
        elevation={2}
        sx={{
          p: { xs: 2, sm: 3 },
          border: '2px solid',
          borderColor: 'primary.main',
          borderRadius: 3,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: { xs: 'auto', md: '86vh' },
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="h6">Histórico de Monitores</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              startIcon={<Refresh />}
              onClick={loadMonitores}
              disabled={loading}
            >
              Atualizar
            </Button>
            <Button
              startIcon={<Download />}
              onClick={handleExport}
              variant="outlined"
              color="success"
            >
              Exportar
            </Button>
          </Box>
        </Box>

        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Pesquisar por marca, tamanho, origem, responsável..."
          sx={{ mb: 2 }}
        />

        <DataTable
          columns={columns}
          data={monitores}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={totalRows}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onEdit={canEdit() ? handleEditClick : null}
          onDelete={canDelete() ? handleDeleteClick : null}
          loading={loading}
        />
      </Paper>

      {/* MODAL DE EDIÇÃO */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#fef3c7', color: '#92400e' }}>
          <EditIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Editar Monitor #{editingMonitor?.id}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <MonitorForm
            formData={formData}
            onChange={handleFormDataChange}
            devolucoes={devolucoes}
            loadingDevolucoes={loadingDevolucoes}
            loading={submitting}
            isEditing={true}
          />
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={handleCloseEditDialog}
            variant="outlined"
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            startIcon={<Save />}
            disabled={submitting}
            sx={{ 
              bgcolor: '#f59e0b',
              '&:hover': { bgcolor: '#d97706' }
            }}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Salvar Alterações'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL DE EXCLUSÃO */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#fee2e2', color: '#991b1b' }}>
          <DeleteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Excluir Monitor #{deletingMonitor?.id}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Atenção!</strong> Esta ação é irreversível.
          </Alert>
          
          <Typography variant="body1" sx={{ mb: 1 }}>
            Você está prestes a excluir o seguinte monitor:
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: '#f8fafc', 
            borderRadius: 1,
            border: '1px solid #e2e8f0'
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              ID: {deletingMonitor?.id}
            </Typography>
            <Typography variant="body2">
              Marca: {deletingMonitor?.marca}
            </Typography>
            <Typography variant="body2">
              Tamanho: {deletingMonitor?.tamanho}"
            </Typography>
            <Typography variant="body2">
              Origem: {deletingMonitor?.origem}
            </Typography>
            <Typography variant="body2">
              Responsável: {deletingMonitor?.responsavel}
            </Typography>
            <Typography variant="body2">
              RMA: {deletingMonitor?.rma ? 'Sim' : 'Não'}
            </Typography>
            {deletingMonitor?.fkDevolucao && (
              <Typography variant="body2">
                Devolução vinculada: #{deletingMonitor?.fkDevolucao}
              </Typography>
            )}
          </Box>
          
          <Typography variant="body2" sx={{ mt: 2, color: '#dc2626', fontWeight: 600 }}>
            Tem certeza que deseja prosseguir com a exclusão?
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={handleCloseDeleteDialog}
            variant="outlined"
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            startIcon={<DeleteIcon />}
            disabled={submitting}
            sx={{ 
              bgcolor: '#dc2626',
              '&:hover': { bgcolor: '#b91c1c' }
            }}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Excluir Monitor'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MonitorPage;