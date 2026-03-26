import React from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import { RESPONSAVEIS, ORIGENS } from '../../utils/constants';

const KitForm = ({ formData, onChange, loading = false, skus = [] }) => {
  const handleChange = (field, value) => onChange({ ...formData, [field]: value });

  const handleSkuChange = (value) => {
    const skuSelecionado = skus.find((item) => String(item.id) === String(value));
    onChange({
      ...formData,
      skuId: value,
      sku: skuSelecionado?.sku || '',
      codigo: skuSelecionado?.codigo || '',
    });
  };

  return (
    <Grid container spacing={2} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
      <Grid item xs={12}>
        <Alert severity="info">Cadastro de KIT por SKU + quantidade.</Alert>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required>
          <InputLabel>SKU do Kit</InputLabel>
          <Select value={formData.skuId || ''} label="SKU do Kit" onChange={(e) => handleSkuChange(e.target.value)} disabled={loading}>
            <MenuItem value=""><em>Selecione...</em></MenuItem>
            {skus.map((item) => (
              <MenuItem key={item.id} value={item.id}>{item.sku} | {item.codigo}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField fullWidth label="Quantidade" type="number" inputProps={{ min: 1 }} value={formData.quantidade || 1} onChange={(e) => handleChange('quantidade', Number(e.target.value || 1))} />
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required>
          <InputLabel>Responsável</InputLabel>
          <Select value={formData.responsavel} label="Responsável" onChange={(e) => handleChange('responsavel', e.target.value)} disabled={loading}>
            <MenuItem value=""><em>Selecione...</em></MenuItem>
            {RESPONSAVEIS.map((resp) => <MenuItem key={resp.value} value={resp.value}>{resp.label}</MenuItem>)}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required>
          <InputLabel>Origem</InputLabel>
          <Select value={formData.origem} label="Origem" onChange={(e) => handleChange('origem', e.target.value)} disabled={loading}>
            <MenuItem value=""><em>Selecione...</em></MenuItem>
            {ORIGENS.map((origem) => <MenuItem key={origem.value} value={origem.value}>{origem.label}</MenuItem>)}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <TextField fullWidth label="Defeito" value={formData.defeito} onChange={(e) => handleChange('defeito', e.target.value)} disabled={loading} />
      </Grid>
    </Grid>
  );
};

export default KitForm;
