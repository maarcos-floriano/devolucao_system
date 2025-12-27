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
  ARMAZENAMENTOS,
  FONTES,
} from '../../utils/constants';

const MaquinaForm = ({ formData, onChange, loading = false }) => {
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

  return (
    <Grid container spacing={2}>
      {/* Responsável e Lacre */}
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
            {RESPONSAVEIS.map((resp) => (
              <MenuItem key={resp.value} value={resp.value}>
                {resp.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
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
        <FormControl fullWidth required>
          <InputLabel>Processador</InputLabel>
          <Select
            name="processador"
            value={formData.processador}
            onChange={handleSelectChange}
            label="Processador"
            disabled={loading}
          >
            {/* i5 */}
            <MenuItem disabled>Intel Core i5</MenuItem>
            {PROCESSADORES.i5.map((proc) => (
              <MenuItem key={proc} value={proc}>{proc}</MenuItem>
            ))}
            
            {/* i7 */}
            <MenuItem disabled>Intel Core i7</MenuItem>
            {PROCESSADORES.i7.map((proc) => (
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
        <FormControl fullWidth required>
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

      {/* Armazenamento e Fonte */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Armazenamento</InputLabel>
          <Select
            name="armazenamento"
            value={formData.armazenamento}
            onChange={handleSelectChange}
            label="Armazenamento"
            disabled={loading}
          >
            <MenuItem value=""><em>Selecione...</em></MenuItem>
            {/* SSD SATA */}
            <MenuItem disabled>SSD SATA</MenuItem>
            {ARMAZENAMENTOS.ssd.map((arm) => (
              <MenuItem key={arm} value={arm}>{arm}</MenuItem>
            ))}
            
            {/* SSD NVMe */}
            <MenuItem disabled>SSD NVMe (M.2)</MenuItem>
            {ARMAZENAMENTOS.nvme.map((arm) => (
              <MenuItem key={arm} value={arm}>{arm}</MenuItem>
            ))}
            
            {/* HD */}
            <MenuItem disabled>HD (Disco Rígido)</MenuItem>
            {ARMAZENAMENTOS.hd.map((arm) => (
              <MenuItem key={arm} value={arm}>{arm}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Fonte</InputLabel>
          <Select
            name="fonte"
            value={formData.fonte}
            onChange={handleSelectChange}
            label="Fonte"
            disabled={loading}
          >
            <MenuItem value=""><em>Selecione...</em></MenuItem>
            {/* Até 350W */}
            <MenuItem disabled>Até 350W</MenuItem>
            {FONTES.baixa.map((fonte) => (
              <MenuItem key={fonte} value={fonte}>{fonte}</MenuItem>
            ))}
            
            {/* 400W a 600W */}
            <MenuItem disabled>400W a 600W</MenuItem>
            {FONTES.media.map((fonte) => (
              <MenuItem key={fonte} value={fonte}>{fonte}</MenuItem>
            ))}
            
            {/* Acima de 600W */}
            <MenuItem disabled>Acima de 600W</MenuItem>
            {FONTES.alta.map((fonte) => (
              <MenuItem key={fonte} value={fonte}>{fonte}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

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
            <MenuItem value=""><em>Selecione...</em></MenuItem>
            {ORIGENS.map((origem) => (
              <MenuItem key={origem.value} value={origem.value}>
                {origem.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Devolução (desabilitado por enquanto) */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth disabled>
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
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Observação (opcional)"
          name="observacao"
          value={formData.observacao}
          onChange={handleTextChange}
          disabled={loading}
          multiline
          rows={2}
        />
      </Grid>

      {/* Defeito */}
      <Grid item xs={12}>
        <TextField
          fullWidth
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

export default MaquinaForm;