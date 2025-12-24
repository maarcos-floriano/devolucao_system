import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Save, Print, Refresh } from '@mui/icons-material';
import MaquinaForm from '../components/forms/MaquinaForm';
import DataTable from '../components/tables/DataTable';
import SearchBar from '../components/tables/SearchBar';
import { useSnackbar } from 'notistack';
import maquinaService from '../services/maquinaService';

const MaquinaPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [maquinas, setMaquinas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [formData, setFormData] = useState({
    processador: '',
    memoria: '',
    armazenamento: '',
    fonte: '',
    origem: '',
    responsavelMaquina: '',
    lacre: '',
    defeito: '',
    observacao: '',
    fkDevolucao: null,
  });

  // Carregar máquinas
  const loadMaquinas = async () => {
    setLoading(true);
    try {
      const response = await maquinaService.getAll(
        page + 1,
        rowsPerPage,
        searchTerm
      );
      setMaquinas(response.dados);
      setTotalRows(response.totalRegistros);
    } catch (error) {
      enqueueSnackbar('Erro ao carregar máquinas', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaquinas();
  }, [page, rowsPerPage, searchTerm]);

  // Salvar máquina
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await maquinaService.create({
        ...formData,
        data: new Date().toISOString().split('T')[0]
      });
      
      enqueueSnackbar('Máquina salva com sucesso!', { variant: 'success' });
      setFormData({
        processador: '',
        memoria: '',
        armazenamento: '',
        fonte: '',
        origem: '',
        responsavelMaquina: '',
        lacre: '',
        defeito: '',
        observacao: '',
        fkDevolucao: null,
      });
      loadMaquinas();
    } catch (error) {
      enqueueSnackbar('Erro ao salvar máquina', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Imprimir etiqueta
  const handlePrint = async (maquina) => {
    try {
      await maquinaService.printLabel(maquina.id);
      enqueueSnackbar('Etiqueta impressa com sucesso', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Erro ao imprimir etiqueta', { variant: 'error' });
    }
  };

  // Colunas da tabela
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'responsavelMaquina', headerName: 'Responsável', width: 130 },
    { field: 'processador', headerName: 'Processador', width: 150 },
    { field: 'memoria', headerName: 'Memória', width: 120 },
    { field: 'armazenamento', headerName: 'Armazenamento', width: 150 },
    { field: 'origem', headerName: 'Origem', width: 130 },
    { field: 'defeito', headerName: 'Defeito', width: 150 },
    { field: 'observacao', headerName: 'Observação', width: 200 },
    { field: 'data', headerName: 'Data', type: 'date', width: 120 },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Máquinas
      </Typography>

      <Grid container spacing={3}>
        {/* Tabela de Histórico */}
        <Grid item xs={12} md={7}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Histórico do Dia</Typography>
              <Button
                startIcon={<Refresh />}
                onClick={loadMaquinas}
                disabled={loading}
              >
                Atualizar
              </Button>
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
              onPageChange={setPage}
              onRowsPerPageChange={setRowsPerPage}
              onPrint={handlePrint}
              loading={loading}
            />
          </Paper>
        </Grid>

        {/* Formulário */}
        <Grid item xs={12} md={5}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cadastro de Máquina
            </Typography>

            <MaquinaForm
              formData={formData}
              onChange={setFormData}
              onSubmit={handleSubmit}
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
              <Button
                variant="outlined"
                startIcon={<Print />}
                onClick={() => handlePrint({ id: 'new', ...formData })}
                fullWidth
              >
                Imprimir
              </Button>
            </Box>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Instruções:</strong> Preencha todos os campos obrigatórios (*) 
                e clique em Salvar para registrar a máquina.
              </Typography>
            </Alert>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MaquinaPage;