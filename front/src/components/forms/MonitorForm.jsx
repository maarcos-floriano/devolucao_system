import React from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  Box,
  CircularProgress,
} from '@mui/material';
import { MARCAS_MONITOR, RESPONSAVEIS, ORIGENS } from '../../utils/constants';

const MonitorForm = ({ 
  formData, 
  onChange, 
  origem = '', 
  onOrigemChange, 
  devolucoes = [], 
  loadingDevolucoes = false, // Novo prop para loading
  loading = false 
}) => {
  const handleChange = (field, value) => {
    onChange({
      ...formData,
      [field]: value
    });
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    handleChange(name, value);
    
    // Se for a origem, atualizar também o estado separado
    if (name === 'origem' && onOrigemChange) {
      onOrigemChange(value);
    }
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    handleChange(name, value);
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    handleChange(name, checked);
  };

  // Determinar se o campo de devolução deve estar habilitado
  const isDevolucaoEnabled = () => {
    const origensPermitidas = ['Mercado Livre', 'Shopee', 'Correios', 'Amazon', 'Magalu', 'Mineiro Express'];
    return origensPermitidas.includes(formData.origem);
  };

  return (
    <Grid container
      spacing={{ xs: 1.25, sm: 2 }}
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        gap: { xs: 1.25, sm: 2 },
      }}
    >
      {/* Marca */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required size="small">
          <InputLabel>Marca</InputLabel>
          <Select
            name="marca"
            value={formData.marca}
            onChange={handleSelectChange}
            label="Marca"
            disabled={loading}
          >
            <MenuItem value=""><em>Selecione a marca</em></MenuItem>
            {MARCAS_MONITOR.map((marca) => (
              <MenuItem key={marca} value={marca}>
                {marca}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Tamanho */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          size="small"
          label="Tamanho (polegadas)"
          name="tamanho"
          value={formData.tamanho}
          onChange={handleTextChange}
          required
          disabled={loading}
          placeholder="Ex: 21.5, 24, 27"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      {/* Origem */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required size="small">
          <InputLabel>Origem</InputLabel>
          <Select
            name="origem"
            value={formData.origem}
            onChange={handleSelectChange}
            label="Origem"
            disabled={loading}
          >
            <MenuItem value=""><em>Selecione a origem</em></MenuItem>
            {ORIGENS.map((origemItem) => (
              <MenuItem key={origemItem.value} value={origemItem.value}>
                {origemItem.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Responsável */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required size="small">
          <InputLabel>Responsável</InputLabel>
          <Select
            name="responsavel"
            value={formData.responsavel}
            onChange={handleSelectChange}
            label="Responsável"
            disabled={loading}
          >
            <MenuItem value=""><em>Selecione o responsável</em></MenuItem>
            {RESPONSAVEIS.map((resp) => (
              <MenuItem key={resp.value} value={resp.value}>
                {resp.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Devolução (opcional) - Habilitado apenas para certas origens */}
      <Grid item xs={12} sm={6}>
        <FormControl 
          fullWidth 
          size="small"
          disabled={!isDevolucaoEnabled() || loading}
        >
          <InputLabel>Vincular a Devolução (opcional)</InputLabel>
          <Select
            name="fkDevolucao"
            value={formData.fkDevolucao || ''}
            onChange={handleSelectChange}
            label="Vincular a Devolução (opcional)"
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300,
                },
              },
            }}
          >
            <MenuItem value="">
              <em>Nenhuma devolução vinculada</em>
            </MenuItem>
            
            {loadingDevolucoes ? (
              <MenuItem disabled>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  Buscando devoluções de {formData.origem}...
                </Box>
              </MenuItem>
            ) : devolucoes.length === 0 ? (
              <MenuItem disabled>
                {formData.origem && isDevolucaoEnabled()
                  ? `Nenhuma devolução encontrada para origem: ${formData.origem}`
                  : formData.origem && !isDevolucaoEnabled()
                  ? `Vínculo não disponível para ${formData.origem}`
                  : 'Selecione uma origem primeiro'
                }
              </MenuItem>
            ) : (
              devolucoes.map((devolucao) => (
                <MenuItem key={devolucao.id} value={devolucao.id}>
                  {devolucao.label}
                </MenuItem>
              ))
            )}
          </Select>
          
          {formData.origem && (
            <FormHelperText sx={{ fontSize: { xs: '0.72rem', sm: '0.75rem' } }}>
              {loadingDevolucoes 
                ? 'Buscando devoluções...' 
                : isDevolucaoEnabled() && devolucoes.length > 0
                ? `${devolucoes.length} devoluções encontradas`
                : !isDevolucaoEnabled()
                ? 'Vínculo disponível apenas para certas origens'
                : 'Nenhuma devolução disponível'
              }
            </FormHelperText>
          )}
        </FormControl>
      </Grid>

      {/* Observação */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          size="small"
          label="Observação (opcional)"
          name="observacao"
          value={formData.observacao}
          onChange={handleTextChange}
          disabled={loading}
          multiline
          rows={2}
          placeholder="Ex: Defeito na tela, não liga, arranhões, etc."
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      {/* RMA Checkbox */}
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              name="rma"
              checked={formData.rma || false}
              onChange={handleCheckboxChange}
              disabled={loading}
              color="error"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <span>RMA (Monitor com defeito)</span>
              {formData.rma && (
                <Box sx={{ 
                  ml: 1, 
                  px: 1, 
                  py: 0.5, 
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  DEFEITO
                </Box>
              )}
            </Box>
          }
        />
        {formData.rma && !formData.fkDevolucao && isDevolucaoEnabled() && devolucoes.length > 0 && (
          <FormHelperText sx={{ color: '#f59e0b', ml: 4 }}>
            ⚠️ Recomendado vincular a uma devolução para monitores RMA com origem {formData.origem}
          </FormHelperText>
        )}
      </Grid>
    </Grid>
  );
};

export default MonitorForm;