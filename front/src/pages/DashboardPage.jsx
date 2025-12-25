import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Container,
} from '@mui/material';
import { Download, Refresh } from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import KpiCard from '../components/dashboard/KpiCard';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    maquinas: [],
    monitores: [],
  });
  const [kpis, setKpis] = useState({
    totalMaquinas: 0,
    totalMonitores: 0,
    pecasDefeito: 0,
    pacotesMercadoLivre: 0,
  });

  // Carregar dados do dashboard
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [maquinasRes, monitoresRes] = await Promise.all([
        api.get('/api/maquinas'),
        api.get('/api/monitores'),
      ]);

      const maquinas = maquinasRes.data.dados || [];
      const monitores = monitoresRes.data.dados || [];

      setDashboardData({ maquinas, monitores });

      setKpis({
        totalMaquinas: maquinas.length,
        totalMonitores: monitores.reduce((acc, m) => acc + (m.quantidade || 1), 0),
        pecasDefeito: monitores.filter(m => m.rma === 1).length,
        pacotesMercadoLivre: maquinas.filter(
          m => m.origem?.toLowerCase().includes('mercado')
        ).length,
      });
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Exportar relatórios
  const handleExport = (tipo) => {
    alert(`Exportando ${tipo}... (funcionalidade em desenvolvimento)`);
  };

  // Dados para gráficos
  const getMaquinasPorDiaData = () => {
    const maquinasPorDia = {};
    dashboardData.maquinas.forEach(m => {
      const data = m.data?.split('T')[0] || m.data;
      maquinasPorDia[data] = (maquinasPorDia[data] || 0) + 1;
    });

    const labels = Object.keys(maquinasPorDia).sort();
    const data = labels.map(date => maquinasPorDia[date]);

    return {
      labels,
      datasets: [
        {
          label: 'Máquinas Registradas',
          data,
          backgroundColor: '#22c55e',
          borderColor: '#16a34a',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  };

  const getMonitoresPorMarcaData = () => {
    const monitoresPorMarca = {};
    dashboardData.monitores.forEach(m => {
      monitoresPorMarca[m.marca] = (monitoresPorMarca[m.marca] || 0) + (m.quantidade || 1);
    });

    const colors = [
      '#22c55e', '#16a34a', '#4ade80', '#86efac', '#bbf7d0',
      '#15803d', '#166534', '#14532d', '#052e16'
    ];

    return {
      labels: Object.keys(monitoresPorMarca),
      datasets: [
        {
          label: 'Monitores por Marca',
          data: Object.values(monitoresPorMarca),
          backgroundColor: colors,
          borderColor: colors.map(color => color + 'cc'),
          borderWidth: 1,
        },
      ],
    };
  };

  const getPecasDefeitoData = () => {
    const monitoresDefeito = dashboardData.monitores.filter(m => m.rma);
    const marcasDefeito = {};

    monitoresDefeito.forEach(m => {
      marcasDefeito[m.marca] = (marcasDefeito[m.marca] || 0) + 1;
    });

    const colors = [
      '#ef4444', '#dc2626', '#f87171', '#fca5a5', '#fecaca',
      '#991b1b', '#7f1d1d', '#450a0a'
    ];

    return {
      labels: Object.keys(marcasDefeito),
      datasets: [
        {
          data: Object.values(marcasDefeito),
          backgroundColor: colors,
          borderColor: colors.map(color => color + 'cc'),
          borderWidth: 1,
        },
      ],
    };
  };

  const getMarcasProblemaData = () => {
    const maquinasDefeito = dashboardData.maquinas.filter(m => m.defeito);
    const marcasDefeito = {};

    maquinasDefeito.forEach(m => {
      marcasDefeito[m.origem] = (marcasDefeito[m.origem] || 0) + 1;
    });

    const colors = [
      '#f59e0b', '#d97706', '#fbbf24', '#fcd34d', '#fde68a',
      '#92400e', '#78350f', '#451a03'
    ];

    return {
      labels: Object.keys(marcasDefeito),
      datasets: [
        {
          data: Object.values(marcasDefeito),
          backgroundColor: colors,
          borderColor: colors.map(color => color + 'cc'),
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Montserrat',
            size: 12,
          },
          color: '#1f2937',
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4" sx={{ color: '#15803d', fontWeight: 700 }}>
          Dashboard RMA
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadDashboardData}
          disabled={loading}
          sx={{
            borderColor: '#22c55e',
            color: '#22c55e',
            '&:hover': {
              borderColor: '#16a34a',
              backgroundColor: '#f0fdf4',
            },
          }}
        >
          {loading ? <CircularProgress size={20} /> : 'Atualizar'}
        </Button>
      </Box>

      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total de Máquinas"
            value={kpis.totalMaquinas}
            icon="🖥️"
            color="#22c55e"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total de Monitores"
            value={kpis.totalMonitores}
            icon="🖥️"
            color="#16a34a"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Peças com Defeito (RMA)"
            value={kpis.pecasDefeito}
            icon="⚠️"
            color="#ef4444"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Pacotes Mercado Livre"
            value={kpis.pacotesMercadoLivre}
            icon="📦"
            color="#3b82f6"
          />
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              height: 320,
              border: '2px solid',
              borderColor: 'primary.main',
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.dark', fontWeight: 600 }}>
              Máquinas por Dia
            </Typography>
            <Box sx={{ height: 250 }}>
              <Bar
                data={getMaquinasPorDiaData()}
                options={chartOptions}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              height: 320,
              border: '2px solid',
              borderColor: 'primary.main',
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.dark', fontWeight: 600 }}>
              Monitores por Marca
            </Typography>
            <Box sx={{ height: 250 }}>
              <Bar
                data={getMonitoresPorMarcaData()}
                options={chartOptions}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              height: 320,
              border: '2px solid',
              borderColor: 'primary.main',
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.dark', fontWeight: 600 }}>
              Peças com Defeito
            </Typography>
            <Box sx={{ height: 250 }}>
              <Pie
                data={getPecasDefeitoData()}
                options={chartOptions}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              height: 320,
              border: '2px solid',
              borderColor: 'primary.main',
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.dark', fontWeight: 600 }}>
              Origem dos Problemas
            </Typography>
            <Box sx={{ height: 250 }}>
              <Pie
                data={getMarcasProblemaData()}
                options={chartOptions}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Exportar Relatórios */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          border: '2px solid',
          borderColor: 'primary.main',
          borderRadius: 3,
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.dark', fontWeight: 600, mb: 3 }}>
          Exportar Relatórios
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Download />}
              onClick={() => handleExport('maquinas')}
              sx={{
                backgroundColor: '#22c55e',
                '&:hover': { backgroundColor: '#16a34a' },
              }}
            >
              Relatório de Máquinas
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Download />}
              onClick={() => handleExport('monitores')}
              sx={{
                backgroundColor: '#16a34a',
                '&:hover': { backgroundColor: '#15803d' },
              }}
            >
              Relatório de Monitores
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Download />}
              onClick={() => handleExport('pecas')}
              sx={{
                backgroundColor: '#ef4444',
                '&:hover': { backgroundColor: '#dc2626' },
              }}
            >
              Relatório de Peças
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Download />}
              onClick={() => handleExport('mercadoLivre')}
              sx={{
                backgroundColor: '#3b82f6',
                '&:hover': { backgroundColor: '#2563eb' },
              }}
            >
              Pacotes Mercado Livre
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default DashboardPage;