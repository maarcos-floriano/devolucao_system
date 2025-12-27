import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
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
import { Save, Refresh, Download } from '@mui/icons-material';
import MonitorForm from '../components/forms/MonitorForm';
import DataTable from '../components/tables/DataTable';
import SearchBar from '../components/tables/SearchBar';
import api from '../services/api';

const MonitorPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [monitores, setMonitores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [formData, setFormData] = useState({
    marca: '',
    tamanho: '',
    rma: false,
    responsavel: '',
    fkDevolucao: null,
    observacao: ''
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  // Funções de paginação
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // Carregar monitores
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
  }, [page, rowsPerPage]);

  useEffect(() => {
    loadMonitores();
  }, [loadMonitores]);

  // Salvar monitor
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setConfirmDialog({
      open: true,
      title: 'Confirmar Cadastro',
      message: 'Confirma o registro deste monitor?',
      onConfirm: async () => {
        setSubmitting(true);
        try {
          alert('Monitor salvo com sucesso!');
          
          setFormData({
            marca: '',
            tamanho: '',
            rma: false,
            responsavel: '',
            fkDevolucao: null,
            observacao: ''
          });
          loadMonitores();
        } catch (error) {
          alert('Erro ao salvar monitor');
          console.error(error);
        } finally {
          setSubmitting(false);
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      },
    });
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
    { field: 'quantidade', headerName: 'Quantidade', width: 100, align: 'center' },
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
    { field: 'data', headerName: 'Data', width: 120, type: 'date' },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Monitores
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
              Cadastro de Monitor
            </Typography>

            <MonitorForm
              formData={formData}
              onChange={setFormData}
              loading={submitting}
            />

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSubmit}
                disabled={submitting}
                fullWidth
              >
                {submitting ? <CircularProgress size={24} /> : 'Salvar'}
              </Button>
            </Box>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Instruções:</strong> Marque "RMA" se o monitor está com defeito.
                A data é automaticamente preenchida com o dia atual.
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
            overflow: 'hidden',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Histórico do Dia</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
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
            placeholder="Pesquisar por marca, tamanho, responsável..."
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
            loading={loading}
          />
        </Paper>


      {/* Diálogo de Confirmação */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
            Cancelar
          </Button>
          <Button
            onClick={confirmDialog.onConfirm}
            variant="contained"
            color="primary"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MonitorPage;