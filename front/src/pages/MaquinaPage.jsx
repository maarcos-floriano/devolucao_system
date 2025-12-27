import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Container,
} from '@mui/material';
import { Save, Print, Refresh, Download } from '@mui/icons-material';
import MaquinaForm from '../components/forms/MaquinaForm';
import DataTable from '../components/tables/DataTable';
import SearchBar from '../components/tables/SearchBar';
import maquinaService from '../services/maquinaService';

const MaquinaPage = () => {
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
    placaVideo: '',
    gabinete: '',
    origem: '',
    responsavel: '',
    lacre: '',
    defeito: '',
    observacao: '',
    fkDevolucao: null,
  });

  // Funções de paginação
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // Carregar máquinas
  const loadMaquinas = useCallback(async () => {
    setLoading(true);
    try {
      // Buscar no backend
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

  // Salvar máquina
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Confirmações antes de salvar
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
      // Enviar para backend
      const payload = { ...formData };
      const res = await maquinaService.create(payload);

      alert('Máquina cadastrada!');

      // Imprimir etiqueta (se API retornar id em res.data ou res.data.data)
      const newId = res.data?.id || res.id || 'new';
      handlePrint({ id: newId, ...formData });

      setFormData({
        processador: '',
        memoria: '',
        armazenamento: '',
        fonte: '',
        origem: '',
        responsavel: '',
        lacre: '',
        defeito: '',
        observacao: '',
        fkDevolucao: null,
      });
      // Reload
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
          onChange={setFormData}
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
            <strong>Instruções:</strong> Preencha todos os campos obrigatórios.
            O sistema pedirá confirmação sobre lacre e adaptador Wi-Fi antes de salvar.
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
            loading={loading}
          />
      </Paper>
    </Box>
  );
};

export default MaquinaPage;