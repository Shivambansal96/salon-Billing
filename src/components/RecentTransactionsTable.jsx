import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from '@mui/material';
import { useMemo, useState } from 'react';

export function RecentTransactionsTable({ transactions }) {
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('date');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Parse and sort transactions - handles JSON strings
  const parsedTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    return transactions.map((tx) => {
      if (typeof tx === 'string') {
        try {
          return JSON.parse(tx);
        } catch {
          return tx;
        }
      }
      return tx;
    });
  }, [transactions]);

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    const sorted = [...parsedTransactions].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      // Handle date sorting
      if (orderBy === 'date') {
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
      }
      // Handle amount sorting
      else if (orderBy === 'amount') {
        aValue = a.total || a.totals?.total || a.amount || 0;
        bValue = b.total || b.totals?.total || b.amount || 0;
        aValue = Number(aValue);
        bValue = Number(bValue);
      }
      // Handle string sorting
      else if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (order === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });

    return sorted;
  }, [parsedTransactions, order, orderBy]);

  // Paginate
  const paginatedTransactions = useMemo(() => {
    return sortedTransactions.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [sortedTransactions, page, rowsPerPage]);

  const SortableTableHead = ({ label, property }) => (
    <TableCell
      sx={{
        color: 'white',
        fontWeight: 600,
        cursor: 'pointer',
        userSelect: 'none',
      }}
      sortDirection={orderBy === property ? order : false}
    >
      <TableSortLabel
        active={orderBy === property}
        direction={orderBy === property ? order : 'asc'}
        onClick={(e) => handleRequestSort(e, property)}
        sx={{
          color: 'white !important',
          '& .MuiTableSortLabel-icon': {
            color: 'white !important',
          },
          '&:hover': {
            color: '#fff !important',
          },
        }}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: '0.75rem',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.1)',
        border: '1px solid #e5e7eb',
      }}
    >
      <Table sx={{ minWidth: 850 }}>
        <TableHead>
          <TableRow
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <SortableTableHead label="Date" property="date" />
            <SortableTableHead label="Customer Name" property="customerName" />
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>
              Services Done
            </TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>
              Service Provider
            </TableCell>
            <SortableTableHead label="Total Amount" property="amount" />
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedTransactions.map((transaction, idx) => {
            const services = Array.isArray(transaction.services) ? transaction.services : [];
            const staffNames = services
              ?.map((s) => s.staffName)
              .filter(Boolean)
              .join(', ') || 'N/A';

            const serviceNames = services
              ?.map((s) => s.serviceName)
              .join(', ') || 'N/A';

            const totalAmount = transaction.total || transaction.totals?.total || transaction.amount || 0;

            return (
              <TableRow
                key={idx}
                sx={{
                  '&:hover': {
                    backgroundColor: '#f9fafb',
                  },
                  borderLeft: '4px solid #667eea',
                }}
              >
                <TableCell sx={{ color: '#6b7280', fontWeight: 500 }}>
                  {transaction.date ? new Date(transaction.date).toLocaleDateString('en-IN') : 'N/A'}
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1f2937' }}>
                  {transaction.customerName || 'Walk-in'}
                </TableCell>
                <TableCell sx={{ color: '#374151' }}>
                  <Box
                    sx={{
                      maxWidth: '300px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={serviceNames}
                  >
                    {serviceNames}
                  </Box>
                </TableCell>
                <TableCell sx={{ color: '#6b7280' }}>
                  <Box
                    sx={{
                      maxWidth: '150px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={staffNames}
                  >
                    {staffNames}
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#667eea' }}>
                  ₹{Number(totalAmount).toFixed(2)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={sortedTransactions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          backgroundColor: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows':
            {
              margin: '0',
              color: '#6b7280',
            },
          '& .MuiIconButton-root': {
            color: '#667eea',
          },
          '& .MuiIconButton-root:disabled': {
            color: '#d1d5db',
          },
        }}
      />
    </TableContainer>
  );
}

export default RecentTransactionsTable;
