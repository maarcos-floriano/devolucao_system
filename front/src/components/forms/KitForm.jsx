import React from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  RESPONSAVEIS,
  ORIGENS,
  PROCESSADORES,
  MEMORIAS,
  PLACAS_MAE,
} from '../../utils/constants';

const KitForm = ({ formData, onChange, loading = false, origem, onOrigemChange }) => {
  const handleChange = (field, value) => {
    onChange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'origem') {
      onOrigemChange(value);
    }
    
    handleChange(name, value);
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    handleChange(name, value);
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
      {/* Responsável e Lacre */}
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

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth size="small">
          <InputLabel>Situação do Lacre</InputLabel>
          <Select
            name="lacre"
            value={formData.lacre}
            onChange={handleSelectChange}
            label="Situação do Lacre"
            disabled={loading}
          >
            <MenuItem value=""><em>Selecione...</em></MenuItem>
            <MenuItem value="ok">Ok</MenuItem>
            <MenuItem value="violado">Violado</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Processador e Memória */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required size="small">
          <InputLabel>Processador</InputLabel>
          <Select
            name="processador"
            value={formData.processador}
            onChange={handleSelectChange}
            label="Processador"
            disabled={loading}
          >
            <MenuItem value=""><em>Selecione...</em></MenuItem>
            {/* i5 */}
            <MenuItem disabled>Intel Core i5</MenuItem>
            {PROCESSADORES.i5.slice(0, 10).map((proc) => (
              <MenuItem key={proc} value={proc}>{proc}</MenuItem>
            ))}
            
            {/* i7 */}
            <MenuItem disabled>Intel Core i7</MenuItem>
            {PROCESSADORES.i7.slice(0, 10).map((proc) => (
              <MenuItem key={proc} value={proc}>{proc}</MenuItem>
            ))}
            
            {/* Ryzen */}
            <MenuItem disabled>AMD Ryzen</MenuItem>
            {PROCESSADORES.ryzen.map((proc) => (
              <MenuItem key={proc} value={proc}>{proc}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required size="small">
          <InputLabel>Memória RAM</InputLabel>
          <Select
            name="memoria"
            value={formData.memoria}
            onChange={handleSelectChange}
            label="Memória RAM"
            disabled={loading}
          >
            <MenuItem value=""><em>Selecione...</em></MenuItem>
            {/* DDR3 */}
            <MenuItem disabled>DDR3</MenuItem>
            {MEMORIAS.ddr3.map((mem) => (
              <MenuItem key={mem} value={mem}>{mem}</MenuItem>
            ))}
            
            {/* DDR4 */}
            <MenuItem disabled>DDR4</MenuItem>
            {MEMORIAS.ddr4.map((mem) => (
              <MenuItem key={mem} value={mem}>{mem}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Placa Mãe */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required size="small">
          <InputLabel>Placa Mãe</InputLabel>
          <Select
            name="placaMae"
            value={formData.placaMae}
            onChange={handleSelectChange}
            label="Placa Mãe"
            disabled={loading}
          >
            <MenuItem value=""><em>Selecione...</em></MenuItem>
            {PLACAS_MAE.map((placa) => (
              <MenuItem key={placa} value={placa}>{placa}</MenuItem>
            ))}
          </Select>
        </FormControl>
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
            <MenuItem value=""><em>Selecione...</em></MenuItem>
            {ORIGENS.map((origem) => (
              <MenuItem key={origem.value} value={origem.value}>
                {origem.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Devolução */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth size="small" disabled={origem === 'Outro' || !origem}>
          <InputLabel>Devolução</InputLabel>
          <Select
            name="fkDevolucao"
            value={formData.fkDevolucao || ''}
            onChange={handleSelectChange}
            label="Devolução"
          >
            <MenuItem value=""><em>Selecione a devolução</em></MenuItem>
          </Select>
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
        />
      </Grid>

      {/* Defeito */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          size="small"
          label="Defeito"
          name="defeito"
          value={formData.defeito}
          onChange={handleTextChange}
          disabled={loading}
        />
      </Grid>
    </Grid>
  );
};

export default KitForm;