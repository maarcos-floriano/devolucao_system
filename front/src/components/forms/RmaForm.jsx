import React from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';

const TIPOS_ITEM = ['Máquina', 'Monitor', 'Kit', 'Peça de hardware', 'Gabinete', 'Outro'];
const STATUS_LIST = ['aberto', 'em analise', 'enviado fornecedor', 'finalizado'];

const RmaForm = ({ formData, onChange, devolucoes = [], loading = false }) => {
  const handleField = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required>
          <InputLabel>Tipo do item</InputLabel>
          <Select
            label="Tipo do item"
            value={formData.tipo_item || ''}
            onChange={(e) => handleField('tipo_item', e.target.value)}
            disabled={loading}
          >
            {TIPOS_ITEM.map((tipo) => (
              <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={formData.status || 'aberto'}
            onChange={(e) => handleField('status', e.target.value)}
            disabled={loading}
          >
            {STATUS_LIST.map((status) => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Relacionar com devolução</InputLabel>
          <Select
            label="Relacionar com devolução"
            value={formData.fkDevolucao || ''}
            onChange={(e) => handleField('fkDevolucao', e.target.value || null)}
            disabled={loading}
          >
            <MenuItem value=""><em>Sem devolução vinculada</em></MenuItem>
            {devolucoes.map((devolucao) => (
              <MenuItem key={devolucao.id} value={devolucao.id}>
                #{devolucao.id} - {devolucao.cliente} ({devolucao.produto})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Descrição do item"
          value={formData.descricao_item || ''}
          onChange={(e) => handleField('descricao_item', e.target.value)}
          disabled={loading}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Destino"
          placeholder="Ex: Acionar garantia do fornecedor"
          value={formData.destino || ''}
          onChange={(e) => handleField('destino', e.target.value)}
          disabled={loading}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          required
          label="Problema identificado"
          value={formData.problema || ''}
          onChange={(e) => handleField('problema', e.target.value)}
          disabled={loading}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Responsável"
          value={formData.responsavel || ''}
          onChange={(e) => handleField('responsavel', e.target.value)}
          disabled={loading}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          label="Observação"
          value={formData.observacao || ''}
          onChange={(e) => handleField('observacao', e.target.value)}
          disabled={loading}
        />
      </Grid>
    </Grid>
  );
};

export default RmaForm;
