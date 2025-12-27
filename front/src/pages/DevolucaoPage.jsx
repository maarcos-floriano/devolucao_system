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
import { Save, Refresh, Download, Print } from '@mui/icons-material';
import DevolucaoForm from '../components/forms/DevolucaoForm';
import DataTable from '../components/tables/DataTable';
import SearchBar from '../components/tables/SearchBar';
import api from '../services/api';

const DevolucaoPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [devolucoes, setDevolucoes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [formData, setFormData] = useState({
    origem: '',
    cliente: '',
    produto: '',
    codigo: '',
    observacao: '',
    dataHora: '',
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

  // Carregar devoluções
  const loadDevolucoes = useCallback(async () => {
    setLoading(true);
    try {
      // Substitua pela sua API real
      const response = await api.get('/devolucao', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: searchTerm,
        },
      });
      
      // Simulação com dados mockados enquanto não tem API
      const mockData = [
        { 
          id: 1, 
          origem: 'Mercado Livre', 
          cliente: 'João Silva', 
          produto: 'PC Gamer', 
          codigo: 'ML123456', 
          dataHora: '2024-01-15 14:30:00',
          observacao: 'Defeito na placa de vídeo'
        },
        { 
          id: 2, 
          origem: 'Shopee', 
          cliente: 'Maria Santos', 
          produto: 'Monitor 24"', 
          codigo: 'SH789012', 
          dataHora: '2024-01-15 10:15:00',
          observacao: ''
        },
        { 
          id: 3, 
          origem: 'Amazon', 
          cliente: 'Pedro Costa', 
          produto: 'Notebook', 
          codigo: 'AMZ456789', 
          dataHora: '2024-01-14 16:45:00',
          observacao: 'Tela quebrada'
        },
        { 
          id: 4, 
          origem: 'Mercado Livre', 
          cliente: 'Ana Souza', 
          produto: 'Tablet', 
          codigo: 'ML987654', 
          dataHora: '2024-01-14 11:20:00',
          observacao: 'Não liga'
        },
        { 
          id: 5, 
          origem: 'Shopee', 
          cliente: 'Carlos Lima', 
          produto: 'Smartphone', 
          codigo: 'SH321654', 
          dataHora: '2024-01-13 09:30:00',
          observacao: 'Bateria com defeito'
        },
        { 
          id: 6, 
          origem: 'Amazon', 
          cliente: 'Fernanda Rocha', 
          produto: 'Fone Bluetooth', 
          codigo: 'AMZ789123', 
          dataHora: '2024-01-13 15:10:00',
          observacao: 'Não pareia'
        },
        { 
          id: 7, 
          origem: 'Mercado Livre', 
          cliente: 'Ricardo Alves', 
          produto: 'Teclado Mecânico', 
          codigo: 'ML456123', 
          dataHora: '2024-01-12 13:25:00',
          observacao: 'Tecla space não funciona'
        },
        { 
          id: 8, 
          origem: 'Shopee', 
          cliente: 'Patrícia Santos', 
          produto: 'Mouse Gamer', 
          codigo: 'SH987321', 
          dataHora: '2024-01-12 17:40:00',
          observacao: 'Scroll com problema'
        },
        { 
          id: 9, 
          origem: 'Amazon', 
          cliente: 'Luiz Ferreira', 
          produto: 'Webcam', 
          codigo: 'AMZ654987', 
          dataHora: '2024-01-11 10:55:00',
          observacao: 'Imagem pixelada'
        },
        { 
          id: 10, 
          origem: 'Mercado Livre', 
          cliente: 'Juliana Martins', 
          produto: 'SSD 1TB', 
          codigo: 'ML321789', 
          dataHora: '2024-01-11 14:15:00',
          observacao: 'Não é reconhecido'
        },
        { 
          id: 11, 
          origem: 'Shopee', 
          cliente: 'Roberto Nunes', 
          produto: 'Placa de Vídeo', 
          codigo: 'SH654987', 
          dataHora: '2024-01-10 16:30:00',
          observacao: 'Artefatos na tela'
        },
        { 
          id: 12, 
          origem: 'Amazon', 
          cliente: 'Camila Oliveira', 
          produto: 'Processador', 
          codigo: 'AMZ123456', 
          dataHora: '2024-01-10 11:45:00',
          observacao: 'Superaquecimento'
        },
      ];
      
      // Simulação de paginação no frontend
      const startIndex = page * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      const paginatedData = mockData.slice(startIndex, endIndex);
      
      setDevolucoes(paginatedData);
      setTotalRows(mockData.length);
      
      // Quando tiver API real, use:
      // setDevolucoes(response.data.dados || []);
      // setTotalRows(response.data.total || 0);
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

  // Salvar devolução
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setConfirmDialog({
      open: true,
      title: 'Confirmar Devolução',
      message: 'Confirma o registro desta devolução?',
      onConfirm: async () => {
        setSubmitting(true);
        try {
          alert('Devolução salva com sucesso!');
          
          await handlePrint();
          
          setFormData({
            origem: '',
            cliente: '',
            produto: '',
            codigo: '',
            observacao: '',
            dataHora: '',
          });
          loadDevolucoes();
        } catch (error) {
          alert('Erro ao salvar devolução');
          console.error(error);
        } finally {
          setSubmitting(false);
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      },
    });
  };

  // Imprimir etiqueta
  const handlePrint = async () => {
    try {
      // Simulação - substitua pela sua API real
      const devolucao = {
        id: Math.floor(Math.random() * 1000) + 1,
        cliente: formData.cliente || 'Cliente Exemplo',
        origem: formData.origem || 'Mercado Livre'
      };
      
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
            />

            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexDirection: 'column' }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSubmit}
                disabled={submitting}
                fullWidth
              >
                {submitting ? <CircularProgress size={24} /> : 'Salvar Devolução'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Print />}
                onClick={handlePrint}
                fullWidth
              >
                Imprimir Etiqueta
              </Button>
            </Box>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Instruções:</strong> Após salvar, a etiqueta será impressa automaticamente.
                A data e hora são preenchidas automaticamente.
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
    </Box>
  );
};

export default DevolucaoPage;