import { DollarSign, Home, Package, Plus, Printer, Save, Scissors, Search, Tag, Trash2, TrendingUp, User, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import './App.css';
import './storage-mock';

// Storage helper functions
const saveData = async (key, value, shared = false) => {
  try {
    const result = await window.storage.set(key, JSON.stringify(value), shared);
    return result !== null;
  } catch (error) {
    console.error('Storage error:', error);
    return false;
  }
};

const getData = async (key, shared = false) => {
  try {
    const result = await window.storage.get(key, shared);
    return result ? JSON.parse(result.value) : null;
  } catch (error) {
    return null;
  }
};

const listKeys = async (prefix, shared = false) => {
  try {
    const result = await window.storage.list(prefix, shared);
    return result ? result.keys : [];
  } catch (error) {
    return [];
  }
};

// Initialize default data
const initializeData = async () => {
  const services = await getData('salon_services');
  if (!services) {
    await saveData('salon_services', [
      { id: 1, name: 'Haircut', price: 200 },
      { id: 2, name: 'Beard Trim', price: 300 },
      { id: 3, name: 'Facial', price: 1500 },
      { id: 4, name: 'Manicure', price: 800 },
      { id: 5, name: 'Pedicure', price: 1000 },
      { id: 6, name: 'Hair Spa', price: 1800 },
      { id: 7, name: 'Blow Dry', price: 600 },
      { id: 8, name: 'Hair Color', price: 2000 },
    ]);
  }

  const products = await getData('salon_products');
  if (!products) {
    await saveData('salon_products', [
      { id: 1, name: 'Shampoo', price: 450 },
      { id: 2, name: 'Conditioner', price: 500 },
      { id: 3, name: 'Hair Serum', price: 850 },
      { id: 4, name: 'Face Cream', price: 1200 },
      { id: 5, name: 'Hair Oil', price: 650 }
    ]);
  }


  
  const staff = await getData('salon_staff');
  if (!staff) {
    await saveData('salon_staff', [
      { id: 1, name: 'Vicky ' },
      { id: 2, name: 'Rakhi' },
      { id: 3, name: 'Akash' },
      { id: 4, name: 'Komal' },
      { id: 5, name: 'Babul' },
      { id: 6, name: 'Nishu' },
      { id: 7, name: 'Nabin' },
      { id: 8, name: 'Rushan' }
    ]);
  }

  const memberships = await getData('salon_memberships');
  if (!memberships) {
    await saveData('salon_memberships', [
      { id: 1, name: 'Green Card', discount: 20, off:'off' },
      { id: 2, name: 'Service card', discount: 0, servicesNum: 6, services: 'services', timesNum: 12, times: 'times' }
    ]);
  }
};

function SalonBillingSystem() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Billing form state
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dob, setDob] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [additionalDiscount, setAdditionalDiscount] = useState(0);

  // Search states
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [transactionSearchTerm, setTransactionSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      await initializeData();
      const loadedServices = await getData('salon_services') || [];
      const loadedProducts = await getData('salon_products') || [];
      const loadedStaff = await getData('salon_staff') || [];
      const loadedMemberships = await getData('salon_memberships') || [];
      
      setServices(loadedServices);
      setProducts(loadedProducts);
      setStaff(loadedStaff);
      setMemberships(loadedMemberships);

      const txKeys = await listKeys('tx_');
      const txData = [];
      for (const key of txKeys) {
        const tx = await getData(key);
        if (tx) txData.push(tx);
      }
      setTransactions(txData.sort((a, b) => new Date(b.date) - new Date(a.date)));

      const custKeys = await listKeys('cust_');
      const custData = [];
      for (const key of custKeys) {
        const cust = await getData(key);
        if (cust) custData.push(cust);
      }
      setCustomers(custData);
    };
    loadData();
  }, []);

  const addService = () => {
    setSelectedServices([...selectedServices, { serviceId: '', staffId: '', price: 0 }]);
  };

  const updateService = (index, field, value) => {
    const updated = [...selectedServices];
    if (field === 'serviceId') {
      const service = services.find(s => s.id === parseInt(value));
      updated[index] = { ...updated[index], serviceId: value, price: service ? service.price : 0 };
    } else {
      updated[index][field] = value;
    }
    setSelectedServices(updated);
  };

  const removeService = (index) => {
    setSelectedServices(selectedServices.filter((_, i) => i !== index));
  };

  const addProduct = () => {
    setSelectedProducts([...selectedProducts, { productId: '', quantity: 1, price: 0 }]);
  };

  const updateProduct = (index, field, value) => {
    const updated = [...selectedProducts];
    if (field === 'productId') {
      const product = products.find(p => p.id === parseInt(value));
      updated[index] = { ...updated[index], productId: value, price: product ? product.price : 0 };
    } else {
      updated[index][field] = value;
    }
    setSelectedProducts(updated);
  };

  const removeProduct = (index) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const servicesTotal = selectedServices.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);
    const productsTotal = selectedProducts.reduce((sum, p) => sum + (parseFloat(p.price) || 0) * (parseInt(p.quantity) || 1), 0);
    const subtotal = servicesTotal + productsTotal;
    
    let discount = parseFloat(additionalDiscount) || 0;
    if (selectedMembership) {
      const membership = memberships.find(m => m.id === parseInt(selectedMembership));
      if (membership) {
        discount += (subtotal * membership.discount / 100);
      }
    }
    
    return {
      servicesTotal,
      productsTotal,
      subtotal,
      discount,
      total: subtotal - discount
    };
  };

  const generateBillContent = () => {
    const totals = calculateTotal();
    const billDate = new Date().toLocaleString('en-IN');
    
    let content = '================================\n';
    content += ' GREAT LOOK PROFESSIONALS UNISEX STUDIO\n';
    content += '================================\n';
    content += 'Date: ' + billDate + '\n\n';
    // content += 'Customer Details:\n';
    content += 'Customer Name: ' + (customerName || 'Walk-in Customer') + '\n';
    // content += 'Phone: ' + (phoneNumber || 'N/A') + '\n';
    // content += 'DOB: ' + (dob || 'N/A') + '\n';
    
    if (selectedMembership) {
      const membership = memberships.find(m => m.id === parseInt(selectedMembership));
      if (membership) {
        content += 'Membership: ' + membership.name + '\n';
      }
    }

    content += '\n--------------------------------\n';
    content += 'SERVICES              Amount\n';
    content += '--------------------------------\n';

    selectedServices.forEach(s => {
      const service = services.find(srv => srv.id === parseInt(s.serviceId));
      const staffMember = staff.find(st => st.id === parseInt(s.staffId));
      if (service) {
        // content += service.name + '\n';
        content += service.name + '          Rs. ' + s.price + '\n';
        // content += '  Price: Rs.' + s.price + '\n\n';
        // content += '  Staff: ' + (staffMember ? staffMember.name : 'N/A') + '\n';
      }
    });

    if (selectedProducts.length > 0) {
      content += '--------------------------------\n';
      content += 'PRODUCTS               Amount\n';
      content += '--------------------------------\n';
      
      selectedProducts.forEach(p => {
        const product = products.find(prd => prd.id === parseInt(p.productId));
        if (product) {
          // content += product.name + '    ' + p.quantity + '  Rs.' + (p.price * p.quantity);
          content += product.name + '        ' + '  Rs.' + (p.price * p.quantity) + '\n';
          // content += '  Price: Rs.' + (p.price * p.quantity) + '\n\n';
        }
      });
    }

    content += '================================\n';
    content += 'Services Total:    Rs.' + totals.servicesTotal.toFixed(2) + '\n';
    content += 'Products Total:    Rs.' + totals.productsTotal.toFixed(2) + '\n';
    content += '--------------------------------\n';
    content += 'Subtotal:          Rs.' + totals.subtotal.toFixed(2) + '\n';
    content += 'Discount:          Rs.' + totals.discount.toFixed(2) + '\n';
    content += '================================\n';
    content += 'TOTAL:             Rs.' + totals.total.toFixed(2) + '\n';
    content += '================================\n\n';
    content += '     Thank you for visiting!\n';
    content += '      Please come again!\n';
    content += '================================\n';

    return content;
  };

  const saveTransaction = async (shouldPrint = false) => {
    if (!customerName && !phoneNumber) {
      alert('Please enter at least customer name or phone number');
      return;
    }

    if (selectedServices.length === 0 && selectedProducts.length === 0) {
      alert('Please add at least one service or product');
      return;
    }

    const totals = calculateTotal();
    const txId = 'tx_' + Date.now();
    const custId = phoneNumber ? 'cust_' + phoneNumber : 'cust_' + Date.now();

    const transaction = {
      id: txId,
      customerId: custId,
      customerName,
      phoneNumber,
      dob,
      date: new Date().toISOString(),
      services: selectedServices.map(s => {
        const service = services.find(srv => srv.id === parseInt(s.serviceId));
        const staffMember = staff.find(st => st.id === parseInt(s.staffId));
        return {
          ...s,
          serviceName: service ? service.name : '',
          staffName: staffMember ? staffMember.name : ''
        };
      }),
      products: selectedProducts.map(p => {
        const product = products.find(prd => prd.id === parseInt(p.productId));
        return {
          ...p,
          productName: product ? product.name : ''
        };
      }),
      membership: selectedMembership ? (memberships.find(m => m.id === parseInt(selectedMembership)) ? memberships.find(m => m.id === parseInt(selectedMembership)).name : null) : null,
      totals,
      printed: shouldPrint
    };

    await saveData(txId, transaction);

    let customer = await getData(custId);
    if (!customer) {
      customer = {
        id: custId,
        name: customerName,
        phone: phoneNumber,
        dob: dob,
        visits: [],
        totalSpent: 0
      };
    }
    customer.visits.push(txId);
    customer.totalSpent += totals.total;
    customer.lastVisit = new Date().toISOString();
    await saveData(custId, customer);

    if (shouldPrint) {
      printBill();
    }

    const txKeys = await listKeys('tx_');
    const txData = [];
    for (const key of txKeys) {
      const tx = await getData(key);
      if (tx) txData.push(tx);
    }
    setTransactions(txData.sort((a, b) => new Date(b.date) - new Date(a.date)));

    const custKeys = await listKeys('cust_');
    const custData = [];
    for (const key of custKeys) {
      const cust = await getData(key);
      if (cust) custData.push(cust);
    }
    setCustomers(custData);

    resetForm();
    alert(shouldPrint ? 'Bill printed and data saved!' : 'Data saved successfully!');
  };

  const printBill = () => {
    const billContent = generateBillContent();
    const printWindow = window.open('', '_blank', 'width=302,height=600');
    printWindow.document.write('<html><head><title>Print Bill</title><style>@media print {@page {size: 58mm auto;margin: 0;}}body {width: 58mm;margin: 0;padding: 2mm;font-family: "Courier New", monospace;font-size: 10px;line-height: 1.3;}pre {margin: 0;white-space: pre-wrap;word-wrap: break-word;}</style></head><body><pre>' + billContent + '</pre><script>window.onload = function() {window.print();setTimeout(function() { window.close(); }, 100);};</script></body></html>');
    printWindow.document.close();
  };

  const resetForm = () => {
    setCustomerName('');
    setPhoneNumber('');
    setDob('');
    setSelectedServices([]);
    setSelectedProducts([]);
    setSelectedMembership(null);
    setAdditionalDiscount(0);
  };

  const renderDashboard = () => {
    const totalSales = transactions.reduce((sum, tx) => sum + tx.totals.total, 0);
    const totalServices = transactions.reduce((sum, tx) => sum + tx.services.length, 0);
    const totalProducts = transactions.reduce((sum, tx) => sum + tx.products.reduce((pSum, p) => pSum + p.quantity, 0), 0);

    return (
      <div className="main-content">
        <h1 className="page-title">Dashboard</h1>
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-card-content">
              <div>
                <p className="stat-label">Total Sales</p>
                <p className="stat-value">₹{totalSales.toFixed(2)}</p>
              </div>
              <DollarSign size={48} style={{opacity: 0.8}} />
            </div>
          </div>
          <div className="stat-card green">
            <div className="stat-card-content">
              <div>
                <p className="stat-label">Customers</p>
                <p className="stat-value">{customers.length}</p>
              </div>
              <Users size={48} style={{opacity: 0.8}} />
            </div>
          </div>
          <div className="stat-card purple">
            <div className="stat-card-content">
              <div>
                <p className="stat-label">Services Provided</p>
                <p className="stat-value">{totalServices}</p>
              </div>
              <Scissors size={48} style={{opacity: 0.8}} />
            </div>
          </div>
          <div className="stat-card orange">
            <div className="stat-card-content">
              <div>
                <p className="stat-label">Products Sold</p>
                <p className="stat-value">{totalProducts}</p>
              </div>
              <Package size={48} style={{opacity: 0.8}} />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Recent Transactions</h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Services</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 10).map((tx) => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.date).toLocaleDateString('en-IN')}</td>
                    <td>{tx.customerName || 'Walk-in'}</td>
                    <td>{tx.services.length + tx.products.length} items</td>
                    <td className="font-medium">₹{tx.totals.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderBilling = () => {
    const totals = calculateTotal();

    return (
      <div className="main-content">
        <h1 className="page-title">New Bill</h1>
        <div className="grid grid-cols-1">
          <div className="grid grid-cols-3">
            <div className="col-span-2">
              <div className="card">
                <h2 className="card-title">
                  <User size={20} />
                  Customer Details
                </h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Customer Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="form-input"
                      placeholder="Enter name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="form-input"
                      placeholder="Enter phone"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Membership</label>
                    <select
                      value={selectedMembership || ''}
                      onChange={(e) => setSelectedMembership(e.target.value || null)}
                      className="form-select"
                    >
                      <option value="">No Membership</option>
                      {memberships.map((m) => (
                        <option key={m.id} value={m.id}>{m.name} ({m.discount}{m.servicesNum} {m.off} {m.services} {m.timesNum} {m.times})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="card-title" style={{marginBottom: 0}}>
                    <Scissors size={20} />
                    Services
                  </h2>
                  <button onClick={addService} className="btn btn-primary">
                    <Plus size={16} />
                    Add Service
                  </button>
                </div>
                <div className="item-list">
                  {selectedServices.map((service, index) => (
                    <div key={index} className="item-row">
                      <div className="item-fields">
                        <select
                          value={service.serviceId}
                          onChange={(e) => updateService(index, 'serviceId', e.target.value)}
                          className="form-select"
                        >
                          <option value="">Select Service</option>
                          {services.map((s) => (
                            <option key={s.id} value={s.id}>{s.name} - ₹{s.price}</option>
                          ))}
                        </select>
                        <select
                          value={service.staffId}
                          onChange={(e) => updateService(index, 'staffId', e.target.value)}
                          className="form-select"
                        >
                          <option value="">Select Staff</option>
                          {staff.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <button onClick={() => removeService(index)} className="btn btn-danger">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                  {selectedServices.length === 0 && (
                    <p className="empty-state">No services added</p>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="card-title" style={{marginBottom: 0}}>
                    <Package size={20} />
                    Products
                  </h2>
                  <button onClick={addProduct} className="btn btn-success">
                    <Plus size={16} />
                    Add Product
                  </button>
                </div>
                <div className="item-list">
                  {selectedProducts.map((product, index) => (
                    <div key={index} className="item-row">
                      <div className="item-fields">
                        <select
                          value={product.productId}
                          onChange={(e) => updateProduct(index, 'productId', e.target.value)}
                          className="form-select"
                        >
                          <option value="">Select Product</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          value={product.quantity}
                          onChange={(e) => updateProduct(index, 'quantity', e.target.value)}
                          className="form-input"
                          placeholder="Qty"
                        />
                      </div>
                      <button onClick={() => removeProduct(index)} className="btn btn-danger">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                  {selectedProducts.length === 0 && (
                    <p className="empty-state">No products added</p>
                  )}
                </div>
              </div>

              <div className="card">
                <h2 className="card-title">
                  <Tag size={20} />
                  Additional Discount
                </h2>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={additionalDiscount}
                  onChange={(e) => setAdditionalDiscount(e.target.value)}
                  className="form-input"
                  placeholder="Enter discount amount"
                />
              </div>
            </div>

            <div>
              <div className="card bill-summary">
                <h2 className="card-title">Bill Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="summary-line">
                    <span>Services Total:</span>
                    <span className="font-medium">₹{totals.servicesTotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-line">
                    <span>Products Total:</span>
                    <span className="font-medium">₹{totals.productsTotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-line subtotal">
                    <span>Subtotal:</span>
                    <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="summary-line discount">
                      <span>Discount:</span>
                      <span className="font-medium">-₹{totals.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="summary-line total">
                    <span>Total:</span>
                    <span className="amount">₹{totals.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => saveTransaction(true)}
                    className="btn btn-primary btn-block"
                  >
                    <Printer size={20} />
                    Print & Save
                  </button>
                  <button
                    onClick={() => saveTransaction(false)}
                    className="btn btn-success btn-block"
                  >
                    <Save size={20} />
                    Save Only
                  </button>
                  <button
                    onClick={resetForm}
                    className="btn btn-secondary btn-block"
                  >
                    <X size={20} />
                    Clear Form
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomers = () => {
    const filteredCustomers = customers.filter(c => 
      (c.name && c.name.toLowerCase().includes(customerSearchTerm.toLowerCase())) ||
      (c.phone && c.phone.includes(customerSearchTerm))
    );

    return (
      <div className="main-content">
        <h1 className="page-title">Customers</h1>
        <div className="card">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              value={customerSearchTerm}
              onChange={(e) => setCustomerSearchTerm(e.target.value)}
              placeholder="Search by name or phone..."
              className="search-input"
            />
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>DOB</th>
                  <th>Visits</th>
                  <th>Total Spent</th>
                  <th>Last Visit</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="font-medium">{customer.name || 'N/A'}</td>
                    <td>{customer.phone || 'N/A'}</td>
                    <td>{customer.dob || 'N/A'}</td>
                    <td>{customer.visits ? customer.visits.length : 0}</td>
                    <td className="font-medium">₹{customer.totalSpent ? customer.totalSpent.toFixed(2) : '0.00'}</td>
                    <td>{customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString('en-IN') : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCustomers.length === 0 && (
              <p className="empty-state">No customers found</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTransactions = () => {
    const filteredTransactions = transactions.filter(tx =>
      (tx.customerName && tx.customerName.toLowerCase().includes(transactionSearchTerm.toLowerCase())) ||
      (tx.phoneNumber && tx.phoneNumber.includes(transactionSearchTerm))
    );

    return (
      <div className="main-content">
        <h1 className="page-title">Transaction History</h1>
        <div className="card">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              value={transactionSearchTerm}
              onChange={(e) => setTransactionSearchTerm(e.target.value)}
              placeholder="Search by customer name or phone..."
              className="search-input"
            />
          </div>
          <div className="transaction-list">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="transaction-card">
                <div className="transaction-header">
                  <div className="transaction-customer">
                    <h3>{tx.customerName || 'Walk-in Customer'}</h3>
                    <p>{tx.phoneNumber || 'No phone'}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(tx.date).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="transaction-amount">
                    <p className="transaction-total">₹{tx.totals.total.toFixed(2)}</p>
                    {tx.printed && (
                      <span className="badge">Printed</span>
                    )}
                  </div>
                </div>
                <div className="transaction-details">
                  <div className="detail-section">
                    <h4>Services:</h4>
                    {tx.services.length > 0 ? (
                      <ul className="detail-list">
                        {tx.services.map((s, i) => (
                          <li key={i}>• {s.serviceName} - {s.staffName} (₹{s.price})</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No services</p>
                    )}
                  </div>
                  <div className="detail-section">
                    <h4>Products:</h4>
                    
                    {tx.products.length > 0 ? (
                      <ul className="detail-list">
                        {tx.products.map((p, i) => (
                          <li key={i}>• {p.productName} x{p.quantity} (₹{p.price * p.quantity})</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No products</p>
                    )}
                  </div>
                </div>
                {tx.membership && (
                  <div className="mt-3" style={{paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb'}}>
                    <p className="text-sm">
                      <span className="font-medium">Membership:</span> {tx.membership}
                    </p>
                  </div>
                )}
                {tx.totals.discount > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600">
                      <span className="font-medium">Discount Applied:</span> ₹{tx.totals.discount.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            ))}
            {filteredTransactions.length === 0 && (
              <p className="empty-state">No transactions found</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderServices = () => {
    const serviceStats = {};
    transactions.forEach(tx => {
      tx.services.forEach(s => {
        if (!serviceStats[s.serviceName]) {
          serviceStats[s.serviceName] = { count: 0, revenue: 0 };
        }
        serviceStats[s.serviceName].count++;
        serviceStats[s.serviceName].revenue += parseFloat(s.price);
      });
    });

    const sortedServices = Object.entries(serviceStats).sort((a, b) => b[1].count - a[1].count);

    return (
      <div className="main-content">
        <h1 className="page-title">Service Analytics</h1>
        <div className="card">
          <h2 className="card-title">Popular Services</h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Times Booked</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {sortedServices.map(([name, stats]) => (
                  <tr key={name}>
                    <td className="font-medium">{name}</td>
                    <td>{stats.count}</td>
                    <td className="font-medium">₹{stats.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sortedServices.length === 0 && (
              <p className="empty-state">No service data available</p>
            )}
          </div>
        </div>

        <div className="card mt-6">
          <h2 className="card-title">Staff Performance</h2>
          <div className="staff-grid">
            {staff.map(s => {
              const staffServices = transactions.reduce((count, tx) => {
                return count + tx.services.filter(srv => srv.staffName === s.name).length;
              }, 0);
              return (
                <div key={s.id} className="staff-card">
                  <p className="staff-name">{s.name}</p>
                  <p className="staff-count">{staffServices}</p>
                  <p className="staff-label">Services Completed</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderProducts = () => {
    const productStats = {};
    transactions.forEach(tx => {
      tx.products.forEach(p => {
        if (!productStats[p.productName]) {
          productStats[p.productName] = { quantity: 0, revenue: 0 };
        }
        productStats[p.productName].quantity += parseInt(p.quantity);
        productStats[p.productName].revenue += parseFloat(p.price) * parseInt(p.quantity);
      });
    });

    const sortedProducts = Object.entries(productStats).sort((a, b) => b[1].quantity - a[1].quantity);

    return (
      <div className="main-content">
        <h1 className="page-title">Product Analytics</h1>
        <div className="card">
          <h2 className="card-title">Product Sales</h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map(([name, stats]) => (
                  <tr key={name}>
                    <td className="font-medium">{name}</td>
                    <td>{stats.quantity}</td>
                    <td className="font-medium">₹{stats.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sortedProducts.length === 0 && (
              <p className="empty-state">No product sales data available</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <Scissors size={32} color="#2563eb" />
            <h1>Salon Management</h1>
          </div>
          <div className="navbar-menu">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={currentPage === 'dashboard' ? 'nav-btn active' : 'nav-btn'}
            >
              <Home size={20} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentPage('billing')}
              className={currentPage === 'billing' ? 'nav-btn active' : 'nav-btn'}
            >
              <Printer size={20} />
              <span>New Bill</span>
            </button>
            <button
              onClick={() => setCurrentPage('customers')}
              className={currentPage === 'customers' ? 'nav-btn active' : 'nav-btn'}
            >
              <Users size={20} />
              <span>Customers</span>
            </button>
            <button
              onClick={() => setCurrentPage('transactions')}
              className={currentPage === 'transactions' ? 'nav-btn active' : 'nav-btn'}
            >
              <TrendingUp size={20} />
              <span>Transactions</span>
            </button>
            <button
              onClick={() => setCurrentPage('services')}
              className={currentPage === 'services' ? 'nav-btn active' : 'nav-btn'}
            >
              <Scissors size={20} />
              <span>Services</span>
            </button>
            <button
              onClick={() => setCurrentPage('products')}
              className={currentPage === 'products' ? 'nav-btn active' : 'nav-btn'}
            >
              <Package size={20} />
              <span>Products</span>
            </button>
          </div>
        </div>
      </nav>

      <main>
        {currentPage === 'dashboard' && renderDashboard()}
        {currentPage === 'billing' && renderBilling()}
        {currentPage === 'customers' && renderCustomers()}
        {currentPage === 'transactions' && renderTransactions()}
        {currentPage === 'services' && renderServices()}
        {currentPage === 'products' && renderProducts()}
      </main>
    </div>
  );
}

export default SalonBillingSystem;