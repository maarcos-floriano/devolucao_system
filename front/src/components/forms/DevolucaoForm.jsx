import React, { useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { DocumentScanner, UploadFile } from '@mui/icons-material';
import { ORIGENS_DEVOLUCAO } from '../../utils/constants';

const DevolucaoForm = ({
  formData,
  onChange,
  loading = false,
  onAnalyzeImage,
  analyzingLabel = false,
  ocrResult = null,
}) => {
  const handleChange = useCallback((field, value) => {
    onChange((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, [onChange]);

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    handleChange(name, value);
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    handleChange(name, value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    handleChange('imagemArquivo', file);
  };

  return (
    <Grid
      container
      spacing={2}
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        gap: 2,
      }}
    >
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

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Codigo de Rastreamento"
          name="codigo"
          value={formData.codigo}
          onChange={handleTextChange}
          disabled={loading}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Observacao (opcional)"
          name="observacao"
          value={formData.observacao}
          onChange={handleTextChange}
          disabled={loading}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button variant="outlined" component="label" startIcon={<UploadFile />} disabled={loading}>
            {formData.imagemArquivo ? 'Trocar imagem anexada' : 'Anexar imagem'}
            <input hidden type="file" accept="image/*" capture="environment" onChange={handleImageChange} />
          </Button>

          <Button
            variant="contained"
            color="secondary"
            startIcon={analyzingLabel ? <CircularProgress size={16} color="inherit" /> : <DocumentScanner />}
            disabled={loading || analyzingLabel || !formData.imagemArquivo || !onAnalyzeImage}
            onClick={onAnalyzeImage}
          >
            {analyzingLabel ? 'Lendo etiqueta...' : 'Ler etiqueta'}
          </Button>

          <Typography variant="caption" color="text.secondary">
            Formatos aceitos: JPG, PNG, WEBP (max. 12MB).
          </Typography>

          {formData.imagemArquivo && (
            <Typography variant="body2" sx={{ fontWeight: 500, overflowWrap: 'anywhere' }}>
              Arquivo: {formData.imagemArquivo.name}
            </Typography>
          )}

          {!formData.imagemArquivo && formData.imagem && (
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Imagem ja cadastrada para esta devolucao.
            </Typography>
          )}

          {ocrResult?.warnings?.length > 0 && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              {ocrResult.warnings[0]}
            </Alert>
          )}

          {ocrResult?.confidence > 0 && (
            <Typography variant="caption" color="text.secondary">
              Confianca da leitura: {ocrResult.confidence}%
            </Typography>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default DevolucaoForm;
