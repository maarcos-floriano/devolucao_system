import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';

const SelectField = ({
  label,
  value,
  onChange,
  options = [],
  grouped = false,
  required = false,
  error = false,
  helperText = '',
  disabled = false,
  fullWidth = true,
  size = 'medium',
  ...props
}) => {
  const renderOptions = () => {
    if (grouped && Array.isArray(options)) {
      return options.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </optgroup>
      ));
    }

    return options.map((option) => (
      <MenuItem key={option.value} value={option.value}>
        {option.label || option}
      </MenuItem>
    ));
  };

  return (
    <FormControl
      fullWidth={fullWidth}
      error={error}
      disabled={disabled}
      size={size}
      required={required}
    >
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        onChange={onChange}
        label={label}
        {...props}
      >
        <MenuItem value="">
          <em>Selecione...</em>
        </MenuItem>
        {renderOptions()}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default SelectField;