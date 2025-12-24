import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  TablePagination,
  Box,
} from '@mui/material';
import {
  Edit,
  Delete,
  Print,
  Visibility,
} from '@mui/icons-material';

const DataTable = ({
  columns,
  data,
  page,
  rowsPerPage,
  totalRows,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onView,
  onPrint,
  loading = false,
  ...props
}) => {
  const handleChangePage = (event, newPage) => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  const renderCell = (row, column) => {
    const value = row[column.field];
    
    if (column.render) {
      return column.render(value, row);
    }
    
    if (column.type === 'boolean') {
      return value ? (
        <Chip label="Sim" color="success" size="small" />
      ) : (
        <Chip label="Não" variant="outlined" size="small" />
      );
    }
    
    if (column.type === 'date') {
      return new Date(value).toLocaleDateString('pt-BR');
    }
    
    if (column.type === 'datetime') {
      return new Date(value).toLocaleString('pt-BR');
    }
    
    return value || '-';
  };

  return (
    <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  align={column.align || 'left'}
                  sx={{ fontWeight: 'bold', bgcolor: 'primary.light', color: 'white' }}
                >
                  {column.headerName}
                </TableCell>
              ))}
              {(onEdit || onDelete || onView || onPrint) && (
                <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'primary.light', color: 'white' }}>
                  Ações
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={row.id || index} hover>
                  {columns.map((column) => (
                    <TableCell key={column.field} align={column.align || 'left'}>
                      {renderCell(row, column)}
                    </TableCell>
                  ))}
                  
                  {(onEdit || onDelete || onView || onPrint) && (
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        {onView && (
                          <Tooltip title="Visualizar">
                            <IconButton size="small" onClick={() => onView(row)}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onEdit && (
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => onEdit(row)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onPrint && (
                          <Tooltip title="Imprimir">
                            <IconButton size="small" onClick={() => onPrint(row)}>
                              <Print fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onDelete && (
                          <Tooltip title="Excluir">
                            <IconButton size="small" onClick={() => onDelete(row)}>
                              <Delete fontSize="small" color="error" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {totalRows > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalRows}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count}`
          }
        />
      )}
    </Paper>
  );
};

export default DataTable;