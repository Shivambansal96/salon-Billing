import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Receipt, Send } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { sendBillViaWhatsApp } from '../utils/whatsappUtils';

export function CustomersTable({ customers, onViewDetail }) {
  const [expandedCustomers, setExpandedCustomers] = useState({});
  const [billDialog, setBillDialog] = useState({ open: false, bill: null });
  const [transactionsMap, setTransactionsMap] = useState({});

  // Filter States
  const [filterName, setFilterName] = useState('');
  const [filterPhone, setFilterPhone] = useState('');
  const [filterMembership, setFilterMembership] = useState('');
  const [filterProvider, setFilterProvider] = useState('');

  // Load and parse all transactions from storage
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        if (window.storage) {
          const result = await window.storage.list('tx_', false);
          const txMap = {};
          for (const key of result.keys) {
            try {
              const txData = await window.storage.get(key, false);
              if (txData.value) {
                if (typeof txData.value === 'string') {
                  txMap[key] = JSON.parse(txData.value);
                } else {
                  txMap[key] = txData.value;
                }
              }
            } catch (e) {
              console.warn(`Error loading transaction ${key}:`, e);
            }
          }
          setTransactionsMap(txMap);
        }
      } catch (error) {
        console.error('Error loading transactions:', error);
      }
    };
    loadTransactions();
  }, []);

  // Group and resolve transactions
  const uniqueCustomers = useMemo(() => {
    const customerMap = {};
    if (!customers || !Array.isArray(customers)) return [];

    customers.forEach((customer) => {
      if (!customer || !customer.name) return;
      if (!customerMap[customer.name]) {
        customerMap[customer.name] = {
          ...customer,
          allVisits: [],
        };
      }
      if (customer.visits && Array.isArray(customer.visits)) {
        customer.visits.forEach((visitId) => {
          let transaction = null;
          if (typeof visitId === 'string') {
            transaction = transactionsMap[visitId];
          } else if (typeof visitId === 'object') {
            transaction = visitId;
          }
          if (transaction) {
            customerMap[customer.name].allVisits.push(transaction);
          }
        });
      }
    });
    return Object.values(customerMap);
  }, [customers, transactionsMap]);

  // Get all unique providers for filter dropdown
  const allProviders = useMemo(() => {
    const providers = new Set();
    uniqueCustomers.forEach((customer) => {
      customer.allVisits.forEach((visit) => {
        const services = Array.isArray(visit?.services) ? visit.services : [];
        services.forEach((service) => {
          if (service.staffName) providers.add(service.staffName);
        });
      });
    });
    return Array.from(providers).sort();
  }, [uniqueCustomers]);

  // Apply Filters
  const filteredCustomers = useMemo(() => {
    return uniqueCustomers.filter((customer) => {
      const nameMatch = customer.name
        .toLowerCase()
        .includes(filterName.toLowerCase());
      const phoneMatch =
        !filterPhone ||
        customer.phone?.toString().includes(filterPhone);
      const membershipMatch =
        !filterMembership ||
        customer.membershipOwned?.membershipName === filterMembership;

      const providerMatch =
        !filterProvider ||
        customer.allVisits.some((visit) => {
          const services = Array.isArray(visit?.services) ? visit.services : [];
          return services.some((s) => s.staffName === filterProvider);
        });

      return nameMatch && phoneMatch && membershipMatch && providerMatch;
    });
  }, [
    uniqueCustomers,
    filterName,
    filterPhone,
    filterMembership,
    filterProvider,
  ]);

  const toggleExpand = (customerName) => {
    setExpandedCustomers((prev) => ({
      ...prev,
      [customerName]: !prev[customerName],
    }));
  };

  const handleViewBill = (visit) => {
    setBillDialog({ open: true, bill: visit });
  };

  const closeBillDialog = () => {
    setBillDialog({ open: false, bill: null });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString('en-IN');
    } catch {
      return 'N/A';
    }
  };

  const getVisitServices = (visit) =>
    Array.isArray(visit?.services)
      ? visit.services
      : Array.isArray(visit?.items)
      ? visit.items
      : [];

  const getVisitTotal = (visit) => {
    if (!visit) return 0;
    if (visit.total !== undefined && visit.total !== null)
      return Number(visit.total);
    if (visit.totals?.total !== undefined)
      return Number(visit.totals.total);
    if (visit.amount !== undefined) return Number(visit.amount);
    return 0;
  };

  const getServiceProviders = (services) => {
    if (!Array.isArray(services)) return 'N/A';
    const providers = services
      .map((s) => s.staffName || s.provider || s.staff)
      .filter(Boolean);
    return providers.length ? [...new Set(providers)].join(', ') : 'N/A';
  };

  if (!uniqueCustomers || uniqueCustomers.length === 0) {
    return (
      <Box sx={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
        <Typography>No customers found</Typography>
      </Box>
    );
  }

  return (
    <>
      {/* Filter Section */}
      <Box
        sx={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: '1.5rem',
          border: '1px solid #e5e7eb',
        }}
      >
        <Typography sx={{ fontWeight: 600, marginBottom: '1rem', color: '#1f2937' }}>
          🔍 Filters
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
            gap: '1rem',
          }}
        >
          <TextField
            label="Customer Name"
            placeholder="Search name..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            size="small"
            fullWidth
          />
          <TextField
            label="Phone"
            placeholder="Search phone..."
            value={filterPhone}
            onChange={(e) => setFilterPhone(e.target.value)}
            size="small"
            fullWidth
          />
          <FormControl size="small" fullWidth>
            <InputLabel>Membership</InputLabel>
            <Select
              value={filterMembership}
              onChange={(e) => setFilterMembership(e.target.value)}
              label="Membership"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Green Card">Green Card</MenuItem>
              <MenuItem value="Service Card">Service Card</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Service Provider</InputLabel>
            <Select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              label="Service Provider"
            >
              <MenuItem value="">All</MenuItem>
              {allProviders.map((provider) => (
                <MenuItem key={provider} value={provider}>
                  {provider}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Typography sx={{ marginTop: '1rem', fontSize: '0.85rem', color: '#6b7280' }}>
          Showing {filteredCustomers.length} of {uniqueCustomers.length} customers
        </Typography>
      </Box>

      {/* Customers Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: '0.75rem',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.1)',
          border: '1px solid #e5e7eb',
          overflowX: 'auto',
        }}
      >
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              <TableCell sx={{ color: 'white', fontWeight: 600, width: 50 }} />
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                Customer Name
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                Phone
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                Membership
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                Total Visits
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                Total Spent
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                Last Visit
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <React.Fragment key={customer.name}>
                {/* Main Row */}
                <TableRow sx={{ '&:hover': { backgroundColor: '#f3f4f6' } }}>
                  <TableCell sx={{ width: 50 }}>
                    <IconButton
                      size="small"
                      onClick={() => toggleExpand(customer.name)}
                      sx={{
                        color: '#667eea',
                        transition: 'transform 0.3s ease',
                        transform: expandedCustomers[customer.name]
                          ? 'rotate(180deg)'
                          : 'rotate(0deg)',
                      }}
                    >
                      <KeyboardArrowDown />
                    </IconButton>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1f2937' }}>
                    {customer.name}
                  </TableCell>
                  <TableCell sx={{ color: '#6b7280' }}>
                    {customer.phone || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <span
                      style={{
                        backgroundColor: '#d1fae5',
                        color: '#065f46',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                      }}
                    >
                      {customer.membershipOwned?.membershipName || 'None'}
                    </span>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500, color: '#1f2937' }}>
                    {customer.allVisits.length}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#667eea' }}>
                    ₹{Number(customer.totalSpent || 0).toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: '#6b7280' }}>
                    {customer.lastVisit ? formatDate(customer.lastVisit) : 'N/A'}
                  </TableCell>
                </TableRow>

                {/* Expanded Row - Visit History */}
                <TableRow>
                  <TableCell colSpan={7} sx={{ paddingY: 0, paddingX: 0 }}>
                    <Collapse
                      in={expandedCustomers[customer.name]}
                      timeout="auto"
                    >
                      <Box sx={{ padding: '1.5rem', backgroundColor: '#f9fafb' }}>
                        <Typography
                          variant="h6"
                          sx={{
                            marginBottom: '1.5rem',
                            color: '#1f2937',
                            fontWeight: 600,
                            fontSize: '1rem',
                          }}
                        >
                          📋 Visit History ({customer.allVisits.length} visits)
                        </Typography>

                        {customer.allVisits && customer.allVisits.length > 0 ? (
                          <Box sx={{ overflowX: 'auto' }}>
                            <Table size="small" sx={{ minWidth: 700 }}>
                              <TableHead>
                                <TableRow
                                  sx={{
                                    backgroundColor: '#e5e7eb',
                                  }}
                                >
                                  <TableCell sx={{ fontWeight: 600 }}>
                                    Date
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>
                                    Services
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>
                                    Service Provider
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>
                                    Amount
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>
                                    Actions
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {customer.allVisits.map((visit, idx) => {
                                  const services = getVisitServices(visit);
                                  const total = getVisitTotal(visit);
                                  const providers =
                                    getServiceProviders(services);
                                  const visitDate = formatDate(visit.date);

                                  return (
                                    <TableRow
                                      key={idx}
                                      sx={{
                                        '&:hover': {
                                          backgroundColor: '#f3f4f6',
                                        },
                                      }}
                                    >
                                      <TableCell sx={{ color: '#6b7280' }}>
                                        {visitDate}
                                      </TableCell>
                                      <TableCell sx={{ color: '#374151' }}>
                                        <Box sx={{ maxWidth: '250px' }}>
                                          {services.length > 0 ? (
                                            <ul
                                              style={{
                                                margin: 0,
                                                paddingLeft: '1.5rem',
                                              }}
                                            >
                                              {services.map(
                                                (service, sIdx) => (
                                                  <li
                                                    key={sIdx}
                                                    style={{
                                                      fontSize: '0.85rem',
                                                      color: '#374151',
                                                      marginBottom:
                                                        '0.25rem',
                                                    }}
                                                  >
                                                    {service.serviceName ||
                                                      service.name ||
                                                      service.service ||
                                                      'Service'}
                                                    {(service.staffName ||
                                                      service.provider ||
                                                      service.staff) && (
                                                      <span
                                                        style={{
                                                          color: '#9ca3af',
                                                          fontSize: '0.75rem',
                                                        }}
                                                      >
                                                        {' '}
                                                        (
                                                        {service.staffName ||
                                                          service.provider ||
                                                          service.staff}
                                                        )
                                                      </span>
                                                    )}
                                                  </li>
                                                )
                                              )}
                                            </ul>
                                          ) : (
                                            <span style={{ color: '#9ca3af' }}>
                                              No services
                                            </span>
                                          )}
                                        </Box>
                                      </TableCell>
                                      <TableCell sx={{ color: '#6b7280' }}>
                                        {providers}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontWeight: 600,
                                          color: '#667eea',
                                        }}
                                      >
                                        ₹{total.toFixed(2)}
                                      </TableCell>
                                      <TableCell>
                                        <Box sx={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                          <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<Receipt size={16} />}
                                            onClick={() =>
                                              handleViewBill(visit)
                                            }
                                            sx={{
                                              borderColor: '#667eea',
                                              color: '#667eea',
                                              fontSize: '0.7rem',
                                              padding: '0.375rem 0.5rem',
                                              '&:hover': {
                                                borderColor: '#764ba2',
                                                backgroundColor:
                                                  'rgba(102, 126, 234, 0.05)',
                                              },
                                            }}
                                          >
                                            View
                                          </Button>
                                          <Button
                                            size="small"
                                            variant="contained"
                                            startIcon={<Send size={16} />}
                                            onClick={() =>
                                              sendBillViaWhatsApp(
                                                customer,
                                                visit
                                              )
                                            }
                                            sx={{
                                              background:
                                                'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                              fontSize: '0.7rem',
                                              padding: '0.375rem 0.5rem',
                                              '&:hover': {
                                                background:
                                                  'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                              },
                                            }}
                                          >
                                            WhatsApp
                                          </Button>
                                        </Box>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </Box>
                        ) : (
                          <Typography sx={{ color: '#6b7280' }}>
                            No visit history recorded
                          </Typography>
                        )}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Bill Dialog */}
      <Dialog
        open={billDialog.open}
        onClose={closeBillDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '0.75rem',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 600,
            fontSize: '1.25rem',
          }}
        >
          💳 Transaction Bill
        </DialogTitle>
        <DialogContent sx={{ padding: '2rem' }}>
          {billDialog.bill && (
            <Box sx={{ marginTop: '1rem' }}>
              <Typography
                sx={{
                  marginBottom: '1.5rem',
                  color: '#6b7280',
                  fontSize: '0.95rem',
                }}
              >
                <strong>📅 Date:</strong> {formatDate(billDialog.bill.date)}
              </Typography>
              <Typography
                sx={{
                  marginBottom: '1rem',
                  fontWeight: 600,
                  color: '#1f2937',
                  fontSize: '1rem',
                }}
              >
                🔧 Services
              </Typography>
              <Box sx={{ marginLeft: '1.5rem', marginBottom: '1.5rem' }}>
                {getVisitServices(billDialog.bill).length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                    {getVisitServices(billDialog.bill).map((service, idx) => (
                      <li
                        key={idx}
                        style={{
                          color: '#374151',
                          marginBottom: '0.75rem',
                          fontSize: '0.95rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span>
                          {service.serviceName ||
                            service.name ||
                            service.service ||
                            'Service'}
                          {(service.staffName ||
                            service.provider ||
                            service.staff) && (
                            <span style={{ color: '#9ca3af' }}>
                              {' '}
                              ({service.staffName ||
                                service.provider ||
                                service.staff})
                            </span>
                          )}
                        </span>
                        <span style={{ fontWeight: 500, color: '#667eea' }}>
                          ₹{Number(service.price || 0).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Typography sx={{ color: '#9ca3af' }}>
                    No services in this bill
                  </Typography>
                )}
              </Box>
              <Box
                sx={{
                  borderTop: '2px solid #e5e7eb',
                  paddingTop: '1rem',
                  marginTop: '1.5rem',
                }}
              >
                {billDialog.bill.discount > 0 && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <Typography sx={{ color: '#16a34a', fontWeight: 500 }}>
                      ✓ Discount:
                    </Typography>
                    <Typography sx={{ color: '#16a34a', fontWeight: 500 }}>
                      -₹{Number(billDialog.bill.discount || 0).toFixed(2)}
                    </Typography>
                  </Box>
                )}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #e5e7eb',
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: '#1f2937',
                      fontSize: '1.125rem',
                    }}
                  >
                    Total Amount:
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: '#667eea',
                      fontSize: '1.25rem',
                    }}
                  >
                    ₹{getVisitTotal(billDialog.bill).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CustomersTable;