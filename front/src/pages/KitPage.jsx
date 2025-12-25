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
import { Save, Refresh, Print, Download } from '@mui/icons-material';
import KitForm from '../components/forms/KitForm';
import DataTable from '../components/tables/DataTable';
import SearchBar from '../components/tables/SearchBar';

const KitPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [kits, setKits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [origem, setOrigem] = useState('');
  const [formData, setFormData] = useState({
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
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  // Carregar kits
  const loadKits = useCallback(async () => {
    setLoading(true);
    try {
      // Simulação - substitua pela sua API real
      const mockData = [
        { 
          id: 1, 
          processador: 'i5 10ª Geração', 
          memoria: '16GB DDR4', 
          placaMae: 'BPC-H510M.2',
          responsavel: 'Marcos',
          origem: 'Mercado Livre',
          observacao: 'Kit completo',
          data: '2024-01-15'
        },
        { 
          id: 2, 
          processador: 'i7 9ª Geração', 
          memoria: '32GB DDR4', 
          placaMae: 'Revenger-H310/B250',
          responsavel: 'Kell',
          origem: 'Shopee',
          observacao: '',
          data: '2024-01-15'
        },
      ];
      
      setKits(mockData);
      setTotalRows(mockData.length);
    } catch (error) {
      console.error('Erro ao carregar kits:', error);
      alert('Erro ao carregar kits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKits();
  }, [loadKits]);

  // Verificações antes de salvar
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setConfirmDialog({
      open: true,
      title: 'Verificações',
      message: 'Por favor, confirme as verificações necessárias:',
      onConfirm: async () => {
        setSubmitting(true);
        try {
          // Simulação - substitua pela sua API real
          console.log('Salvando kit:', formData);
          
          alert('Kit salvo com sucesso!');
          
          // Imprimir etiqueta
          handlePrint('new');
          
          setFormData({
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
          });
          setOrigem('');
          loadKits();
        } catch (error) {
          alert('Erro ao salvar kit');
          console.error(error);
        } finally {
          setSubmitting(false);
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      },
    });
  };

  // Imprimir etiqueta
  const handlePrint = (id) => {
    const data = id === 'new' ? formData : kits.find(k => k.id === id) || formData;
    
    const janela = window.open('', '_blank');
    const conteudoHTML = `
      <html>
        <head>
          <title>Etiqueta Kit</title>
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
            <h1>${data.id || 'NOVO'}</h1>
            <div>
              ${data.processador}<br>
              ${data.memoria}<br>
              ${data.placaMae}
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

      <Grid container spacing={3}>
        {/* Tabela de Histórico */}
        <Grid item xs={12} md={7}>
          <Paper elevation={2} sx={{ p: 2 }}>
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
              placeholder="Pesquisar por config, origem, responsável..."
              sx={{ mb: 2 }}
            />

            <DataTable
              columns={columns}
              data={kits}
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
              Cadastro de Kit
            </Typography>

            <KitForm
              formData={formData}
              onChange={setFormData}
              origem={origem}
              onOrigemChange={setOrigem}
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
                onClick={() => handlePrint('new')}
                fullWidth
              >
                Imprimir
              </Button>
            </Box>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Instruções:</strong> Preencha todos os campos obrigatórios (*).
                Quando a origem for diferente de "Outro", você poderá vincular a uma devolução.
              </Typography>
            </Alert>
          </Paper>
        </Grid>
      </Grid>

      {/* Diálogo de Verificações */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              Por favor, confirme:
            </Typography>
            <ul>
              <li><Typography variant="body2">Colocou o lacre?</Typography></li>
              <li><Typography variant="body2">Colocou o adaptador Wi-Fi?</Typography></li>
            </ul>
          </Box>
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
            Sim, Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KitPage;