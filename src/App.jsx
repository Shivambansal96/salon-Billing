
import { Award, Calendar, DollarSign, Home, Printer, Save, Scissors, Search, Tag, Trash2, TrendingUp, User, Users, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import './App.css';
import './storage-mock';

// Service catalog with pricing
const serviceCatalog = {
  women: [
    { category: "Facial", service: "Aroma Facial", r_price: 750, m_price: 700 },
    { category: "Facial", service: "Pure Moist", r_price: 750, m_price: 700 },
    { category: "Facial", service: "Fruit Facial", r_price: 1000, m_price: 900 },
    { category: "Facial", service: "Lotos Puravital", r_price: 1100, m_price: 1050 },
    { category: "Facial", service: "Lotus Hydravital", r_price: 1100, m_price: 1050 },
    { category: "Facial", service: "Gold Facial", r_price: 1200, m_price: 1100 },
    { category: "Facial", service: "D-Tan Facial", r_price: 1350, m_price: 1250 },
    { category: "Facial", service: "Charcoal Facial", r_price: 1300, m_price: 1200 },
    { category: "Facial", service: "Acne Facial Treatment", r_price: 1500, m_price: 1450 },
    { category: "Facial", service: "Skin Lightening", r_price: 1700, m_price: 1600 },
    { category: "Facial", service: "O3+ Facial", r_price: 1900, m_price: 1700 },
    { category: "Facial", service: "Radiance Facial", r_price: 2200, m_price: 2000 },
    { category: "Facial", service: "Anti-ageing Facial", r_price: 2500, m_price: 2300 },
    { category: "Facial", service: "Pigmentation Facial", r_price: 2500, m_price: 2300 },
    { category: "Facial", service: "Diamond Facial", r_price: 3000, m_price: 2800 },
    { category: "Facial", service: "Pearl Facial", r_price: 2000, m_price: 1900 },
    { category: "Add On Mask", service: "Firming Mask", r_price: 450, m_price: 400 },
    { category: "Add On Mask", service: "Bridal Glow", r_price: 700, m_price: 650 },
    { category: "Add On Mask", service: "Charcoal Mask", r_price: 500, m_price: 450 },
    { category: "Add On Mask", service: "Whitening & Brightening", r_price: 750, m_price: 700 },
    { category: "Add On Mask", service: "Skin Tightening", r_price: 700, m_price: 600 }
  ],
  men: [
    { category: "Facial", service: "Aroma Facial", r_price: 750, m_price: 700 },
    { category: "Facial", service: "Pure Moist", r_price: 750, m_price: 700 },
    { category: "Facial", service: "Fruit Facial", r_price: 1000, m_price: 900 },
    { category: "Facial", service: "Lotos Puravital", r_price: 1100, m_price: 1050 },
    { category: "Facial", service: "Lotus Hydravital", r_price: 1100, m_price: 1050 },
    { category: "Facial", service: "Gold Facial", r_price: 1200, m_price: 1100 },
    { category: "Facial", service: "D-Tan Facial", r_price: 1350, m_price: 1250 },
    { category: "Facial", service: "Charcoal Facial", r_price: 1300, m_price: 1200 },
    { category: "Facial", service: "Acne Facial Treatment", r_price: 1500, m_price: 1450 },
    { category: "Facial", service: "Skin Lightening", r_price: 1700, m_price: 1600 },
    { category: "Facial", service: "O3+ Facial", r_price: 1900, m_price: 1700 },
    { category: "Facial", service: "Radiance Facial", r_price: 2200, m_price: 2000 },
    { category: "Facial", service: "Anti-ageing Facial", r_price: 2500, m_price: 2300 },
    { category: "Facial", service: "Pigmentation Facial", r_price: 2500, m_price: 2300 },
    { category: "Facial", service: "Diamond Facial", r_price: 3000, m_price: 2800 },
    { category: "Facial", service: "Pearl Facial", r_price: 2000, m_price: 1900 },
    { category: "Peel-Off Mask", service: "Gold Peel-Off Mask", r_price: 250, m_price: 200 },
    { category: "Peel-Off Mask", service: "Charcoal Peel-Off Mask", r_price: 200, m_price: 150 },
    { category: "Peel-Off Mask", service: "Skin Tightening Mask", r_price: 300, m_price: 250 },
    { category: "Peel-Off Mask", service: "Skin Lightening Mask", r_price: 500, m_price: 450 },
    { category: "Hair Oil Massage", service: "Olive Oil", r_price: 300, m_price: 250 },
    { category: "Hair Oil Massage", service: "Coconut Oil", r_price: 250, m_price: 200 },
    { category: "Hair Oil Massage", service: "Aroma Oil", r_price: 350, m_price: 200 },
    { category: "Hair Oil Massage", service: "Moroccan Oil", r_price: 450, m_price: 400 }
  ]
};

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
  const memberships = await getData('salon_memberships');
  if (!memberships) {
    await saveData('salon_memberships', [
      { id: 1, name: 'Green Card', discount: 10 },
      { id: 2, name: 'Service Card', servicesNum: 6, services: 'services', timesNum: 12, times: 'times', price: 5000 }
    ]);
  }

  const staff = await getData('salon_staff');
  if (!staff) {
    await saveData('salon_staff', [
      { id: 1, name: 'Vicky' },
      { id: 2, name: 'Rakhi' },
      { id: 3, name: 'Akash' },
      { id: 4, name: 'Komal' },
      { id: 5, name: 'Babul' },
      { id: 6, name: 'Nishu' },
      { id: 7, name: 'Nabin' },
      { id: 8, name: 'Rushan' }
    ]);
  }
};

