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
import { Save, Refresh, Print, Download, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import KitForm from '../components/forms/KitForm';
import DataTable from '../components/tables/DataTable';
import SearchBar from '../components/tables/SearchBar';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const KitPage = () => {
  const { hasRole } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [kits, setKits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [editingKit, setEditingKit] = useState(null);
  const [deletingKit, setDeletingKit] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [devolucoes, setDevolucoes] = useState([]);
  const [loadingDevolucoes, setLoadingDevolucoes] = useState(false);
  
  const formDataInicial = {
    processador: '',
    memoria: '',
    placaMae: '',
    origem: '',
    responsavel: '',
    lacre: '',
    defeito: '',
    observacao: '',
    fkDevolucao: null,
    data: new Date().toISOString().split('T')[0],
  };
  
  const [formData, setFormData] = useState(formDataInicial);

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

  // Buscar devoluções quando a origem for selecionada
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

  // Atualizar formData e buscar devoluções quando origem mudar
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

  // Carregar kits
  const loadKits = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/kits', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: searchTerm,
        },
      });
      const data = response.data;
      
      setKits(data.dados || []);
      setTotalRows(data.total || data.totalRegistros || data.dados?.length || 0);
    } catch (error) {
      console.error('Erro ao carregar kits:', error);
      alert('Erro ao carregar kits');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    loadKits();
  }, [loadKits]);

  // ABRIR MODAL DE EDIÇÃO
  const handleEditClick = (kit) => {
    if (!canEdit()) {
      alert('Você não tem permissão para editar kits. Apenas administradores e técnicos podem editar.');
      return;
    }
    
    setEditingKit(kit);
    setFormData({
      processador: kit.processador || '',
      memoria: kit.memoria || '',
      placaMae: kit.placaMae || '',
      origem: kit.origem || '',
      responsavel: kit.responsavel || '',
      lacre: kit.lacre || '',
      defeito: kit.defeito || '',
      observacao: kit.observacao || '',
      fkDevolucao: kit.fkDevolucao || null
    });
    
    if (kit.origem) {
      loadDevolucoesByOrigem(kit.origem);
    }
    
    setEditDialogOpen(true);
  };

  // ABRIR MODAL DE EXCLUSÃO
  const handleDeleteClick = (kit) => {
    if (!canDelete()) {
      alert('Você não tem permissão para excluir kits. Apenas administradores podem excluir.');
      return;
    }
    
    setDeletingKit(kit);
    setDeleteDialogOpen(true);
  };

  // FECHAR MODAL DE EDIÇÃO
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingKit(null);
    setFormData(formDataInicial);
    setDevolucoes([]);
  };

  // FECHAR MODAL DE EXCLUSÃO
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeletingKit(null);
  };

  // SALVAR EDIÇÃO
  const handleSaveEdit = async () => {
    if (!editingKit) return;
    
    // Verificação de lacre
    const lacreConfirmado = window.confirm("Verificou o lacre?");
    if (!lacreConfirmado) {
      alert("Por favor, verifique o lacre antes de salvar.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...formData };
      await api.put(`/kits/${editingKit.id}`, payload);

      alert('Kit atualizado com sucesso!');
      
      handleCloseEditDialog();
      loadKits();
      
    } catch (error) {
      alert('Erro ao atualizar kit');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // EXCLUIR KIT
  const handleConfirmDelete = async () => {
    if (!deletingKit) return;
    
    const confirmacao = window.confirm(`Tem certeza que deseja excluir o kit #${deletingKit.id}?\n\nEsta ação não pode ser desfeita!`);
    if (!confirmacao) {
      handleCloseDeleteDialog();
      return;
    }

    setSubmitting(true);
    try {
      await api.delete(`/kits/${deletingKit.id}`);

      alert('Kit excluído com sucesso!');
      
      handleCloseDeleteDialog();
      loadKits();
      
    } catch (error) {
      console.error('Erro ao excluir kit:', error);
      alert(error.response?.data?.error || 'Erro ao excluir kit');
    } finally {
      setSubmitting(false);
    }
  };

  // Salvar novo kit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificação de lacre
    const lacreConfirmado = window.confirm("Colocou o lacre?");
    if (!lacreConfirmado) {
      alert("Por favor, coloque o lacre antes de salvar.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...formData };
      const response = await api.post('/kits', payload);

      alert('Kit salvo com sucesso!');
      
      handlePrint(response.data.id);
      
      setFormData(formDataInicial);
      setDevolucoes([]);
      loadKits();
    } catch (error) {
      alert('Erro ao salvar kit');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = (kit) => {
    const data = kit === 'new' || kit?.id === 'new' ? formData : kits.find(k => k.id === kit) || kit || formData;
    
    const janela = window.open('', '_blank');
    const conteudoHTML = `
      <html>
      <head>
        <title>Etiqueta Kit</title>
        <style>
          @page {
            size: 100mm 30mm;
            margin: 0;
            padding: 0;
          }
          html, body {
            width: 100mm;
            height: 30mm;
            margin: 0;
            padding: 0;
          }
          body {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 20px;
            font-family: Arial, sans-serif;
            text-align: center;
          }
          .etiqueta {
            width: 100%;
            padding: 0 10px;
            display: flex;
            flex-direction: row;
            justify-content: space-evenly;
            align-items: center;
          }
          .etiqueta h1 {
            margin: 0;
            font-size: 50px;
          }
          .etiqueta div {
            margin-top: 5px;
            font-size: 20px;
          }
        </style>
      </head>
      <body onload="window.print(); window.close();">
        <div class="etiqueta">
          <h1>${data.id || 'NOVO'}</h1>
          <div>
            ${data.processador} </br> 
            ${data.memoria} </br> 
            ${data.placaMae} </br>
            ${data.observacao || ''}
          </div>
        </div>
      </body>
    </html>
    `;
    
    janela.document.write(conteudoHTML);
    janela.document.close();
    
    alert('Etiqueta impressa com sucesso');
  };

  // Exportar para Excel
  const handleExport = async () => {
    alert('Funcionalidade de exportação em desenvolvimento');
  };

  // Colunas da tabela
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'responsavel', headerName: 'Responsável', width: 130 },
    { field: 'processador', headerName: 'Processador', width: 150 },
    { field: 'memoria', headerName: 'Memória', width: 120 },
    { field: 'placaMae', headerName: 'Placa Mãe', width: 150 },
    { field: 'origem', headerName: 'Origem', width: 130 },
    { field: 'observacao', headerName: 'Observação', width: 200 },
    { field: 'data', headerName: 'Data', width: 120, type: 'date' },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Kits
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
          Cadastro de Kit
        </Typography>

        <KitForm
          formData={formData}
          onChange={handleFormDataChange}
          devolucoes={devolucoes}
          loadingDevolucoes={loadingDevolucoes}
          loading={submitting}
          isEditing={!!editingKit}
        />

        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSubmit}
            disabled={submitting}
            fullWidth
          >
            {submitting ? <CircularProgress size={24} /> : editingKit ? 'Atualizar Kit' : 'Salvar Kit'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={() => handlePrint(formData)}
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
          <Typography variant="h6">Histórico do Dia</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<Refresh />}
              onClick={loadKits}
              disabled={loading}
            >
              Atualizar
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleExport}
              size="small"
              sx={{ backgroundColor: '#16a34a', '&:hover': { backgroundColor: '#15803d' } }}
            >
              Exportar Excel
            </Button>
          </Box>
        </Box>

        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Pesquisar por config, origem, responsável..."
          sx={{ mb: 2 }}
        />

        <DataTable
          columns={columns}
          data={kits}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={totalRows}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onPrint={handlePrint}
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
          Editar Kit #{editingKit?.id}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <KitForm
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
          Excluir Kit #{deletingKit?.id}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Atenção!</strong> Esta ação é irreversível.
          </Alert>
          
          <Typography variant="body1" sx={{ mb: 1 }}>
            Você está prestes a excluir o seguinte kit:
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: '#f8fafc', 
            borderRadius: 1,
            border: '1px solid #e2e8f0'
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              ID: {deletingKit?.id}
            </Typography>
            <Typography variant="body2">
              Processador: {deletingKit?.processador}
            </Typography>
            <Typography variant="body2">
              Memória: {deletingKit?.memoria}
            </Typography>
            <Typography variant="body2">
              Placa Mãe: {deletingKit?.placaMae}
            </Typography>
            <Typography variant="body2">
              Responsável: {deletingKit?.responsavel}
            </Typography>
            <Typography variant="body2">
              Origem: {deletingKit?.origem}
            </Typography>
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
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Excluir Kit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KitPage;