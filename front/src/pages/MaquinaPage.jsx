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
import { Save, Print, Refresh, Download, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import MaquinaForm from '../components/forms/MaquinaForm';
import DataTable from '../components/tables/DataTable';
import SearchBar from '../components/tables/SearchBar';
import maquinaService from '../services/maquinaService';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MaquinaPage = () => {
  const { user, hasRole } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [maquinas, setMaquinas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [devolucoes, setDevolucoes] = useState([]);
  const [loadingDevolucoes, setLoadingDevolucoes] = useState(false);
  const [editingMaquina, setEditingMaquina] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [maquinaToDelete, setMaquinaToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const formDataInicial = {
    processador: '',
    memoria: '',
    armazenamento: '',
    fonte: '',
    placaVideo: '',
    gabinete: '',
    origem: '',
    responsavel: '',
    lacre: '',
    defeito: '',
    observacao: '',
    fkDevolucao: null,
  };
  
  const [formData, setFormData] = useState(formDataInicial);

  // Verificar se usuário pode editar
  const canEdit = () => {
    return hasRole('admin') || hasRole('tecnico');
  };

  // Verificar se usuário pode deletar (apenas admin)
  const canDelete = () => {
    return hasRole('admin');
  };

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

  // Carregar máquinas
  const loadMaquinas = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await maquinaService.getAll(page + 1, rowsPerPage, searchTerm);
      setMaquinas(resp.dados || []);
      setTotalRows(resp.total || resp.totalRegistros || 0);
    } catch (error) {
      console.error('Erro ao carregar máquinas:', error);
      alert('Erro ao carregar máquinas');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    loadMaquinas();
  }, [loadMaquinas]);

  // ABRIR MODAL DE EDIÇÃO
  const handleEditClick = (maquina) => {
    if (!canEdit()) {
      alert('Você não tem permissão para editar máquinas. Apenas administradores e técnicos podem editar.');
      return;
    }
    
    setEditingMaquina(maquina);
    console.log(maquina);
    setFormData({
      processador: maquina.processador || '',
      memoria: maquina.memoria || '',
      armazenamento: maquina.armazenamento || '',
      fonte: maquina.fonte || '',
      placaVideo: maquina.placaVideo || '',
      gabinete: maquina.gabinete || '',
      origem: maquina.origem || '',
      responsavel: maquina.responsavel || '',
      lacre: maquina.lacre || '',
      defeito: maquina.defeito || '',
      observacao: maquina.observacao || '',
      fkDevolucao: maquina.fkDevolucao || null,
    });
    
    if (maquina.origem) {
      loadDevolucoesByOrigem(maquina.origem);
    }
    
    setEditDialogOpen(true);
  };

  // ABRIR MODAL DE EXCLUSÃO
  const handleDeleteClick = (maquina) => {
    if (!canDelete()) {
      alert('Você não tem permissão para excluir máquinas. Apenas administradores podem excluir.');
      return;
    }
    
    setMaquinaToDelete(maquina);
    setDeleteDialogOpen(true);
  };

  // FECHAR MODAL DE EDIÇÃO
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingMaquina(null);
    setFormData(formDataInicial);
    setDevolucoes([]);
  };

  // FECHAR MODAL DE EXCLUSÃO
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setMaquinaToDelete(null);
  };

  // SALVAR EDIÇÃO
  const handleSaveEdit = async () => {
    if (!editingMaquina) return;
    
    const lacreConfirmado = window.confirm("Verificou o lacre?");
    if (!lacreConfirmado) {
      alert("Por favor, verifique o lacre antes de salvar.");
      return;
    }

    const wifiConfirmado = window.confirm("Verificou o adaptador Wi-Fi?");
    if (!wifiConfirmado) {
      alert("Por favor, verifique o adaptador Wi-Fi antes de salvar.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = { ...formData };
      const res = await api.put(`/maquinas/${editingMaquina.id}`, payload);

      alert('Máquina atualizada com sucesso!');
      
      handleCloseEditDialog();
      loadMaquinas();
      
    } catch (error) {
      alert('Erro ao atualizar máquina');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // EXCLUIR MÁQUINA
  const handleConfirmDelete = async () => {
    if (!maquinaToDelete) return;
    
    // Confirmação extra para exclusão
    const confirmacao = window.confirm(`Tem certeza que deseja excluir a máquina #${maquinaToDelete.id}?\n\nEsta ação não pode ser desfeita!`);
    if (!confirmacao) {
      handleCloseDeleteDialog();
      return;
    }

    setDeleting(true);

    try {
      await api.delete(`/maquinas/${maquinaToDelete.id}`);

      alert('Máquina excluída com sucesso!');
      
      handleCloseDeleteDialog();
      loadMaquinas();
      
    } catch (error) {
      console.error('Erro ao excluir máquina:', error);
      alert(error.response?.data?.error || 'Erro ao excluir máquina');
    } finally {
      setDeleting(false);
    }
  };

  // Salvar máquina
  const handleSubmit = async (e) => {
    e.preventDefault();

    const lacreConfirmado = window.confirm("Colocou o lacre?");
    if (!lacreConfirmado) {
      alert("Por favor, coloque o lacre antes de salvar.");
      return;
    }

    const wifiConfirmado = window.confirm("Colocou o adaptador Wi-Fi?");
    if (!wifiConfirmado) {
      alert("Por favor, coloque o adaptador Wi-Fi antes de salvar.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = { ...formData };
      const res = await maquinaService.create(payload);

      alert('Máquina cadastrada!');

      const newId = res.data?.id || res.id;
      handlePrint({ id: newId, ...formData });

      setFormData(formDataInicial);
      setDevolucoes([]);

      loadMaquinas();
      setLoadingDevolucoes(false);
      loadMaquinas();
    } catch (error) {
      alert('Erro ao salvar máquina');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Imprimir etiqueta
  const handlePrint = async (maquina) => {
    try {
      const data = maquina.id === 'new' ? formData : maquina;
      const janela = window.open('', '_blank');
      let id, processador, memoria, armazenamento, fonte, placaVideo, gabinete;
      id = data.id ? data.id : '';
      processador = data.processador;
      memoria = data.memoria;
      armazenamento = data.armazenamento;
      fonte = data.fonte;
      placaVideo = data.placaVideo ? data.placaVideo : '';
      gabinete = data.gabinete ? data.gabinete : '';

      const conteudoHTML = `
            <html>
              <head>
                <title>Etiqueta</title>
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
                    width: 95mm;
                    height: 25mm;
                    border: 2px solid #000;
                    padding: 5px;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: space-between;
                  }

                  .info-principal {
                    flex: 1;
                    border-right: 1px solid #000;
                    padding-right: 10px;
                  }
                  .info-secundaria {
                    flex: 1;
                    padding-left: 10px;
                    font-size: 16px;
                  }
                  h1 {
                    margin: 0;
                    font-size: 24px;
                  }
                  p {
                    margin: 5px 0 0 0;
                    font-size: 18px;
                  }
                </style>
              </head>
              <body onload="window.print(); window.close();">
                <div class="etiqueta">
                  <div class="info-principal"> 
                    <h1>${processador}</h1>
                    <p>${data.id}</p>
                  </div>
                  <div class="info-secundaria">
                    ${memoria} </br> 
                    ${armazenamento} </br> 
                    ${fonte} </br> 
                    ${gabinete} </br>
                    ${placaVideo}
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
    { field: 'responsavel', headerName: 'Responsável', width: 130 },
    { field: 'processador', headerName: 'CPU', width: 150 },
    { field: 'memoria', headerName: 'Memória', width: 120 },
    { field: 'armazenamento', headerName: 'Armazenamento', width: 150 },
    { field: 'fonte', headerName: 'Fonte', width: 120 },
    { field: 'placaVideo', headerName: 'Placa de Vídeo', width: 150 },
    { field: 'gabinete', headerName: 'Gabinete', width: 120 },
    { field: 'origem', headerName: 'Origem', width: 130 },
    { field: 'defeito', headerName: 'Defeito', width: 150 },
    { field: 'observacao', headerName: 'Observação', width: 200 },
    { field: 'data', headerName: 'Data', type: 'date', width: 120 },
    { field: 'fkDevolucao', headerName: 'Devolução', width: 100, align: 'center' },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, color: '#15803d' }}>
        Máquinas
      </Typography>

      {/* Formulário em cima */}
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
        <Typography variant="h5" gutterBottom sx={{ mb: 2, color: 'primary.dark' }}>
          Cadastro de Máquina
        </Typography>

        <MaquinaForm
          formData={formData}
          onChange={handleFormDataChange}
          devolucoes={devolucoes}
          loadingDevolucoes={loadingDevolucoes}
          loading={submitting}
        />

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSubmit}
            disabled={submitting}
            sx={{ flex: 1, py: 1.5 }}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Salvar Máquina'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={() => handlePrint({ id: 'new', ...formData })}
            sx={{ flex: 1, py: 1.5 }}
          >
            Imprimir Etiqueta
          </Button>
        </Box>

        <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
          <Typography variant="body2">
            <strong>Permissões:</strong> 
            {hasRole('admin') ? ' Administrador (pode editar e excluir)' : ''}
            {hasRole('tecnico') ? ' Técnico (pode editar)' : ''}
            {!hasRole('admin') && !hasRole('tecnico') ? ' Visualização apenas' : ''}
          </Typography>
        </Alert>
      </Paper>

      {/* Tabela embaixo */}
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
          height: '90vh',
          overflow: 'auto',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Histórico do Dia
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadMaquinas}
              disabled={loading}
              size="small"
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
          data={maquinas}
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
          Editar Máquina #{editingMaquina?.id}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <MaquinaForm
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
          Excluir Máquina #{maquinaToDelete?.id}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Atenção!</strong> Esta ação é irreversível.
          </Alert>
          
          <Typography variant="body1" sx={{ mb: 1 }}>
            Você está prestes a excluir a seguinte máquina:
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: '#f8fafc', 
            borderRadius: 1,
            border: '1px solid #e2e8f0'
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              ID: {maquinaToDelete?.id}
            </Typography>
            <Typography variant="body2">
              Processador: {maquinaToDelete?.processador}
            </Typography>
            <Typography variant="body2">
              Memória: {maquinaToDelete?.memoria}
            </Typography>
            <Typography variant="body2">
              Responsável: {maquinaToDelete?.responsavel}
            </Typography>
            <Typography variant="body2">
              Origem: {maquinaToDelete?.origem}
            </Typography>
            {maquinaToDelete?.defeito && (
              <Typography variant="body2">
                Defeito: {maquinaToDelete?.defeito}
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
            disabled={deleting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            startIcon={<DeleteIcon />}
            disabled={deleting}
            sx={{ 
              bgcolor: '#dc2626',
              '&:hover': { bgcolor: '#b91c1c' }
            }}
          >
            {deleting ? <CircularProgress size={24} color="inherit" /> : 'Excluir Máquina'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaquinaPage;