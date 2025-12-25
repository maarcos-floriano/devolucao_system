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
} from '@mui/material';
import { MARCAS_MONITOR, RESPONSAVEIS } from '../../utils/constants';

const MonitorForm = ({ formData, onChange, loading = false }) => {
  const handleChange = (field, value) => {
    onChange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    handleChange(name, value);
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    handleChange(name, value);
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    handleChange(name, checked);
  };

  return (
    <Grid container spacing={2}>
      {/* Marca */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required>
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
          label="Tamanho (ex: 21.5)"
          name="tamanho"
          value={formData.tamanho}
          onChange={handleTextChange}
          required
          disabled={loading}
        />
      </Grid>

      {/* Quantidade */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Quantidade"
          name="quantidade"
          type="number"
          value={formData.quantidade}
          onChange={handleTextChange}
          required
          disabled={loading}
          inputProps={{ min: 1 }}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      {/* Responsável */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required>
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

      {/* RMA Checkbox */}
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              name="rma"
              checked={formData.rma || false}
              onChange={handleCheckboxChange}
              disabled={loading}
            />
          }
          label="RMA (defeito)"
        />
      </Grid>
    </Grid>
  );
};

export default MonitorForm;