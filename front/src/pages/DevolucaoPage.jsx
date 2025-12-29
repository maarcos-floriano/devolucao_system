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
} from '@mui/material';
import { Save, Refresh, Download, Print, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import DevolucaoForm from '../components/forms/DevolucaoForm';
import DataTable from '../components/tables/DataTable';
import SearchBar from '../components/tables/SearchBar';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const DevolucaoPage = () => {
  const { hasRole } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [devolucoes, setDevolucoes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [editingDevolucao, setEditingDevolucao] = useState(null);
  const [deletingDevolucao, setDeletingDevolucao] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    origem: '',
    cliente: '',
    produto: '',
    codigo: '',
    observacao: '',
    dataHora: new Date().toISOString().slice(0, 16),
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

  // Carregar devoluções
  const loadDevolucoes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/devolucao', {
        params: {
          search: searchTerm,
          page: page + 1,
          limit: rowsPerPage,
        },
      });

      setDevolucoes(response.data.dados);
      setTotalRows(response.data.total);
      
    } catch (error) {
      console.error('Erro ao carregar devoluções:', error);
      alert('Erro ao carregar devoluções');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    loadDevolucoes();
  }, [loadDevolucoes]);

  // ABRIR MODAL DE EDIÇÃO
  const handleEditClick = (devolucao) => {
    if (!canEdit()) {
      alert('Você não tem permissão para editar devoluções. Apenas administradores e técnicos podem editar.');
      return;
    }
    
    setEditingDevolucao(devolucao);
    setFormData({
      origem: devolucao.origem || '',
      cliente: devolucao.cliente || '',
      produto: devolucao.produto || '',
      codigo: devolucao.codigo || '',
      observacao: devolucao.observacao || '',
      dataHora: devolucao.dataHora || new Date().toISOString().slice(0, 16),
    });
    
    setEditDialogOpen(true);
  };

  // ABRIR MODAL DE EXCLUSÃO
  const handleDeleteClick = (devolucao) => {
    if (!canDelete()) {
      alert('Você não tem permissão para excluir devoluções. Apenas administradores podem excluir.');
      return;
    }
    
    setDeletingDevolucao(devolucao);
    setDeleteDialogOpen(true);
  };

  // FECHAR MODAL DE EDIÇÃO
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingDevolucao(null);
    setFormData({
      origem: '',
      cliente: '',
      produto: '',
      codigo: '',
      observacao: '',
      dataHora: new Date().toISOString().slice(0, 16),
    });
  };

  // FECHAR MODAL DE EXCLUSÃO
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeletingDevolucao(null);
  };

  // SALVAR EDIÇÃO
  const handleSaveEdit = async () => {
    if (!editingDevolucao) return;
    
    setSubmitting(true);
    try {
      const payload = { ...formData };
      await api.put(`/devolucao/${editingDevolucao.id}`, payload);

      alert('Devolução atualizada com sucesso!');
      
      handleCloseEditDialog();
      loadDevolucoes();
      
    } catch (error) {
      alert('Erro ao atualizar devolução');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // EXCLUIR DEVOLUÇÃO
  const handleConfirmDelete = async () => {
    if (!deletingDevolucao) return;
    
    const confirmacao = window.confirm(`Tem certeza que deseja excluir a devolução #${deletingDevolucao.id}?\n\nEsta ação não pode ser desfeita!`);
    if (!confirmacao) {
      handleCloseDeleteDialog();
      return;
    }

    setSubmitting(true);
    try {
      await api.delete(`/devolucao/${deletingDevolucao.id}`);

      alert('Devolução excluída com sucesso!');
      
      handleCloseDeleteDialog();
      loadDevolucoes();
      
    } catch (error) {
      console.error('Erro ao excluir devolução:', error);
      alert(error.response?.data?.error || 'Erro ao excluir devolução');
    } finally {
      setSubmitting(false);
    }
  };

  // Salvar nova devolução
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSubmitting(true);
    try {
      const payload = { ...formData };
      const response = await api.post('/devolucao', payload);

      alert('Devolução salva com sucesso!');
      
      await handlePrint(response.data.id || 'new');
      
      setFormData({
        origem: '',
        cliente: '',
        produto: '',
        codigo: '',
        observacao: '',
        dataHora: new Date().toISOString().slice(0, 16),
      });
      loadDevolucoes();
    } catch (error) {
      alert('Erro ao salvar devolução');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Imprimir etiqueta
  const handlePrint = async (id) => {
    try {
      const devolucao = id === 'new' 
        ? { id: 'NOVO', cliente: formData.cliente || 'Cliente', origem: formData.origem || 'Origem' }
        : devolucoes.find(d => d.id === id) || { id, cliente: 'Cliente', origem: 'Origem' };
      
      const janela = window.open('', '_blank');
      const conteudoHTML = `
        <html>
          <head>
            <title>Etiqueta Devolução</title>
            <style>
              @page { size: 100mm 30mm; margin: 0; padding: 0; }
              html, body {
                width: 100mm; height: 30mm; margin: 0; padding: 0;
              }
              body {
                display: flex; justify-content: center; align-items: center;
                font-size: 20px; font-family: Arial, sans-serif; text-align: center;
              }
              .etiqueta {
                width: 100%; padding: 0 10px; display: flex;
                flex-direction: row; justify-content: space-evenly; align-items: center;
              }
              .etiqueta h1 { margin: 0; font-size: 50px; }
              .etiqueta div { margin-top: 5px; font-size: 20px; }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            <div class="etiqueta">
              <h1>${devolucao.id}</h1>
              <div>
                ${devolucao.cliente}<br>
                ${devolucao.origem}
              </div>
            </div>
          </body>
        </html>
      `;
      
      janela.document.write(conteudoHTML);
      janela.document.close();
      
      alert('Etiqueta impressa com sucesso');
    } catch (error) {
      alert('Erro ao imprimir etiqueta');
      console.error(error);
    }
  };

  // Exportar para Excel
  const handleExport = async () => {
    alert('Funcionalidade de exportação em desenvolvimento');
  };

  // Colunas da tabela
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'origem', headerName: 'Origem', width: 150 },
    { field: 'cliente', headerName: 'Cliente', width: 150 },
    { field: 'produto', headerName: 'Produto', width: 150 },
    { field: 'codigo', headerName: 'Código', width: 150 },
    { field: 'dataHora', headerName: 'Data/Hora', width: 180, type: 'datetime' },
    { field: 'observacao', headerName: 'Observação', width: 200 },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Devolução
      </Typography>

      {/* Formulário */}
      <Paper 
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          border: '2px solid',
          borderColor: 'primary.main',
          borderRadius: 3,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Registrar Devolução
        </Typography>

        <DevolucaoForm
          formData={formData}
          onChange={setFormData}
          loading={submitting}
          isEditing={!!editingDevolucao}
        />

        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexDirection: 'column' }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSubmit}
            disabled={submitting}
            fullWidth
          >
            {submitting ? <CircularProgress size={24} /> : editingDevolucao ? 'Atualizar Devolução' : 'Salvar Devolução'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={() => handlePrint('new')}
            fullWidth
          >
            Imprimir Etiqueta
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
          p: 3,
          border: '2px solid',
          borderColor: 'primary.main',
          borderRadius: 3,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '86vh',
          overflow: 'auto',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Histórico de Devoluções</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<Refresh />}
              onClick={loadDevolucoes}
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
          placeholder="Pesquisar por origem, cliente, produto ou código..."
          sx={{ mb: 2 }}
        />

        <DataTable
          columns={columns}
          data={devolucoes}
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
          Editar Devolução #{editingDevolucao?.id}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <DevolucaoForm
            formData={formData}
            onChange={setFormData}
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
          Excluir Devolução #{deletingDevolucao?.id}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Atenção!</strong> Esta ação é irreversível.
          </Alert>
          
          <Typography variant="body1" sx={{ mb: 1 }}>
            Você está prestes a excluir a seguinte devolução:
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: '#f8fafc', 
            borderRadius: 1,
            border: '1px solid #e2e8f0'
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              ID: {deletingDevolucao?.id}
            </Typography>
            <Typography variant="body2">
              Cliente: {deletingDevolucao?.cliente}
            </Typography>
            <Typography variant="body2">
              Produto: {deletingDevolucao?.produto}
            </Typography>
            <Typography variant="body2">
              Origem: {deletingDevolucao?.origem}
            </Typography>
            {deletingDevolucao?.codigo && (
              <Typography variant="body2">
                Código: {deletingDevolucao?.codigo}
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
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Excluir Devolução'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DevolucaoPage;