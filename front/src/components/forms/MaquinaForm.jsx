import React from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Box,
} from '@mui/material';
import {
  RESPONSAVEIS,
  ORIGENS,
  PROCESSADORES,
  MEMORIAS,
  ARMAZENAMENTOS,
  FONTES,
} from '../../utils/constants';

const MaquinaForm = ({ formData, onChange, devolucoes = [], loadingDevolucoes = false, loading = false }) => {

  const handleChange = (field, value) => {
    onChange({
      ...formData,
      [field]: value
    });
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    handleChange(name, value);
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    handleChange(name, value);
  };

  // Determinar se o campo de devolução deve estar habilitado
  const isDevolucaoEnabled = () => {
    const origensPermitidas = ['Mercado Livre', 'Shopee', 'Correios', 'Mineiro Express'];
    return origensPermitidas.includes(formData.origem);
  };

  return (
    <Grid
      container
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

      {/* Armazenamento e Fonte */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth size="small">
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
        <FormControl fullWidth size="small">
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

      {/* Devolução - Agora habilitado baseado na origem */}
      <Grid item xs={12} sm={6}>
        <FormControl 
          fullWidth 
          disabled={!isDevolucaoEnabled() || loading}
        >
          <InputLabel>Vincular a Devolução</InputLabel>
          <Select
            name="fkDevolucao"
            value={formData.fkDevolucao || ''}
            onChange={handleSelectChange}
            label="Vincular a Devolução"
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300,
                },
              },
            }}
          >
            <MenuItem value="">
              <em>Selecione uma devolução</em>
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
          
          {!isDevolucaoEnabled() && formData.origem && (
            <FormHelperText sx={{ fontSize: { xs: '0.72rem', sm: '0.75rem' } }}>
              Opção disponível apenas para Mercado Livre, Shopee, Amazon e Magalu
            </FormHelperText>
          )}
          
          {isDevolucaoEnabled() && devolucoes.length > 0 && (
            <FormHelperText sx={{ fontSize: { xs: '0.72rem', sm: '0.75rem' } }}>
              {devolucoes.length} devoluções encontradas
            </FormHelperText>
          )}
        </FormControl>
      </Grid>

      {/* Placa de Vídeo (opcional) */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          size="small"
          label="Placa de Vídeo (opcional)"
          name="placaVideo"
          value={formData.placaVideo}
          onChange={handleTextChange}
          disabled={loading}
        />
      </Grid>

      {/* Gabinete (opcional) */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          size="small"
          label="Gabinete (opcional)"
          name="gabinete"
          value={formData.gabinete}
          onChange={handleTextChange}
          disabled={loading}
        />
      </Grid>

      {/* Observação */}
      <Grid item xs={12}>
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
        />
      </Grid>

      {/* Defeito */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Defeito"
          size="small"
          name="defeito"
          value={formData.defeito}
          onChange={handleTextChange}
          disabled={loading}
          multiline
          rows={2}
        />
      </Grid>
    </Grid>
  );
};

export default MaquinaForm;