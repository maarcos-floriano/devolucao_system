// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Container,
  TextField,
  Stack,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Computer as ComputerIcon,
  Monitor as MonitorIcon,
  KeyboardReturn as ReturnIcon,
  Extension as KitIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    maquinas: 0,
    monitores: 0,
    devolucoes: 0,
    kits: 0,
  });
  const [chartsData, setChartsData] = useState({
    maquinasPorResponsavel: { labels: [], datasets: [] },
    maquinasHojePorResponsavel: { labels: [], datasets: [] },
    kitsPorConfiguracao: { labels: [], datasets: [] },
    maquinasPorConfiguracao: { labels: [], datasets: [] },
  });

  const formatDateToInput = (date) => date.toISOString().slice(0, 10);

  const [periodoRelatorio, setPeriodoRelatorio] = useState(() => {
    const hoje = new Date();
    const seteDiasAtras = new Date(hoje);
    seteDiasAtras.setDate(hoje.getDate() - 6);

    return {
      inicio: formatDateToInput(seteDiasAtras),
      fim: formatDateToInput(hoje),
    };
  });

  // Carregar dados da dashboard
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // ✅ CORRIGIDO: Usar endpoints corretos com /api/
      const [maquinasRes, monitoresRes, devolucoesRes, kitsRes] = await Promise.all([
        api.get('/maquinas?page=1&limit=1'),
        api.get('/monitores?page=1&limit=1'),
        api.get('/devolucao?page=1&limit=1'),
        api.get('/kits?page=1&limit=1'),
      ]);

      setKpis({
        maquinas: maquinasRes.data.total || 0,
        monitores: monitoresRes.data.total || 0,
        devolucoes: devolucoesRes.data.total || 0,
        kits: kitsRes.data.total || 0,
      });

      // ✅ CORRIGIDO: Usar prefixo correto
      const [todasMaquinas, todasKits] = await Promise.all([
        fetchAllPaginated('/maquinas'),
        fetchAllPaginated('/kits'),
      ]);

      // Preparar dados dos gráficos
      const maquinasPorResponsavel = processMaquinasPorResponsavel(todasMaquinas);
      const maquinasHojePorResponsavel = processMaquinasHojePorResponsavel(todasMaquinas);
      const kitsPorConfiguracao = processKitsPorConfiguracao(todasKits);
      const maquinasPorConfiguracao = processMaquinasPorConfiguracao(todasMaquinas);

      setChartsData({
        maquinasPorResponsavel,
        maquinasHojePorResponsavel,
        kitsPorConfiguracao,
        maquinasPorConfiguracao,
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPaginated = async (url) => {
    let allData = [];
    let page = 1;
    let totalPages = 1;

    try {
      do {
        const response = await api.get(`${url}?page=${page}&limit=50`);
        const data = response.data;
        allData = [...allData, ...(data.dados || [])];
        totalPages = data.totalPaginas || 1;
        page++;
      } while (page <= totalPages);
    } catch (error) {
      console.error(`Erro ao buscar ${url}:`, error);
    }

    return allData;
  };

  const processMaquinasPorResponsavel = (maquinas) => {
    const responsaveis = {};
    maquinas.forEach(m => {
      const responsavel = m.responsavel || 'Sem responsável';
      responsaveis[responsavel] = (responsaveis[responsavel] || 0) + 1;
    });

    const labels = Object.keys(responsaveis);
    const data = Object.values(responsaveis);

    return {
      labels,
      datasets: [{
        label: 'Máquinas',
        data,
        backgroundColor: [
          '#22c55e', '#3b82f6', '#f59e0b', '#ef4444',
          '#8b5cf6', '#ec4899', '#10b981', '#f97316'
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        borderRadius: 8,
      }]
    };
  };

  const processMaquinasHojePorResponsavel = (maquinas) => {
    const hoje = new Date();
    const maquinasDoDia = maquinas.filter((m) => {
      if (!m.data) return false;
      const dataMaquina = new Date(m.data);
      if (Number.isNaN(dataMaquina.getTime())) return false;

      return (
        dataMaquina.getDate() === hoje.getDate()
        && dataMaquina.getMonth() === hoje.getMonth()
        && dataMaquina.getFullYear() === hoje.getFullYear()
      );
    });

    const responsaveis = {};
    maquinasDoDia.forEach((m) => {
      const responsavel = m.responsavel || 'Sem responsável';
      responsaveis[responsavel] = (responsaveis[responsavel] || 0) + 1;
    });

    return {
      labels: Object.keys(responsaveis),
      datasets: [{
        label: 'Máquinas registradas hoje',
        data: Object.values(responsaveis),
        backgroundColor: [
          '#2563eb', '#16a34a', '#f59e0b', '#ef4444',
          '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16',
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        borderRadius: 8,
      }],
    };
  };

  const processKitsPorConfiguracao = (kits) => {
    const configs = {};
    kits.forEach(k => {
      const config = k.processador || 'Sem configuração';
      configs[config] = (configs[config] || 0) + 1;
    });

    const labels = Object.keys(configs);
    const data = Object.values(configs);

    return {
      labels,
      datasets: [{
        label: 'Kits',
        data,
        backgroundColor: [
          '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
          '#10b981', '#ef4444', '#f97316', '#6366f1'
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        borderRadius: 8,
      }]
    };
  };

  const processMaquinasPorConfiguracao = (maquinas) => {
    const configs = {};
    
    maquinas.forEach(m => {
      const config = m.processador || 'Sem configuração';
      configs[config] = (configs[config] || 0) + 1;
    });

    const labels = Object.keys(configs);
    const data = Object.values(configs);

    return {
      labels,
      datasets: [{
        label: 'Máquinas',
        data,
        backgroundColor: [
          '#10b981', '#f59e0b', '#3b82f6', '#ef4444',
          '#8b5cf6', '#ec4899', '#f97316', '#22c55e'
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        borderRadius: 8,
      }]
    };
  };

  // ✅ CORRIGIDO: Funções de exportação com endpoints corretos
  const getPeriodoQueryString = () => {
    const query = new URLSearchParams();

    if (periodoRelatorio.inicio) query.append('dataInicio', periodoRelatorio.inicio);
    if (periodoRelatorio.fim) query.append('dataFim', periodoRelatorio.fim);

    return query.toString();
  };

  const handlePeriodoChange = (campo) => (event) => {
    const valor = event.target.value;
    setPeriodoRelatorio((prev) => ({ ...prev, [campo]: valor }));
  };

  const definirUltimosSeteDias = () => {
    const hoje = new Date();
    const seteDiasAtras = new Date(hoje);
    seteDiasAtras.setDate(hoje.getDate() - 6);

    setPeriodoRelatorio({
      inicio: formatDateToInput(seteDiasAtras),
      fim: formatDateToInput(hoje),
    });
  };

  const handleExportReport = (tipo) => {
    const periodo = getPeriodoQueryString();
    const urlBase = `http://192.168.15.100:3001/api/relatorios/excel/${tipo}`;
    const urlFinal = periodo ? `${urlBase}?${periodo}` : urlBase;

    window.open(urlFinal, '_blank');
  };

  const handleExportSkuReport = (tipo) => {
    const endpoints = {
      maquinas: 'http://192.168.15.100:3001/api/relatorios/paulinho/maquinas',
      monitores: 'http://192.168.15.100:3001/api/relatorios/paulinho/monitores',
      kit: 'http://192.168.15.100:3001/api/relatorios/paulinho/kit',
    };
    window.open(endpoints[tipo], '_blank');
  };

  const handleSacReport = () => {
    const periodo = getPeriodoQueryString();
    const urlBase = 'http://192.168.15.100:3001/api/relatorios/sac/semanal';
    const urlFinal = periodo ? `${urlBase}?${periodo}` : urlBase;

    window.open(urlFinal, '_blank');
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
            family: "'Montserrat', sans-serif",
          },
          color: '#374151',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { family: "'Montserrat', sans-serif" },
        bodyFont: { family: "'Montserrat', sans-serif" },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            family: "'Montserrat', sans-serif",
          },
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            family: "'Montserrat', sans-serif",
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header com título e botão de atualizar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold" color="#0f172a">
          📊 Dashboard de Controle Técnico
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={loadDashboardData}
          sx={{
            bgcolor: '#2563eb',
            '&:hover': { bgcolor: '#1d4ed8' },
          }}
        >
          Atualizar
        </Button>
      </Box>

      {/* KPIs */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total de Máquinas"
            value={kpis.maquinas}
            icon={<ComputerIcon />}
            color="#2563eb"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total de Monitores"
            value={kpis.monitores}
            icon={<MonitorIcon />}
            color="#22c55e"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total de Devoluções"
            value={kpis.devolucoes}
            icon={<ReturnIcon />}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total de Kits"
            value={kpis.kits}
            icon={<KitIcon />}
            color="#8b5cf6"
          />
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="600" mb={3} color="#0f172a">
              Máquinas por Responsável
            </Typography>
            <Box height={300}>
              <Bar data={chartsData.maquinasPorResponsavel} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="600" mb={3} color="#0f172a">
              Máquinas Registradas Hoje por Responsável
            </Typography>
            <Box height={300}>
              <Bar data={chartsData.maquinasHojePorResponsavel} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="600" mb={3} color="#0f172a">
              Kits por Configuração
            </Typography>
            <Box height={300}>
              <Bar data={chartsData.kitsPorConfiguracao} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="600" mb={3} color="#0f172a">
              Máquinas por Configuração
            </Typography>
            <Box height={300}>
              <Bar data={chartsData.maquinasPorConfiguracao} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Relatórios */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="600" mb={3} color="#0f172a">
          📄 Relatórios por Período
        </Typography>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          mb={3}
          alignItems={{ xs: 'stretch', md: 'center' }}
        >
          <TextField
            label="Data inicial"
            type="date"
            value={periodoRelatorio.inicio}
            onChange={handlePeriodoChange('inicio')}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ minWidth: 180 }}
          />
          <TextField
            label="Data final"
            type="date"
            value={periodoRelatorio.fim}
            onChange={handlePeriodoChange('fim')}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ minWidth: 180 }}
          />
          <Button variant="outlined" onClick={definirUltimosSeteDias}>
            Últimos 7 dias
          </Button>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => handleExportReport('devolucao')}
              sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}
            >
              Devoluções no Período
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => handleExportReport('maquinas')}
              sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
            >
              Máquinas no Período
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => handleExportReport('kit')}
              sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}
            >
              Kit no Período
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => handleExportReport('monitores')}
              sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
            >
              Monitores no Período
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<TrendingUpIcon />}
              onClick={() => handleExportSkuReport('maquinas')}
              sx={{ borderColor: '#3b82f6', color: '#3b82f6' }}
            >
              SKU Máquinas
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<TrendingUpIcon />}
              onClick={() => handleExportSkuReport('monitores')}
              sx={{ borderColor: '#10b981', color: '#10b981' }}
            >
              SKU Monitores
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<TrendingUpIcon />}
              onClick={() => handleExportSkuReport('kit')}
              sx={{ borderColor: '#8b5cf6', color: '#8b5cf6' }}
            >
              SKU Kit
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleSacReport}
              sx={{ borderColor: '#ec4899', color: '#ec4899' }}
            >
              SAC no Período
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

const KpiCard = ({ title, value, icon, color }) => (
  <Card sx={{ borderRadius: 3, borderLeft: `4px solid ${color}`, height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={2} gap={2}>
        <Box
          sx={{
            bgcolor: `${color}20`,
            p: 1,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {React.cloneElement(icon, { sx: { color, fontSize: 28 } })}
        </Box>
        <Typography variant="body2" color="text.secondary" fontWeight="500">
          {title}
        </Typography>
      </Box>
      <Typography variant="h3" fontWeight="bold" color={color}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

export default DashboardPage;
