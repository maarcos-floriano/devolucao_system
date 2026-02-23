import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';

const SearchBar = ({ value, onChange, placeholder = "Pesquisar...", sx = {} }) => {
  return (
    <TextField
      fullWidth
      variant="outlined"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          backgroundColor: 'white',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#22c55e',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#22c55e',
            borderWidth: 2,
          },
        },
        ...sx,
      }}
      size="small"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search sx={{ color: '#22c55e' }} />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchBar;