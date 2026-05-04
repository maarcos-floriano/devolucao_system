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
  Paper,
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
import DevolucaoForm from '../components/forms/DevolucaoForm';
import DataTable from '../components/tables/DataTable';
import SearchBar from '../components/tables/SearchBar';
import api from '../services/api';
import chamadoService from '../services/chamadoService';
import { useAuth } from '../contexts/AuthContext';
import { printDevolucaoLabel } from '../utils/labelPrinter';

const initialFormData = {
  origem: '',
  cliente: '',
  produto: '',
  codigo: '',
  observacao: '',
  imagem: '',
  imagemArquivo: null,
};

const DevolucaoPage = () => {
  const { hasRole } = useAuth();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [analyzingLabel, setAnalyzingLabel] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [devolucoes, setDevolucoes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [editingDevolucao, setEditingDevolucao] = useState(null);
  const [deletingDevolucao, setDeletingDevolucao] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [matchingChamados, setMatchingChamados] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  const getApiBaseUrl = () => (process.env.REACT_APP_API_URL || api.defaults.baseURL || '/api').replace(/\/api\/?$/, '');

  const buildImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${getApiBaseUrl()}${imagePath}`;
  };

  const buildMultipartPayload = (data) => {
    const payload = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null || key === 'imagemArquivo') return;
      payload.append(key, value);
    });

    if (data.imagemArquivo) {
      payload.append('imagem', data.imagemArquivo);
    }

    return payload;
  };

  const canEdit = () => hasRole('admin') || hasRole('tecnico') || hasRole('operador');
  const canDelete = () => hasRole('admin');

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

      setDevolucoes(response.data.dados || []);
      setTotalRows(response.data.total || 0);
    } catch (error) {
      console.error('Erro ao carregar devolucoes:', error);
      alert('Erro ao carregar devolucoes');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    loadDevolucoes();
  }, [loadDevolucoes]);

  useEffect(() => {
    const cliente = formData.cliente?.trim();
    if (!cliente || cliente.length < 3 || editingDevolucao) {
      setMatchingChamados([]);
      return undefined;
    }

    const timeout = setTimeout(async () => {
      setLoadingMatches(true);
      try {
        const response = await chamadoService.findMatches({
          cliente,
          produto: formData.produto,
          codigo: formData.codigo,
        });
        setMatchingChamados(response.dados || []);
      } catch (error) {
        console.error('Erro ao buscar chamados relacionados:', error);
        setMatchingChamados([]);
      } finally {
        setLoadingMatches(false);
      }
    }, 450);

    return () => clearTimeout(timeout);
  }, [formData.cliente, formData.produto, formData.codigo, editingDevolucao]);

  const resetForm = () => {
    setFormData(initialFormData);
    setOcrResult(null);
    setMatchingChamados([]);
  };

  const handleAnalyzeLabel = async () => {
    if (!formData.imagemArquivo) {
      alert('Anexe a imagem da etiqueta antes de ler.');
      return;
    }

    setAnalyzingLabel(true);
    try {
      const payload = new FormData();
      payload.append('imagem', formData.imagemArquivo);

      const response = await api.post('/devolucao/etiqueta/analisar', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const fields = response.data.fields || {};
      setOcrResult(response.data);
      setFormData((prev) => ({
        ...prev,
        origem: prev.origem || fields.origem || '',
        cliente: prev.cliente || fields.cliente || '',
        produto: prev.produto || fields.produto || '',
        codigo: prev.codigo || fields.codigo || '',
        observacao: prev.observacao || fields.observacao || '',
        imagem: response.data.imagem || prev.imagem,
        imagemArquivo: null,
      }));
    } catch (error) {
      console.error('Erro ao ler etiqueta:', error);
      alert(error.response?.data?.error || 'Nao foi possivel ler a etiqueta. Preencha manualmente.');
    } finally {
      setAnalyzingLabel(false);
    }
  };

  const handleEditClick = (devolucao) => {
    if (!canEdit()) {
      alert('Voce nao tem permissao para editar devolucoes.');
      return;
    }

    setEditingDevolucao(devolucao);
    setFormData({
      origem: devolucao.origem || '',
      cliente: devolucao.cliente || '',
      produto: devolucao.produto || '',
      codigo: devolucao.codigo || '',
      observacao: devolucao.observacao || '',
      imagem: devolucao.imagem || '',
      imagemArquivo: null,
    });

    setEditDialogOpen(true);
  };

  const handleDeleteClick = (devolucao) => {
    if (!canDelete()) {
      alert('Apenas administradores podem excluir devolucoes.');
      return;
    }

    setDeletingDevolucao(devolucao);
    setDeleteDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingDevolucao(null);
    resetForm();
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeletingDevolucao(null);
  };

  const handleSaveEdit = async () => {
    if (!editingDevolucao) return;

    setSubmitting(true);
    try {
      const payload = buildMultipartPayload(formData);
      await api.put(`/devolucao/${editingDevolucao.id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Devolucao atualizada com sucesso!');
      handleCloseEditDialog();
      loadDevolucoes();
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao atualizar devolucao');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingDevolucao) return;

    const confirmacao = window.confirm(`Tem certeza que deseja excluir a devolucao #${deletingDevolucao.id}?`);
    if (!confirmacao) {
      handleCloseDeleteDialog();
      return;
    }

    setSubmitting(true);
    try {
      await api.delete(`/devolucao/${deletingDevolucao.id}`);
      alert('Devolucao excluida com sucesso!');
      handleCloseDeleteDialog();
      loadDevolucoes();
    } catch (error) {
      console.error('Erro ao excluir devolucao:', error);
      alert(error.response?.data?.error || 'Erro ao excluir devolucao');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      const payload = buildMultipartPayload(formData);
      const response = await api.post('/devolucao', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newDevolucao = response.data.data;
      const fechados = newDevolucao.chamadosFechados?.length || 0;

      alert(
        fechados > 0
          ? `Devolucao salva. ${fechados} chamado(s) de acompanhamento foram fechados.`
          : 'Devolucao salva com sucesso!'
      );

      printDevolucaoLabel(newDevolucao);
      resetForm();
      loadDevolucoes();
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao salvar devolucao');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = (devolucaoData) => {
    try {
      printDevolucaoLabel(devolucaoData.id === 'new' ? { id: 'NOVO', ...formData } : devolucaoData);
    } catch (error) {
      alert(error.message || 'Erro ao imprimir etiqueta');
    }
  };

  const handleExport = async () => {
    alert('Funcionalidade de exportacao em desenvolvimento');
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'origem', headerName: 'Origem', width: 150 },
    { field: 'cliente', headerName: 'Cliente', width: 150 },
    { field: 'produto', headerName: 'Produto', width: 150 },
    { field: 'codigo', headerName: 'Codigo', width: 150 },
    { field: 'data', headerName: 'Data/Hora', width: 180, type: 'datetime' },
    { field: 'observacao', headerName: 'Observacao', width: 200 },
    {
      field: 'imagem',
      headerName: 'Imagem',
      width: 120,
      render: (value) => value ? (
        <Button variant="text" size="small" onClick={() => window.open(buildImageUrl(value), '_blank')}>
          Ver imagem
        </Button>
      ) : 'Sem anexo',
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: { xs: 2, md: 3 }, fontSize: { xs: 26, md: 34 } }}>
        Devolucao
      </Typography>

      <Paper elevation={1} sx={{ p: { xs: 1.5, md: 3 }, mb: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Registrar Devolucao
        </Typography>

        <DevolucaoForm
          formData={formData}
          onChange={setFormData}
          loading={submitting}
          onAnalyzeImage={!editingDevolucao ? handleAnalyzeLabel : undefined}
          analyzingLabel={analyzingLabel}
          ocrResult={ocrResult}
        />

        {loadingMatches && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Verificando chamados abertos para este cliente...
          </Alert>
        )}

        {matchingChamados.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Existe {matchingChamados.length} chamado aberto para este cliente. Ao salvar, o sistema fecha o chamado e envia o aviso configurado.
          </Alert>
        )}

        <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          <Button variant="contained" startIcon={<Save />} onClick={handleSubmit} disabled={submitting} fullWidth>
            {submitting ? <CircularProgress size={24} /> : 'Salvar Devolucao'}
          </Button>
          <Button variant="outlined" startIcon={<Print />} onClick={() => handlePrint({ id: 'new', ...formData })} fullWidth>
            Imprimir previa
          </Button>
        </Box>
      </Paper>

      <Paper
        elevation={1}
        sx={{
          p: { xs: 1.5, md: 3 },
          border: '1px solid',
          borderColor: 'primary.main',
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          height: { xs: 'auto', md: '86vh' },
          overflow: 'auto',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Typography variant="h6">Historico de Devolucoes</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button startIcon={<Refresh />} onClick={loadDevolucoes} disabled={loading}>
              Atualizar
            </Button>
            <Button startIcon={<Download />} onClick={handleExport} variant="outlined" color="success">
              Exportar
            </Button>
          </Box>
        </Box>

        <SearchBar
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            setPage(0);
          }}
          placeholder="Pesquisar por origem, cliente, produto, codigo ou data..."
          sx={{ mb: 2 }}
        />

        <DataTable
          columns={columns}
          data={devolucoes}
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

      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="md" fullWidth fullScreen={window.innerWidth < 600}>
        <DialogTitle>
          <EditIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Editar Devolucao #{editingDevolucao?.id}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <DevolucaoForm formData={formData} onChange={setFormData} loading={submitting} />
        </DialogContent>
        <DialogActions sx={{ p: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'stretch' }}>
          <Button onClick={handleCloseEditDialog} variant="outlined" disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleSaveEdit} variant="contained" startIcon={<Save />} disabled={submitting}>
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Salvar Alteracoes'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <DeleteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Excluir Devolucao #{deletingDevolucao?.id}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta acao e irreversivel.
          </Alert>
          <Typography variant="body2">Cliente: {deletingDevolucao?.cliente}</Typography>
          <Typography variant="body2">Produto: {deletingDevolucao?.produto}</Typography>
          <Typography variant="body2">Origem: {deletingDevolucao?.origem}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDeleteDialog} variant="outlined" disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" startIcon={<DeleteIcon />} disabled={submitting} color="error">
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Excluir Devolucao'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DevolucaoPage;
