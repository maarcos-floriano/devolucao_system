import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Assessment,
  CalendarMonth,
  Computer as ComputerIcon,
  Download as DownloadIcon,
  KeyboardReturn as ReturnIcon,
  Monitor as MonitorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { Bar } from 'react-chartjs-2';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MAX_CHART_ITEMS = 12;
const CHART_COLORS = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#10b981', '#f97316',
  '#2563eb', '#16a34a', '#06b6d4', '#84cc16',
];

const formatDateToInput = (date) => date.toISOString().slice(0, 10);

const incrementCounter = (counter, key) => {
  const normalizedKey = key || 'Sem informacao';
  counter[normalizedKey] = (counter[normalizedKey] || 0) + 1;
};

const buildChartDataFromCounter = (counter, label) => {
  const entries = Object.entries(counter).sort(([, totalA], [, totalB]) => totalB - totalA);

  if (entries.length > MAX_CHART_ITEMS) {
    const topEntries = entries.slice(0, MAX_CHART_ITEMS - 1);
    const outrosTotal = entries
      .slice(MAX_CHART_ITEMS - 1)
      .reduce((accumulator, [, total]) => accumulator + total, 0);

    entries.length = 0;
    entries.push(...topEntries, ['Outros', outrosTotal]);
  }

  return {
    labels: entries.map(([entryLabel]) => entryLabel),
    datasets: [{
      label,
      data: entries.map(([, total]) => total),
      backgroundColor: entries.map((_, index) => CHART_COLORS[index % CHART_COLORS.length]),
      borderColor: '#ffffff',
      borderWidth: 2,
      borderRadius: 6,
    }],
  };
};

const getWeekRange = (offsetWeeks = 0) => {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) + (offsetWeeks * 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    inicio: formatDateToInput(monday),
    fim: formatDateToInput(sunday),
  };
};

const getLastSevenDays = () => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 6);
  return { inicio: formatDateToInput(start), fim: formatDateToInput(today) };
};

const getApiDownloadUrl = (path, params = {}) => {
  const baseUrl = (process.env.REACT_APP_API_URL || api.defaults.baseURL || '').replace(/\/$/, '');
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });

  return `${baseUrl}${path}${query.toString() ? `?${query.toString()}` : ''}`;
};

const reportTypeLabels = {
  detalhado: 'Detalhado',
  soma: 'Somente soma',
  sku: 'Agrupar por SKU',
  defeito: 'Agrupar por defeito',
  sku_defeito: 'SKU + defeito',
};

