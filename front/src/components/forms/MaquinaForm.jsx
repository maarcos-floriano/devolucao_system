import React from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';

const MaquinaForm = ({ formData, onChange, configuracoes = [], loading = false }) => {
  const handleTextChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...formData, [name]: value });
  };

  const handleConfigChange = (e) => {
    const selectedId = e.target.value;
    const selecionada = configuracoes.find((cfg) => cfg.id === selectedId);

    onChange({
      ...formData,
      configId: selectedId,
      codigo: selecionada?.codigo || '',
      config: selecionada?.config || '',
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
          <InputLabel>Configuração (ENUM)</InputLabel>
          <Select
            label="Configuração (ENUM)"
            value={formData.configId || ''}
            onChange={handleConfigChange}
            disabled={loading}
          >
            <MenuItem value=""><em>Selecione...</em></MenuItem>
            {configuracoes.map((cfg) => (
              <MenuItem key={cfg.id} value={cfg.id}>
                {cfg.config}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            Se não encontrar a configuração, crie na seção de ADMIN abaixo.
          </FormHelperText>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          required
          label="Código"
          name="codigo"
          value={formData.codigo}
          onChange={handleTextChange}
          disabled={loading}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          label="Configuração"
          name="config"
          value={formData.config}
          onChange={handleTextChange}
          disabled={loading}
        />
      </Grid>
    </Grid>
  );
};

export default MaquinaForm;
