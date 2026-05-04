import React, { useMemo } from 'react';
import {
  Autocomplete,
  FormHelperText,
  Grid,
  TextField,
} from '@mui/material';

const MaquinaForm = ({
  formData,
  onChange,
  configuracoes = [],
  loading = false,
  isAdmin = false,
}) => {
  const selectedConfig = useMemo(() => {
    const found = configuracoes.find((cfg) => String(cfg.id) === String(formData.configId));
    if (found) return found;

    if (formData.codigo || formData.config) {
      return {
        id: formData.configId || 'selected',
        codigo: formData.codigo,
        config: formData.config,
      };
    }

    return null;
  }, [configuracoes, formData.codigo, formData.config, formData.configId]);

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...formData, [name]: value });
  };

  const handleConfigChange = (event, selecionada) => {
    onChange({
      ...formData,
      configId: selecionada?.id || '',
      codigo: selecionada?.codigo || '',
      config: selecionada?.config || '',
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Autocomplete
          options={configuracoes}
          value={selectedConfig}
          onChange={handleConfigChange}
          disabled={loading}
          isOptionEqualToValue={(option, value) => (
            String(option.id) === String(value.id)
            || (option.codigo === value.codigo && option.config === value.config)
          )}
          getOptionLabel={(option) => {
            if (!option) return '';
            return `${option.codigo || ''} - ${option.config || ''}`.trim();
          }}
          noOptionsText="Nenhum SKU encontrado"
          renderInput={(params) => (
            <TextField
              {...params}
              label="SKU de configuracao"
              required
              helperText="A lista completa fica carregada para facilitar a busca pelo tecnico."
            />
          )}
        />
        <FormHelperText>
          Somente ADM cria ou altera SKUs de configuracao.
        </FormHelperText>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          required
          label="Codigo"
          name="codigo"
          value={formData.codigo}
          onChange={handleTextChange}
          disabled={loading || !isAdmin}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          required
          label="Configuracao"
          name="config"
          value={formData.config}
          onChange={handleTextChange}
          disabled={loading || !isAdmin}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          label="Defeito identificado"
          name="defeito"
          value={formData.defeito || ''}
          onChange={handleTextChange}
          disabled={loading}
          multiline
          minRows={2}
        />
      </Grid>
    </Grid>
  );
};

export default MaquinaForm;
