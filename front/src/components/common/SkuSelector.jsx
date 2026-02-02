import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import { buscarSKUsPorTermo, listarTodosSKUs } from '../../utils/constants';

const SkuSelector = ({ value, onChange, disabled = false, label = "Buscar SKU" }) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Carregar opções iniciais
  useEffect(() => {
    const initialOptions = listarTodosSKUs();
    setOptions(initialOptions);
  }, []);

  // Buscar quando o usuário digita
  useEffect(() => {
    if (inputValue.trim() === '') {
      const allOptions = listarTodosSKUs();
      setOptions(allOptions);
      return;
    }

    setLoading(true);
    
    // Simula delay de busca
    const timer = setTimeout(() => {
      const resultados = buscarSKUsPorTermo(inputValue);
      setOptions(resultados);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleChange = (event, newValue) => {
    onChange(newValue);
  };

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
  };

  return (
    <Autocomplete
      value={value}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={options}
      loading={loading}
      disabled={disabled}
      getOptionLabel={(option) => option?.cod || ''}
      renderOption={(props, option) => (
        <li {...props}>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1" fontWeight="bold">
                {option.cod}
              </Typography>
              <Chip 
                label={option.cpu} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
            
            <Box sx={{ mt: 0.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={option.ram} 
                size="small" 
                variant="outlined"
              />
              <Chip 
                label={option.storage} 
                size="small" 
                variant="outlined"
              />
              <Chip 
                label={option.fonte} 
                size="small" 
                variant="outlined"
              />
              {option.GPU && option.GPU !== 'N/A' && (
                <Chip 
                  label={option.GPU} 
                  size="small" 
                  color="secondary" 
                  variant="outlined"
                />
              )}
            </Box>
            
            {option.gabinete && option.gabinete !== 'N/A' && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Gabinete: {option.gabinete}
              </Typography>
            )}
          </Box>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <Box component="span">Buscando...</Box>
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      PaperComponent={(props) => (
        <Paper {...props}>
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {options.length} SKUs encontrados
            </Typography>
          </Box>
          <Divider />
          {props.children}
        </Paper>
      )}
      noOptionsText="Nenhum SKU encontrado"
      isOptionEqualToValue={(option, value) => option.cod === value?.cod}
    />
  );
};

export default SkuSelector;