const DashboardPage = () => {
  const didInitialLoadRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [kpis, setKpis] = useState({ maquinas: 0, monitores: 0, devolucoes: 0 });
  const [chartsData, setChartsData] = useState({
    maquinasPorDefeito: { labels: [], datasets: [] },
    maquinasHojePorConfiguracao: { labels: [], datasets: [] },
    maquinasPorConfiguracao: { labels: [], datasets: [] },
  });
  const [periodoRelatorio, setPeriodoRelatorio] = useState(getLastSevenDays);
  const [machineReportFilters, setMachineReportFilters] = useState({
    ...getWeekRange(0),
    tipo: 'sku',
    sku: '',
    defeito: '',
  });
  const [machineReport, setMachineReport] = useState(null);

  const fetchPaginatedCounters = useCallback(async (url, onItem) => {
    let page = 1;
    let totalPages = 1;

    do {
      const response = await api.get(`${url}?page=${page}&limit=200`);
      const data = response.data;
      const items = data.dados || [];

      items.forEach(onItem);
      totalPages = data.totalPaginas || 1;
      page += 1;
    } while (page <= totalPages);
  }, []);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [maquinasRes, monitoresRes, devolucoesRes] = await Promise.all([
        api.get('/maquinas?page=1&limit=1'),
        api.get('/monitores?page=1&limit=1'),
        api.get('/devolucao?page=1&limit=1'),
      ]);

      setKpis({
        maquinas: maquinasRes.data.total || 0,
        monitores: monitoresRes.data.total || 0,
        devolucoes: devolucoesRes.data.total || 0,
      });

      const today = formatDateToInput(new Date());
      const maquinasPorDefeitoCounter = {};
      const maquinasHojePorConfiguracaoCounter = {};
      const maquinasPorConfiguracaoCounter = {};

      await fetchPaginatedCounters('/maquinas', (maquina) => {
        incrementCounter(maquinasPorDefeitoCounter, maquina.defeito || 'Sem defeito informado');
        incrementCounter(maquinasPorConfiguracaoCounter, maquina.codigo || 'Sem configuracao');

        if (String(maquina.data_registro || '').slice(0, 10) === today) {
          incrementCounter(maquinasHojePorConfiguracaoCounter, maquina.codigo || 'Sem configuracao');
        }
      });

      setChartsData({
        maquinasPorDefeito: buildChartDataFromCounter(maquinasPorDefeitoCounter, 'Maquinas'),
        maquinasHojePorConfiguracao: buildChartDataFromCounter(maquinasHojePorConfiguracaoCounter, 'Hoje'),
        maquinasPorConfiguracao: buildChartDataFromCounter(maquinasPorConfiguracaoCounter, 'Maquinas'),
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchPaginatedCounters]);

  const loadMachineReport = useCallback(async (override = {}) => {
    const filters = { ...machineReportFilters, ...override };
    setMachineReportFilters(filters);
    setReportLoading(true);
    try {
      const response = await api.get('/relatorios/maquinas/flex', { params: filters });
      setMachineReport(response.data);
    } catch (error) {
      console.error('Erro ao gerar relatorio de maquinas:', error);
      alert(error.response?.data?.error || 'Erro ao gerar relatorio de maquinas');
    } finally {
      setReportLoading(false);
    }
  }, [machineReportFilters]);

  useEffect(() => {
    if (didInitialLoadRef.current) return;
    didInitialLoadRef.current = true;
    loadDashboardData();
    loadMachineReport();
  }, [loadDashboardData, loadMachineReport]);

  const handlePeriodoChange = (campo) => (event) => {
    const valor = event.target.value;
    setPeriodoRelatorio((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleMachineFilterChange = (campo) => (event) => {
    const valor = event.target.value;
    setMachineReportFilters((prev) => ({ ...prev, [campo]: valor }));
  };

  const applyMachinePreset = (preset) => {
    const today = new Date();
    let range = getWeekRange(0);

    if (preset === 'hoje') range = { inicio: formatDateToInput(today), fim: formatDateToInput(today) };
    if (preset === 'ultimos7') range = getLastSevenDays();
    if (preset === 'semanaAtual') range = getWeekRange(0);
    if (preset === 'semanaPassada') range = getWeekRange(-1);

    loadMachineReport(range);
  };

  const exportMachineReport = (tipo = machineReportFilters.tipo) => {
    window.open(getApiDownloadUrl('/relatorios/maquinas/flex/excel', {
      ...machineReportFilters,
      tipo,
    }), '_blank');
  };

  const exportSimpleReport = (tabela) => {
    window.open(getApiDownloadUrl(`/relatorios/excel/${tabela}`, {
      dataInicio: periodoRelatorio.inicio,
      dataFim: periodoRelatorio.fim,
    }), '_blank');
  };

  const exportSacReport = () => {
    window.open(getApiDownloadUrl('/relatorios/sac/semanal', {
      dataInicio: periodoRelatorio.inicio,
      dataFim: periodoRelatorio.fim,
    }), '_blank');
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
    },
    scales: {
      y: { beginAtZero: true },
      x: { ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 } },
    },
  };

  const previewRows = machineReport?.dados?.slice(0, 8) || [];
  const previewColumns = previewRows.length ? Object.keys(previewRows[0]) : [];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 1, md: 3 }, px: { xs: 0, sm: 2 } }}>
      <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} mb={3} gap={1.5} flexDirection={{ xs: 'column', sm: 'row' }}>
        <Typography variant="h4" fontWeight="bold" color="#0f172a" sx={{ fontSize: { xs: 26, md: 34 } }}>
          Dashboard de Controle
        </Typography>
        <Button variant="contained" startIcon={<RefreshIcon />} onClick={loadDashboardData}>
          Atualizar
        </Button>
      </Box>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <KpiCard title="Total de Maquinas" value={kpis.maquinas} icon={<ComputerIcon />} color="#2563eb" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <KpiCard title="Total de Monitores" value={kpis.monitores} icon={<MonitorIcon />} color="#22c55e" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <KpiCard title="Total de Devolucoes" value={kpis.devolucoes} icon={<ReturnIcon />} color="#f59e0b" />
        </Grid>
      </Grid>

      <Paper elevation={1} sx={{ p: { xs: 1.5, md: 3 }, mb: 3, borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Assessment color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Relatorio flexivel de maquinas
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} mb={2}>
          <Button variant="outlined" onClick={() => applyMachinePreset('hoje')}>Hoje</Button>
          <Button variant="outlined" onClick={() => applyMachinePreset('ultimos7')}>Ultimos 7 dias</Button>
          <Button variant="outlined" onClick={() => applyMachinePreset('semanaAtual')}>Semana atual</Button>
          <Button variant="outlined" onClick={() => applyMachinePreset('semanaPassada')}>Semana passada</Button>
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '160px 160px 190px 1fr 1fr auto' }, gap: 1.5, mb: 2 }}>
          <TextField
            label="Data inicial"
            type="date"
            value={machineReportFilters.inicio}
            onChange={handleMachineFilterChange('inicio')}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            label="Data final"
            type="date"
            value={machineReportFilters.fim}
            onChange={handleMachineFilterChange('fim')}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            select
            label="Tipo"
            value={machineReportFilters.tipo}
            onChange={handleMachineFilterChange('tipo')}
            size="small"
          >
            {Object.entries(reportTypeLabels).map(([value, label]) => (
              <MenuItem key={value} value={value}>{label}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Filtrar SKU/config"
            value={machineReportFilters.sku}
            onChange={handleMachineFilterChange('sku')}
            placeholder="Ex: i5 4TH, 001005"
            size="small"
          />
          <TextField
            label="Filtrar defeito"
            value={machineReportFilters.defeito}
            onChange={handleMachineFilterChange('defeito')}
            placeholder="Ex: nao liga"
            size="small"
          />
          <Button variant="contained" onClick={() => loadMachineReport()} disabled={reportLoading}>
            {reportLoading ? <CircularProgress size={20} color="inherit" /> : 'Gerar'}
          </Button>
        </Box>

        <Grid container spacing={1.5} mb={2}>
          <Grid item xs={12} sm={4}>
            <MiniMetric label="Periodo" value={`${machineReport?.periodo?.inicio || '-'} a ${machineReport?.periodo?.fim || '-'}`} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <MiniMetric label="Maquinas" value={machineReport?.totalMaquinas ?? 0} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <MiniMetric label="SKUs distintos" value={machineReport?.totalSkus ?? 0} />
          </Grid>
        </Grid>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} mb={2}>
          <Button startIcon={<DownloadIcon />} variant="contained" onClick={() => exportMachineReport('detalhado')}>Excel detalhado</Button>
          <Button startIcon={<DownloadIcon />} variant="outlined" onClick={() => exportMachineReport('soma')}>Excel soma</Button>
          <Button startIcon={<DownloadIcon />} variant="outlined" onClick={() => exportMachineReport('sku')}>Excel por SKU</Button>
          <Button startIcon={<DownloadIcon />} variant="outlined" onClick={() => exportMachineReport('sku_defeito')}>Excel SKU + defeito</Button>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {previewRows.length === 0 ? (
          <Alert severity="info">Nenhum registro encontrado para os filtros selecionados.</Alert>
        ) : (
          <Box sx={{ display: 'grid', gap: 1 }}>
            {previewRows.map((row, index) => (
              <Box
                key={`${row.id || row.codigo || index}-${index}`}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: `repeat(${Math.min(previewColumns.length, 5)}, minmax(120px, 1fr))` },
                  gap: 1,
                  p: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  backgroundColor: 'white',
                }}
              >
                {previewColumns.slice(0, 5).map((column) => (
                  <Box key={column} sx={{ minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>
                      {column}
                    </Typography>
                    <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                      {String(row[column] ?? '-')}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} lg={8}>
          <ChartCard title="Maquinas por Defeito" data={chartsData.maquinasPorDefeito} options={chartOptions} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <ChartCard title="Maquinas registradas hoje por SKU" data={chartsData.maquinasHojePorConfiguracao} options={chartOptions} />
        </Grid>
        <Grid item xs={12}>
          <ChartCard title="Maquinas por SKU" data={chartsData.maquinasPorConfiguracao} options={chartOptions} height={340} />
        </Grid>
      </Grid>

      <Paper elevation={1} sx={{ p: { xs: 1.5, md: 3 }, borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CalendarMonth color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Outros relatorios por periodo
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} mb={2}>
          <TextField
            label="Data inicial"
            type="date"
            value={periodoRelatorio.inicio}
            onChange={handlePeriodoChange('inicio')}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            label="Data final"
            type="date"
            value={periodoRelatorio.fim}
            onChange={handlePeriodoChange('fim')}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <Button variant="outlined" onClick={() => setPeriodoRelatorio(getWeekRange(-1))}>Semana passada</Button>
          <Button variant="outlined" onClick={() => setPeriodoRelatorio(getLastSevenDays())}>Ultimos 7 dias</Button>
        </Stack>

        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth variant="contained" startIcon={<DownloadIcon />} onClick={() => exportSimpleReport('devolucao')}>
              Devolucoes
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth variant="contained" startIcon={<DownloadIcon />} onClick={() => exportSimpleReport('monitores')}>
              Monitores
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth variant="outlined" startIcon={<DownloadIcon />} onClick={exportSacReport}>
              SAC
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

const KpiCard = ({ title, value, icon, color }) => (
  <Card sx={{ borderRadius: 1, borderLeft: `4px solid ${color}`, height: '100%' }}>
    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
      <Box display="flex" alignItems="center" mb={2} gap={2}>
        <Box sx={{ bgcolor: `${color}20`, p: 1, borderRadius: 1, display: 'flex' }}>
          {React.cloneElement(icon, { sx: { color, fontSize: 28 } })}
        </Box>
        <Typography variant="body2" color="text.secondary" fontWeight="600">
          {title}
        </Typography>
      </Box>
      <Typography variant="h3" fontWeight="bold" color={color} sx={{ fontSize: { xs: 34, md: 42 } }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const MiniMetric = ({ label, value }) => (
  <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, backgroundColor: '#f8fafc' }}>
    <Typography variant="caption" color="text.secondary" fontWeight={700}>{label}</Typography>
    <Typography variant="h6" sx={{ overflowWrap: 'anywhere' }}>{value}</Typography>
  </Box>
);

const ChartCard = ({ title, data, options, height = 300 }) => (
  <Paper elevation={1} sx={{ p: { xs: 1.5, md: 3 }, borderRadius: 1, height: '100%' }}>
    <Typography variant="h6" fontWeight="600" mb={2} color="#0f172a">
      {title}
    </Typography>
    <Box height={height}>
      <Bar data={data} options={options} />
    </Box>
  </Paper>
);

export default DashboardPage;