function SalonBillingSystem() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [staff, setStaff] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState(null);

  // Billing form state
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dob, setDob] = useState('');
  const [selectedGender, setSelectedGender] = useState('women');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [isGreenCard, setIsGreenCard] = useState(false);
  const [additionalDiscount, setAdditionalDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('fixed');

  // Membership purchase state
  const [purchaseMembership, setPurchaseMembership] = useState(null);
  const [membershipCardNumber, setMembershipCardNumber] = useState('');
  const [membershipDoi, setMembershipDoi] = useState('');
  const [membershipExpiry, setMembershipExpiry] = useState('');

  // Filter states
  const [dashboardDateFrom, setDashboardDateFrom] = useState('');
  const [dashboardDateTo, setDashboardDateTo] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [transactionSearchTerm, setTransactionSearchTerm] = useState('');
  const [transactionDateFrom, setTransactionDateFrom] = useState('');
  const [transactionDateTo, setTransactionDateTo] = useState('');

  // Toast state
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      await initializeData();
      const loadedStaff = await getData('salon_staff') || [];
      const loadedMemberships = await getData('salon_memberships') || [];

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

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getCategories = () => {
    const services = selectedGender === 'women' ? serviceCatalog.women : serviceCatalog.men;
    return [...new Set(services.map(s => s.category))];
  };

  const getServicesByCategory = () => {
    const services = selectedGender === 'women' ? serviceCatalog.women : serviceCatalog.men;
    return services.filter(s => s.category === selectedCategory);
  };

  const addService = (service) => {
    const price = isGreenCard ? service.m_price : service.r_price;
    setSelectedServices([...selectedServices, {
      serviceName: service.service,
      category: service.category,
      r_price: service.r_price,
      m_price: service.m_price,
      price: price,
      staffId: '',
      staffName: '',
      gender: selectedGender
    }]);
  };

  const removeService = (index) => {
    setSelectedServices(selectedServices.filter((_, i) => i !== index));
  };

  const updateServiceStaff = (index, staffId) => {
    const updated = [...selectedServices];
    const staffMember = staff.find(s => s.id === parseInt(staffId));
    updated[index].staffId = staffId;
    updated[index].staffName = staffMember ? staffMember.name : '';
    setSelectedServices(updated);
  };

  const toggleGreenCard = () => {
    const newIsGreenCard = !isGreenCard;
    setIsGreenCard(newIsGreenCard);

    // Update prices for all services
    const updated = selectedServices.map(s => ({
      ...s,
      price: newIsGreenCard ? s.m_price : s.r_price
    }));
    setSelectedServices(updated);
  };

  const calculateTotal = () => {
    const servicesTotal = selectedServices.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);
    const subtotal = servicesTotal;

    let discount = 0;
    const discountValue = parseFloat(additionalDiscount) || 0;

    if (discountType === 'percentage') {
      discount = (subtotal * discountValue / 100);
    } else {
      discount = discountValue;
    }

    // Calculate amount saved if Green Card is used
    let amountSaved = 0;
    if (isGreenCard) {
      amountSaved = selectedServices.reduce((sum, s) => sum + (s.r_price - s.m_price), 0);
    }

    return {
      servicesTotal,
      subtotal,
      discount,
      amountSaved,
      total: subtotal - discount
    };
  };

  const generateBillContent = () => {
    const totals = calculateTotal();
    const billDate = new Date().toLocaleString('en-IN');

    let content = '================================\n';
    content += ' GREAT LOOK PROFESSIONALS\n';
    content += '================================\n';
    content += 'Date: ' + billDate + '\n\n';
    content += 'Customer Name: ' + (customerName || 'Walk-in Customer') + '\n';

    if (isGreenCard) {
      content += 'Membership: Green Card\n';
    }

    content += '\n--------------------------------\n';
    content += 'SERVICES                  Amount\n';
    content += '--------------------------------\n';

    selectedServices.forEach(s => {
      content += s.serviceName + '          Rs. ' + s.price + '\n';
    });

    content += '================================\n';
    content += 'Services Total:    Rs.' + totals.servicesTotal.toFixed(2) + '\n';
    content += '--------------------------------\n';
    if (totals.amountSaved > 0) {
      content += 'Amount Saved:      Rs.' + totals.amountSaved.toFixed(2) + '\n';
    }
    content += 'Subtotal:          Rs.' + totals.subtotal.toFixed(2) + '\n';
    if (totals.discount > 0) {
      content += 'Discount:          Rs.' + totals.discount.toFixed(2) + '\n';
    }
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
      showToast('Please enter customer name or phone number', 'error');
      return;
    }

    if (selectedServices.length === 0) {
      showToast('Please add at least one service', 'error');
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
      services: selectedServices,
      membership: isGreenCard ? 'Green Card' : null,
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
        totalSpent: 0,
        membershipOwned: null,
        serviceCardUsages: []
      };
    }

    if (isGreenCard) {
      customer.membershipOwned = {
        membershipId: 1,
        membershipName: 'Green Card'
      };
    }

    customer.visits.push(txId);
    customer.totalSpent += totals.total;
    customer.lastVisit = new Date().toISOString();

    // Track service card usages if service card membership
    if (purchaseMembership === '2') {
      if (!customer.serviceCardUsages) {
        customer.serviceCardUsages = [];
      }
      selectedServices.forEach(s => {
        customer.serviceCardUsages.push({
          service: s.serviceName,
          category: s.category,
          staffName: s.staffName,
          date: new Date().toISOString(),
          gender: s.gender
        });
      });
    }

    await saveData(custId, customer);

    if (shouldPrint) {
      printBill();
    }

    // Reload data
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
    showToast(shouldPrint ? 'Bill printed and data saved!' : 'Data saved successfully!');
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
    setSelectedGender('women');
    setSelectedCategory('');
    setSelectedServices([]);
    setSelectedMembership(null);
    setIsGreenCard(false);
    setAdditionalDiscount(0);
    setDiscountType('fixed');
    setPurchaseMembership(null);
    setMembershipCardNumber('');
    setMembershipDoi('');
    setMembershipExpiry('');
  };

  const filterTransactionsByDate = (txs, dateFrom, dateTo) => {
    if (!dateFrom && !dateTo) return txs;
    return txs.filter(tx => {
      const txDate = new Date(tx.date);
      if (dateFrom && dateTo) {
        return txDate >= new Date(dateFrom) && txDate <= new Date(dateTo + 'T23:59:59');
      } else if (dateFrom) {
        return txDate >= new Date(dateFrom);
      } else if (dateTo) {
        return txDate <= new Date(dateTo + 'T23:59:59');
      }
      return true;
    });
  };

  const renderDashboard = () => {
    const filteredTxs = filterTransactionsByDate(transactions, dashboardDateFrom, dashboardDateTo);
    const totalSales = filteredTxs.reduce((sum, tx) => sum + tx.totals.total, 0);
    const totalServices = filteredTxs.reduce((sum, tx) => sum + tx.services.length, 0);

    // Daily sales
    const dailySalesMap = {};
    filteredTxs.forEach(tx => {
      const date = new Date(tx.date).toLocaleDateString('en-IN');
      if (!dailySalesMap[date]) {
        dailySalesMap[date] = 0;
      }
      dailySalesMap[date] += tx.totals.total;
    });
    const dailySalesData = Object.entries(dailySalesMap)
      .map(([date, amount]) => ({ date, amount }))
      .slice(-7);

    // Service distribution
    const serviceDistribution = {};
    filteredTxs.forEach(tx => {
      tx.services.forEach(s => {
        serviceDistribution[s.serviceName] = (serviceDistribution[s.serviceName] || 0) + 1;
      });
    });
    const pieData = Object.entries(serviceDistribution)
      .map(([name, value]) => ({ name, value }))
      .slice(0, 5);

    const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f97316', '#ef4444'];

    return (
      <div className="main-content">
        <h1 className="page-title">Dashboard</h1>
        <div className="filter-bar">
          <div className="filter-group">
            <Calendar size={20} />
            <input
              type="date"
              value={dashboardDateFrom}
              onChange={(e) => setDashboardDateFrom(e.target.value)}
              className="filter-input"
            />
            <span className="filter-separator">to</span>
            <input
              type="date"
              value={dashboardDateTo}
              onChange={(e) => setDashboardDateTo(e.target.value)}
              className="filter-input"
            />
            {(dashboardDateFrom || dashboardDateTo) && (
              <button
                onClick={() => {
                  setDashboardDateFrom('');
                  setDashboardDateTo('');
                }}
                className="btn-clear-filter"
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon-wrapper">
              <DollarSign size={32} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Sales</p>
              <p className="stat-value">₹{totalSales.toFixed(2)}</p>
              <p className="stat-subtext">{filteredTxs.length} transactions</p>
            </div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon-wrapper">
              <Users size={32} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Customers</p>
              <p className="stat-value">{customers.length}</p>
              <p className="stat-subtext">Total registered</p>
            </div>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon-wrapper">
              <Scissors size={32} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Services Provided</p>
              <p className="stat-value">{totalServices}</p>
              <p className="stat-subtext">In selected period</p>
            </div>
          </div>
          <div className="stat-card orange">
            <div className="stat-icon-wrapper">
              <Award size={32} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Avg. Bill Value</p>
              <p className="stat-value">₹{filteredTxs.length > 0 ? (totalSales / filteredTxs.length).toFixed(0) : '0'}</p>
              <p className="stat-subtext">Per transaction</p>
            </div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="card chart-card">
            <h2 className="card-title">Sales Trend (Last 7 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailySalesData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="amount" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card chart-card">
            <h2 className="card-title">Popular Services</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    // <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#8b5cf6', '#f97316', '#ef4444'][index % 5]} />


                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
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
                {filteredTxs.slice(0, 10).map((tx) => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.date).toLocaleDateString('en-IN')}</td>
                    <td>{tx.customerName || 'Walk-in'}</td>
                    <td>{tx.services.length} items</td>
                    <td className="font-medium">₹{tx.totals.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTxs.length === 0 && (
              <p className="empty-state">No transactions in selected period</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBilling = () => {
    const totals = calculateTotal();
    const categories = getCategories();
    const servicesByCategory = getServicesByCategory();

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
                </div>
              </div>

              <div className="card">
                <h2 className="card-title">
                  <Scissors size={20} />
                  Add Services
                </h2>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Select Gender</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={() => setSelectedGender('women')}
                      className={`btn ${selectedGender === 'women' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1 }}
                    >
                      👩 Women
                    </button>
                    <button
                      onClick={() => setSelectedGender('men')}
                      className={`btn ${selectedGender === 'men' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1 }}
                    >
                      👨 Men
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Select Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="form-select"
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {selectedCategory && (
                  <div>
                    <label className="form-label">Services in {selectedCategory}</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                      {servicesByCategory.map((service, idx) => (
                        <button
                          key={idx}
                          onClick={() => addService(service)}
                          className="btn btn-success"
                          style={{ textAlign: 'left', justifyContent: 'space-between', padding: '0.75rem 1rem' }}
                        >
                          <span>{service.service}</span>
                          <span style={{ fontWeight: 'bold' }}>
                            ₹{isGreenCard ? service.m_price : service.r_price}
                            {isGreenCard && <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem', textDecoration: 'line-through', opacity: 0.7 }}>₹{service.r_price}</span>}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
                  <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Selected Services</h3>
                  <div className="item-list">
                    {selectedServices.map((service, index) => (
                      <div key={index} className="item-row">
                        <div style={{ flex: 1 }}>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong>{service.serviceName}</strong>
                            <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem', color: '#6b7280' }}>({service.category})</span>
                          </div>
                          <select
                            value={service.staffId}
                            onChange={(e) => updateServiceStaff(index, e.target.value)}
                            className="form-select"
                          >
                            <option value="">Select Staff</option>
                            {staff.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#374151' }}>
                            Price: <strong>₹{service.price}</strong>
                            {isGreenCard && (
                              <span style={{ marginLeft: '0.5rem', color: '#10b981' }}>
                                (Save ₹{service.r_price - service.m_price})
                              </span>
                            )}
                          </div>
                        </div>
                        <button onClick={() => removeService(index)} className="btn btn-danger">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                    {selectedServices.length === 0 && (
                      <p className="empty-state">No services added yet</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="card-title">
                  <Tag size={20} />
                  Additional Discount
                </h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Discount Type</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="form-select"
                    >
                      <option value="fixed">Fixed Amount (₹)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Discount Value</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={additionalDiscount}
                      onChange={(e) => setAdditionalDiscount(e.target.value)}
                      className="form-input"
                      placeholder={discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                    />
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="card-title">
                  <User size={20} />
                  Purchase Membership
                </h2>
                <div className="form-grid">
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Select Membership to Purchase</label>
                    <select
                      value={purchaseMembership || ''}
                      onChange={(e) => setPurchaseMembership(e.target.value || null)}
                      className="form-select"
                    >
                      <option value="">None</option>
                      {memberships.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} {m.price ? `- ₹${m.price}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  {purchaseMembership && (
                    <>
                      <div className="form-group">
                        <label className="form-label">Card Number</label>
                        <input
                          type="text"
                          value={membershipCardNumber}
                          onChange={(e) => setMembershipCardNumber(e.target.value)}
                          className="form-input"
                          placeholder="Enter card number"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Date of Issue</label>
                        <input
                          type="date"
                          value={membershipDoi}
                          onChange={(e) => setMembershipDoi(e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Expiry Date</label>
                        <input
                          type="date"
                          value={membershipExpiry}
                          onChange={(e) => setMembershipExpiry(e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="card bill-summary">
                <h2 className="card-title">Bill Summary</h2>

                <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                  <button
                    onClick={toggleGreenCard}
                    className={`btn btn-block ${isGreenCard ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ marginBottom: '0.5rem' }}
                  >
                    <Zap size={16} />
                    {isGreenCard ? '✓ Green Card Applied' : 'Apply Green Card'}
                  </button>
                  {isGreenCard && (
                    <div style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: 500, padding: '0.5rem', backgroundColor: '#f0fdf4', borderRadius: '0.375rem' }}>
                      💚 Save ₹{totals.amountSaved.toFixed(2)}
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="summary-line">
                    <span>Services Total:</span>
                    <span className="font-medium">₹{totals.servicesTotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-line subtotal">
                    <span>Subtotal:</span>
                    <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  {totals.amountSaved > 0 && (
                    <div className="summary-line" style={{ color: '#10b981' }}>
                      <span>Amount Saved:</span>
                      <span className="font-medium">₹{totals.amountSaved.toFixed(2)}</span>
                    </div>
                  )}
                  {totals.discount > 0 && (
                    <div className="summary-line discount">
                      <span>Additional Discount:</span>
                      <span className="font-medium">-₹{totals.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="summary-line total">
                    <span>Total:</span>
                    <span className="amount">₹{totals.total.toFixed(2)}</span>
                  </div>
                </div>

                {purchaseMembership && (
                  <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem', borderLeft: '4px solid #667eea' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Membership Purchase</h4>
                    {memberships.filter(m => m.id === parseInt(purchaseMembership)).map(m => (
                      <div key={m.id}>
                        <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                          <strong>{m.name}</strong>
                        </p>
                        {m.price && (
                          <p style={{ fontSize: '0.875rem', color: '#374151' }}>
                            Membership Cost: <strong>₹{m.price}</strong>
                          </p>
                        )}
                        {m.servicesNum && (
                          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                            {m.servicesNum} {m.services} × {m.timesNum} {m.times}/year
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

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
    let filteredCustomers = customers;

    if (customerSearchTerm) {
      const term = customerSearchTerm.toLowerCase();
      filteredCustomers = filteredCustomers.filter(c =>
        (c.name && c.name.toLowerCase().includes(term)) ||
        (c.phone && c.phone.includes(customerSearchTerm)) ||
        (c.dob && c.dob.includes(customerSearchTerm))
      );
    }

    return (
      <div className="main-content">
        <h1 className="page-title">Customers</h1>
        <div className="card">
          <div className="filter-bar">
            <div className="search-container">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                value={customerSearchTerm}
                onChange={(e) => setCustomerSearchTerm(e.target.value)}
                placeholder="Search customers by name, phone, or DOB..."
                className="search-input"
              />
            </div>
            {customerSearchTerm && (
              <button
                onClick={() => setCustomerSearchTerm('')}
                className="btn-clear-filter"
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>DOB</th>
                  <th>Membership</th>
                  <th>Visits</th>
                  <th>Total Spent</th>
                  <th>Last Visit</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="font-medium">{customer.name || 'N/A'}</td>
                    <td>{customer.phone || 'N/A'}</td>
                    <td>{customer.dob || 'N/A'}</td>
                    <td>{customer.membershipOwned ? customer.membershipOwned.membershipName : 'None'}</td>
                    <td>{customer.visits ? customer.visits.length : 0}</td>
                    <td className="font-medium">₹{customer.totalSpent ? customer.totalSpent.toFixed(2) : '0.00'}</td>
                    <td>{customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString('en-IN') : 'N/A'}</td>
                    <td>
                      <button
                        onClick={() => setSelectedCustomerDetail(customer)}
                        className="btn btn-primary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        View
                      </button>
                    </td>
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

  const renderCustomerDetail = () => {
    const customer = selectedCustomerDetail;
    if (!customer) return null;

    const customerTransactions = transactions.filter(t => t.customerId === customer.id);
    const serviceCardUsages = customer.serviceCardUsages || [];

    // Service usage chart data
    const serviceUsageMap = {};
    serviceCardUsages.forEach(usage => {
      serviceUsageMap[usage.service] = (serviceUsageMap[usage.service] || 0) + 1;
    });
    const serviceChartData = Object.entries(serviceUsageMap).map(([service, count]) => ({
      name: service,
      uses: count
    }));

    // Category breakdown
    const categoryMap = {};
    serviceCardUsages.forEach(usage => {
      categoryMap[usage.category] = (categoryMap[usage.category] || 0) + 1;
    });
    const categoryData = Object.entries(categoryMap).map(([category, count]) => ({
      category,
      uses: count
    }));

    // Monthly trend
    const monthlyMap = {};
    customerTransactions.forEach(tx => {
      const month = new Date(tx.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      monthlyMap[month] = (monthlyMap[month] || 0) + 1;
    });
    const monthlyData = Object.entries(monthlyMap).map(([month, visits]) => ({
      month,
      visits
    }));

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          padding: '2rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Customer Details</h1>
            <button
              onClick={() => setSelectedCustomerDetail(null)}
              className="btn btn-danger"
            >
              <X size={24} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.25rem' }}>NAME</p>
              <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>{customer.name}</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.25rem' }}>PHONE</p>
              <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>{customer.phone}</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.25rem' }}>DOB</p>
              <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>{customer.dob || 'N/A'}</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.25rem' }}>MEMBERSHIP</p>
              <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>{customer.membershipOwned ? customer.membershipOwned.membershipName : 'None'}</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.25rem' }}>TOTAL VISITS</p>
              <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>{customer.visits.length}</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.25rem' }}>TOTAL SPENT</p>
              <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>₹{customer.totalSpent.toFixed(2)}</p>
            </div>
          </div>

          {customer.serviceCardUsages && customer.serviceCardUsages.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Service Card Usage</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {serviceChartData.length > 0 && (
                  <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>Services Used</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={serviceChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="uses" fill="#667eea" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {categoryData.length > 0 && (
                  <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>Category Breakdown</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="uses"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#8b5cf6', '#f97316', '#ef4444'][index % 5]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>Usage History</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ fontSize: '0.875rem' }}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Service</th>
                        <th>Category</th>
                        <th>Staff</th>
                        <th>Gender</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceCardUsages.map((usage, idx) => (
                        <tr key={idx}>
                          <td>{new Date(usage.date).toLocaleDateString('en-IN')}</td>
                          <td>{usage.service}</td>
                          <td>{usage.category}</td>
                          <td>{usage.staffName}</td>
                          <td>{usage.gender === 'women' ? '👩' : '👨'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {monthlyData.length > 0 && (
            <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>Visit Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="visits" stroke="#667eea" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTransactions = () => {
    let filteredTransactions = transactions;

    if (transactionSearchTerm) {
      const term = transactionSearchTerm.toLowerCase();
      filteredTransactions = filteredTransactions.filter(tx =>
        (tx.customerName && tx.customerName.toLowerCase().includes(term)) ||
        (tx.phoneNumber && tx.phoneNumber.includes(transactionSearchTerm))
      );
    }

    filteredTransactions = filterTransactionsByDate(filteredTransactions, transactionDateFrom, transactionDateTo);

    return (
      <div className="main-content">
        <h1 className="page-title">Transaction History</h1>
        <div className="card">
          <div className="filter-bar">
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
            <div className="filter-group">
              <Calendar size={20} />
              <input
                type="date"
                value={transactionDateFrom}
                onChange={(e) => setTransactionDateFrom(e.target.value)}
                className="filter-input"
              />
              <span className="filter-separator">to</span>
              <input
                type="date"
                value={transactionDateTo}
                onChange={(e) => setTransactionDateTo(e.target.value)}
                className="filter-input"
              />
              {(transactionDateFrom || transactionDateTo || transactionSearchTerm) && (
                <button
                  onClick={() => {
                    setTransactionDateFrom('');
                    setTransactionDateTo('');
                    setTransactionSearchTerm('');
                  }}
                  className="btn-clear-filter"
                >
                  <X size={16} />
                  Clear All
                </button>
              )}
            </div>
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
                    <h4>Services ({tx.services.length}):</h4>
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
                </div>
                {tx.membership && (
                  <div className="mt-3" style={{ paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb' }}>
                    <p className="text-sm">
                      <span className="font-medium">Membership:</span> {tx.membership}
                    </p>
                  </div>
                )}
                {tx.totals.amountSaved > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600">
                      <span className="font-medium">Amount Saved:</span> ₹{tx.totals.amountSaved.toFixed(2)}
                    </p>
                  </div>
                )}
                {tx.totals.discount > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600">
                      <span className="font-medium">Additional Discount:</span> ₹{tx.totals.discount.toFixed(2)}
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

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <Scissors size={32} color="#ffffff" />
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
          </div>
        </div>
      </nav>

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <main>
        {currentPage === 'dashboard' && renderDashboard()}
        {currentPage === 'billing' && renderBilling()}
        {currentPage === 'customers' && renderCustomers()}
        {currentPage === 'transactions' && renderTransactions()}
      </main>

      {selectedCustomerDetail && renderCustomerDetail()}
    </div>
  );
}

export default SalonBillingSystem;