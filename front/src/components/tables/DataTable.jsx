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
  CircularProgress,
  Box,
} from '@mui/material';
import {
  Edit,
  Delete,
  Print,
  Visibility,
  Replay,
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
  onReimprimir,
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
        <Chip 
          label="Sim" 
          size="small" 
          sx={{ 
            backgroundColor: '#dcfce7',
            color: '#166534',
            fontWeight: 600,
          }} 
        />
      ) : (
        <Chip 
          label="Não" 
          variant="outlined" 
          size="small" 
          sx={{ 
            borderColor: '#d1fae5',
            color: '#6b7280',
          }} 
        />
      );
    }
    
    if (column.type === 'date') {
      return value ? new Date(value).toLocaleDateString('pt-BR') : '-';
    }
    
    if (column.type === 'datetime') {
      return value ? new Date(value).toLocaleString('pt-BR') : '-';
    }
    
    return value || '-';
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TableContainer 
        component={Paper} 
        elevation={0}
        sx={{ 
          flex: 1,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  align={column.align || 'left'}
                  sx={{ 
                    fontWeight: 700,
                    fontSize: '14px',
                    backgroundColor: '#22c55e',
                    color: 'white',
                    borderBottom: '2px solid #15803d',
                  }}
                >
                  {column.headerName}
                </TableCell>
              ))}
              {(onEdit || onDelete || onView || onPrint || onReimprimir) && (
                <TableCell 
                  align="center" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: '14px',
                    backgroundColor: '#22c55e',
                    color: 'white',
                    borderBottom: '2px solid #15803d',
                  }}
                >
                  Ações
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + ((onEdit || onDelete || onView || onPrint || onReimprimir) ? 1 : 0)} 
                  align="center"
                  sx={{ py: 4 }}
                >
                  <CircularProgress size={24} sx={{ color: '#22c55e' }} />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + ((onEdit || onDelete || onView || onPrint || onReimprimir) ? 1 : 0)} 
                  align="center"
                  sx={{ py: 4, color: '#6b7280' }}
                >
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow 
                  key={row.id || index} 
                  hover
                  sx={{ 
                    '&:nth-of-type(even)': { backgroundColor: '#f0fdf4' },
                    '&:hover': { backgroundColor: '#dcfce7' },
                  }}
                >
                  {columns.map((column) => (
                    <TableCell 
                      key={column.field} 
                      align={column.align || 'left'}
                      sx={{ 
                        fontSize: '14px',
                        borderBottom: '1px solid #d1fae5',
                      }}
                    >
                      {renderCell(row, column)}
                    </TableCell>
                  ))}
                  
                  {(onEdit || onDelete || onView || onPrint || onReimprimir) && (
                    <TableCell 
                      align="center"
                      sx={{ borderBottom: '1px solid #d1fae5' }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        {onView && (
                          <Tooltip title="Visualizar">
                            <IconButton 
                              size="small" 
                              onClick={() => onView(row)}
                              sx={{ 
                                color: '#3b82f6',
                                '&:hover': { backgroundColor: '#dbeafe' }
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onEdit && (
                          <Tooltip title="Editar">
                            <IconButton 
                              size="small" 
                              onClick={() => onEdit(row)}
                              sx={{ 
                                color: '#f59e0b',
                                '&:hover': { backgroundColor: '#fef3c7' }
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onPrint && (
                          <Tooltip title="Imprimir Etiqueta">
                            <IconButton 
                              size="small" 
                              onClick={() => onPrint(row)}
                              sx={{ 
                                color: '#22c55e',
                                '&:hover': { backgroundColor: '#dcfce7' }
                              }}
                            >
                              <Print fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onReimprimir && (
                          <Tooltip title="Reimprimir">
                            <IconButton 
                              size="small" 
                              onClick={() => onReimprimir(row)}
                              sx={{ 
                                color: '#8b5cf6',
                                '&:hover': { backgroundColor: '#ede9fe' }
                              }}
                            >
                              <Replay fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onDelete && (
                          <Tooltip title="Excluir">
                            <IconButton 
                              size="small" 
                              onClick={() => onDelete(row)}
                              sx={{ 
                                color: '#ef4444',
                                '&:hover': { backgroundColor: '#fee2e2' }
                              }}
                            >
                              <Delete fontSize="small" />
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
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '14px',
            },
          }}
        />
      )}
    </Box>
  );
};

export default DataTable;