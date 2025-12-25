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
} from '@mui/material';
import { Save, Refresh, Download } from '@mui/icons-material';
import MonitorForm from '../components/forms/MonitorForm';
import DataTable from '../components/tables/DataTable';

const MonitorPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [monitores, setMonitores] = useState([]);
  const [formData, setFormData] = useState({
    marca: '',
    tamanho: '',
    quantidade: 1,
    rma: false,
    responsavel: '',
    data: new Date().toISOString().split('T')[0],
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  // Carregar monitores
  const loadMonitores = useCallback(async () => {
    setLoading(true);
    try {
      // Simulação - substitua pela sua API real
      const mockData = [
        { id: 1, marca: 'Ultra', tamanho: '21.5', quantidade: 2, rma: false, responsavel: 'Marcos', data: '2024-01-15' },
        { id: 2, marca: 'Tronos', tamanho: '24', quantidade: 1, rma: true, responsavel: 'Kell', data: '2024-01-15' },
      ];
      setMonitores(mockData);
    } catch (error) {
      console.error('Erro ao carregar monitores:', error);
      alert('Erro ao carregar monitores');
    } finally {
      setLoading(false);
    }
  }, []);

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
          // Simulação - substitua pela sua API real
          console.log('Salvando monitor:', formData);
          
          alert('Monitor salvo com sucesso!');
          
          setFormData({
            marca: '',
            tamanho: '',
            quantidade: 1,
            rma: false,
            responsavel: '',
            data: new Date().toISOString().split('T')[0],
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
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Monitores
      </Typography>

      <Grid container spacing={3}>
        {/* Tabela de Histórico */}
        <Grid item xs={12} md={7}>
          <Paper elevation={2} sx={{ p: 2 }}>
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

            <DataTable
              columns={columns}
              data={monitores}
              loading={loading}
            />
          </Paper>
        </Grid>

        {/* Formulário */}
        <Grid item xs={12} md={5}>
          <Paper elevation={2} sx={{ p: 3 }}>
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
        </Grid>
      </Grid>

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
    </Box>
  );
};

export default MonitorPage;