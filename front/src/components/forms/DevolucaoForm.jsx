import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  Typography,
} from '@mui/material';
import { UploadFile } from '@mui/icons-material';
import { ORIGENS_DEVOLUCAO } from '../../utils/constants';

const DevolucaoForm = ({ formData, onChange, loading = false }) => {
  const [localDateTime, setLocalDateTime] = useState('');

  const handleChange = useCallback((field, value) => {
    onChange(prev => ({
      ...prev,
      [field]: value
    }));
  }, [onChange]);

  // Preencher data/hora inicial sem sobrescrever edição existente
  useEffect(() => {
    if (formData.dataHora) {
      const dataNormalizada = formData.dataHora.replace(' ', 'T').slice(0, 16);
      setLocalDateTime(dataNormalizada);
      return;
    }

    const agora = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    
    const ano = agora.getFullYear();
    const mes = pad(agora.getMonth() + 1);
    const dia = pad(agora.getDate());
    const hora = pad(agora.getHours());
    const minuto = pad(agora.getMinutes());
    
    const dateTimeValue = `${ano}-${mes}-${dia}T${hora}:${minuto}`;
    setLocalDateTime(dateTimeValue);
    const dataHoraIso = new Date(dateTimeValue).toISOString();
    const dataHoraBr = dataHoraIso.split('T').join(' ').split('.')[0];
    handleChange('dataHora', dataHoraBr);
  }, [formData.dataHora, handleChange]);

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    handleChange(name, value);
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    handleChange(name, value);
  };

  const handleDateTimeChange = (e) => {
    const value = e.target.value;
    setLocalDateTime(value);
    // Converter para formato do backend
    const dataHora = new Date(value).toISOString();
    const dataHoraBr = dataHora.split('T').join(' ').split('.')[0];
    handleChange('dataHora', dataHoraBr);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    handleChange('imagemArquivo', file);
  };

  return (
    <Grid container
      spacing={2}
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        gap: 2,
      }}
    >
      {/* Origem */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required>
          <InputLabel>Origem</InputLabel>
          <Select
            name="origem"
            value={formData.origem}
            onChange={handleSelectChange}
            label="Origem"
            disabled={loading}
          >
            <MenuItem value=""><em>Selecione a origem</em></MenuItem>
            {ORIGENS_DEVOLUCAO.map((origem) => (
              <MenuItem key={origem} value={origem}>
                {origem}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Cliente */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Cliente"
          name="cliente"
          value={formData.cliente}
          onChange={handleTextChange}
          required
          disabled={loading}
        />
      </Grid>

      {/* Produto */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Produto"
          name="produto"
          value={formData.produto}
          onChange={handleTextChange}
          required
          disabled={loading}
        />
      </Grid>

      {/* Código de Rastreamento */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Código de Rastreamento"
          name="codigo"
          value={formData.codigo}
          onChange={handleTextChange}
          required
          disabled={loading}
        />
      </Grid>

      {/* Data e Hora */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Data e Hora da Devolução"
          type="datetime-local"
          value={localDateTime}
          onChange={handleDateTimeChange}
          disabled={loading}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      {/* Observação */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Observação (opcional)"
          name="observacao"
          value={formData.observacao}
          onChange={handleTextChange}
          disabled={loading}
        />
      </Grid>

      {/* Imagem */}
      <Grid item xs={12} sm={6}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadFile />}
            disabled={loading}
          >
            {formData.imagemArquivo ? 'Trocar imagem anexada' : 'Anexar imagem'}
            <input hidden type="file" accept="image/*" onChange={handleImageChange} />
          </Button>
          <Typography variant="caption" color="text.secondary">
            Formatos aceitos: JPG, PNG, WEBP (máx. 5MB).
          </Typography>
          {formData.imagemArquivo && (
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Arquivo: {formData.imagemArquivo.name}
            </Typography>
          )}
          {!formData.imagemArquivo && formData.imagem && (
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Imagem já cadastrada para esta devolução.
            </Typography>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default DevolucaoForm;
