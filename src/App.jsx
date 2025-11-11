import { Award, Calendar, DollarSign, Home, MessageCircle, Printer, Save, Scissors, Search, Tag, Trash2, TrendingUp, User, Users, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import './App.css';
import { CustomersTable } from './components/CustomersTable';
import { RecentTransactionsTable } from './components/RecentTransactionsTable';
import BillPage from './pages/BillPage.jsx';
import { getAllCustomers, getCustomer, getRecentBills, initializeMemberships, initializeStaff, saveBill, saveCustomer } from './utils/firebaseUtils';

// Load service catalog from data.json
let serviceCatalog = { women: [], men: [] };

const loadServiceCatalog = async () => {
  try {
    const response = await fetch('/data.json');
    const data = await response.json();
    serviceCatalog = data;
    return data;
  } catch (error) {
    console.error('Error loading services:', error);
    return { women: [], men: [] };
  }
};

// Phone number validation
const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

// Service category priority ordering
const categoryOrder = {
  'Haircut': 1,
  'Beard': 2,
  'Shave': 3,
  'Wax': 4,
  'Threading': 5,
  'Facial': 6,
  'Massage': 7
};

const sortCategories = (categories) => {
  return categories.sort((a, b) => {
    const orderA = categoryOrder[a] || 999;
    const orderB = categoryOrder[b] || 999;
    if (orderA !== orderB) return orderA - orderB;
    return a.localeCompare(b);
  });
};

function SalonBillingSystem() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [staff, setStaff] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Autocomplete
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  // Payment Mode state
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [upiMethod, setUpiMethod] = useState("");
  const [otherUpiNote, setOtherUpiNote] = useState("");

  // Membership purchase state
  const [purchaseMembership, setPurchaseMembership] = useState(null);
  const [membershipCardNumber, setMembershipCardNumber] = useState('');
  const [membershipDoi, setMembershipDoi] = useState(new Date().toISOString().split('T')[0]);
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

  // Initial data load from Firebase
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await loadServiceCatalog();
        
        // Initialize config data (staff, memberships) in Firebase
        const loadedStaff = await initializeStaff();
        const loadedMemberships = await initializeMemberships();
        
        setStaff(loadedStaff);
        setMemberships(loadedMemberships);

        // Load transactions from Firebase
        const txData = await getRecentBills();
        setTransactions(txData.sort((a, b) => new Date(b.date) - new Date(a.date)));

        // Load customers from Firebase
        const custData = await getAllCustomers();
        setCustomers(custData);
      } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading data from Firebase', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle customer name autocomplete
  const handleCustomerNameChange = (value) => {
    setCustomerName(value);

    if (value.length > 0) {
      const filtered = customers.filter(c =>
        c.name && c.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCustomers(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredCustomers([]);
    }
  };

  // Auto-fill customer data
  const selectCustomer = (customer) => {
    setCustomerName(customer.name);
    setPhoneNumber(customer.phone || '');
    setDob(customer.dob || '');
    setShowSuggestions(false);

    // Check if customer has valid Green Card
    if (customer.membershipOwned && customer.membershipOwned.membershipName === 'Green Card') {
      const expiryDate = customer.membershipOwned.expiryDate;
      if (expiryDate) {
        const today = new Date();
        const expiry = new Date(expiryDate);
        if (expiry >= today) {
          setIsGreenCard(true);
          const updated = selectedServices.map(s => ({
            ...s,
            price: s.m_price
          }));
          setSelectedServices(updated);
          showToast('Green Card applied automatically!', 'success');
        } else {
          showToast('Customer has expired Green Card', 'info');
        }
      } else {
        setIsGreenCard(true);
        const updated = selectedServices.map(s => ({
          ...s,
          price: s.m_price
        }));
        setSelectedServices(updated);
        showToast('Green Card applied automatically!', 'success');
      }
    }
  };

  const getCategories = () => {
    const services = selectedGender === 'women' ? serviceCatalog.women : serviceCatalog.men;
    const categories = [...new Set(services.map(s => s.category))];
    return sortCategories(categories);
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
    const updated = selectedServices.map(s => ({
      ...s,
      price: newIsGreenCard ? s.m_price : s.r_price
    }));
    setSelectedServices(updated);
  };

  const calculateTotal = () => {
    const servicesTotal = selectedServices.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);

    let membershipCost = 0;
    if (purchaseMembership) {
      const membership = memberships.find(m => m.id === parseInt(purchaseMembership));
      if (membership && membership.price) {
        membershipCost = membership.price;
      }
    }

    const subtotal = servicesTotal + membershipCost;
    let discount = 0;
    const discountValue = parseFloat(additionalDiscount) || 0;

    if (discountType === 'percentage') {
      discount = (subtotal * discountValue / 100);
    } else {
      discount = discountValue;
    }

    let amountSaved = 0;
    if (isGreenCard) {
      amountSaved = selectedServices.reduce((sum, s) => sum + (s.r_price - s.m_price), 0);
    }

    return {
      servicesTotal,
      membershipCost,
      subtotal,
      discount,
      amountSaved,
      total: subtotal - discount
    };
  };

  const generateBillContent = () => {
    const totals = calculateTotal();
    const billDate = new Date().toLocaleString('en-IN');

    let content = '=======================\n';
    content += '    GREAT LOOK PROFESSIONALS\n';
    content += '          UNISEX STUDIO \n';
    content += '=======================\n';
    content += 'Date: ' + billDate + '\n\n';
    content += 'Customer Name: ' + (customerName || 'Walk-in Customer') + '\n';

    if (isGreenCard) {
      content += 'Membership: Green Card\n';
    }

    content += '\n-----------------------------------------\n';
    content += 'SERVICES                              Amount \n';
    content += '-----------------------------------------\n';

    selectedServices.forEach(s => {
      content += s.serviceName + '                   Rs. ' + s.price + '\n';
    });

    if (totals.membershipCost > 0) {
      const membership = memberships.find(m => m.id === parseInt(purchaseMembership));
      content += membership.name + ' Purchase           Rs. ' + totals.membershipCost + '\n';
    }

    content += '------------------------------------------\n';
    if (totals.amountSaved > 0) {
      content += 'Amount Saved:                      Rs.' + totals.amountSaved.toFixed(2) + '\n';
    }
    content += 'Subtotal:                                Rs.' + totals.subtotal.toFixed(2) + '\n';
    if (totals.discount > 0) {
      content += 'Discount:                                   Rs.' + totals.discount.toFixed(2) + '\n';
    }
    content += '=========================\n';
    content += 'TOTAL:                                   Rs.' + totals.total.toFixed(2) + '\n';
    content += '=========================\n';
    content += '     Thank you for visiting!✨ \n';
    content += '      Please come again!\n';

    return content;
  };

  const saveTransaction = async (shouldPrint = false) => {
    if (!customerName && !phoneNumber) {
      showToast('Please enter customer name or phone number', 'error');
      return;
    }

    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      showToast('Please enter a valid 10-digit phone number', 'error');
      return;
    }

    if (selectedServices.length === 0) {
      showToast('Please add at least one service', 'error');
      return;
    }

    try {
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
        paymentMode: paymentMode,
        upiMethod: upiMethod,
        upiOtherText: otherUpiNote,
        services: selectedServices,
        membership: isGreenCard ? 'Green Card' : null,
        purchasedMembership: purchaseMembership
          ? memberships.find(m => m.id === parseInt(purchaseMembership))
          : null,
        totals,
        total: totals.total,
        printed: shouldPrint
      };

      // ✅ SAVE TO FIREBASE
      await saveBill(transaction);

      let customer = await getCustomer(custId);
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

      if (isGreenCard && !customer.membershipOwned) {
        customer.membershipOwned = {
          membershipId: 1,
          membershipName: 'Green Card'
        };
      }

      // Handle membership purchase
      if (purchaseMembership) {
        const membership = memberships.find(m => m.id === parseInt(purchaseMembership));
        if (membership) {
          if (membership.name === 'Green Card') {
            const expiryDate = membershipExpiry || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
            customer.membershipOwned = {
              membershipId: membership.id,
              membershipName: membership.name,
              cardNumber: membershipCardNumber,
              dateOfIssue: membershipDoi,
              expiryDate: expiryDate
            };
          }
        }
      }

      customer.visits.push(txId);
      customer.totalSpent += totals.total;
      customer.lastVisit = new Date().toISOString();

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

      // ✅ SAVE CUSTOMER TO FIREBASE
      await saveCustomer(customer);

      if (shouldPrint) {
        printBill();
      }

      // Refresh data from Firebase
      const updatedTxs = await getRecentBills();
      setTransactions(updatedTxs.sort((a, b) => new Date(b.date) - new Date(a.date)));

      const updatedCustomers = await getAllCustomers();
      setCustomers(updatedCustomers);

      resetForm();
      showToast(shouldPrint ? 'Bill printed and saved to Firebase!' : 'Data saved to Firebase!');
    } catch (error) {
      console.error('Error saving transaction:', error);
      showToast('Error saving transaction', 'error');
    }
  };

  const printBill = () => {
    const billContent = generateBillContent();
    const printWindow = window.open('', '_blank', 'width=302,height=600');
    printWindow.document.write('<html><head><title>Print Bill</title><style>@media print {@page {size: 58mm auto;margin: 0;}}body {width: 58mm;margin: 0;padding: 2mm;font-family: "Courier New", monospace;font-size: 10px;line-height: 1.3;}pre {margin: 0;white-space: pre-wrap;word-wrap: break-word;}</style></head><body><pre>' + billContent + '</pre><script>window.onload = function() {window.print();setTimeout(function() { window.close(); }, 100);};</script></body></html>');
    printWindow.document.close();
  };

  const sendBillToWhatsApp = async () => {
    if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
      showToast('Please enter a valid 10-digit phone number', 'error');
      return;
    }

    if (selectedServices.length === 0) {
      showToast('Please add at least one service', 'error');
      return;
    }

    try {
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
        paymentMode,
        upiMethod,
        upiOtherText: otherUpiNote,
        services: selectedServices,
        membership: isGreenCard ? 'Green Card' : null,
        purchasedMembership: purchaseMembership
          ? memberships.find(m => m.id === parseInt(purchaseMembership))
          : null,
        totals,
        total: totals.total,
        printed: false
      };

      // ✅ SAVE BILL TO FIREBASE
      await saveBill(transaction);

      let customer = await getCustomer(custId);
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

      if (isGreenCard && !customer.membershipOwned) {
        customer.membershipOwned = {
          membershipId: 1,
          membershipName: 'Green Card'
        };
      }

      if (purchaseMembership) {
        const membership = memberships.find(m => m.id === parseInt(purchaseMembership));
        if (membership) {
          if (membership.name === 'Green Card') {
            const expiryDate = membershipExpiry || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
            customer.membershipOwned = {
              membershipId: membership.id,
              membershipName: membership.name,
              cardNumber: membershipCardNumber,
              dateOfIssue: membershipDoi,
              expiryDate: expiryDate
            };
          }
        }
      }

      customer.visits.push(txId);
      customer.totalSpent += totals.total;
      customer.lastVisit = new Date().toISOString();

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

      // ✅ SAVE CUSTOMER TO FIREBASE
      await saveCustomer(customer);

      // ✅ PRODUCTION DOMAIN - Bill will work anywhere
      const baseURL = 'https://greatlookslgbilling.vercel.app';
      const billPageUrl = `${baseURL}/bill/${txId}`;

      // WhatsApp message with clickable link
      const billMessage = `Dear ${customerName},\n\nHere is your invoice from *GREAT LOOK Professional Unisex Studio* for a total of *₹${totals.total.toFixed(2)}*.\n\nTo view your bill in detail, click here:\n${billPageUrl}\n\nThank you for your business! 🙏`;

      const whatsappNumber = '91' + phoneNumber;
      const encodedMessage = encodeURIComponent(billMessage);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      // Refresh data from Firebase
      const updatedTxs = await getRecentBills();
      setTransactions(updatedTxs.sort((a, b) => new Date(b.date) - new Date(a.date)));

      const updatedCustomers = await getAllCustomers();
      setCustomers(updatedCustomers);

      resetForm();
      showToast('Bill link sent to WhatsApp!', 'success');
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      showToast('Error sending bill to WhatsApp', 'error');
    }
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
    setMembershipDoi(new Date().toISOString().split('T')[0]);
    setMembershipExpiry('');
    setPaymentMode('Cash');
    setUpiMethod('');
    setOtherUpiNote('');
    setShowSuggestions(false);
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
    const totalSales = filteredTxs.reduce((sum, tx) => sum + (tx.totals?.total || tx.total || 0), 0);
    const totalServices = filteredTxs.reduce((sum, tx) => sum + tx.services.length, 0);

    const dailySalesMap = {};
    filteredTxs.forEach(tx => {
      const date = new Date(tx.date).toLocaleDateString('en-IN');
      if (!dailySalesMap[date]) {
        dailySalesMap[date] = 0;
      }
      dailySalesMap[date] += (tx.totals?.total || tx.total || 0);
    });
    const dailySalesData = Object.entries(dailySalesMap)
      .map(([date, amount]) => ({ date, amount }))
      .slice(-7);

    const serviceDistribution = {};
    filteredTxs.forEach(tx => {
      tx.services.forEach(s => {
        serviceDistribution[s.serviceName] = (serviceDistribution[s.serviceName] || 0) + 1;
      });
    });
    const pieData = Object.entries(serviceDistribution)
      .map(([name, value]) => ({ name, value }))
      .slice(0, 5);

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
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
          <RecentTransactionsTable transactions={filteredTxs.slice(0, 50)} />
        </div>
      </div>
    );
  };

  const renderBilling = () => {
    const totals = calculateTotal();
    const categories = getCategories();
    const servicesByCategory = getServicesByCategory();

    if (loading) {
      return (
        <div className="main-content">
          <h1 className="page-title">Loading...</h1>
          <p>Please wait while we load your data from Firebase...</p>
        </div>
      );
    }

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
                  <div className="form-group" style={{ position: 'relative' }}>
                    <label className="form-label">Customer Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => handleCustomerNameChange(e.target.value)}
                      onFocus={() => customerName && filteredCustomers.length > 0 && setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className="form-input"
                      placeholder="Enter name"
                      autoComplete="off"
                    />
                    {showSuggestions && filteredCustomers.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        marginTop: '0.25rem',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        zIndex: 1000,
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}>
                        {filteredCustomers.map((cust, idx) => (
                          <div
                            key={idx}
                            onMouseDown={() => selectCustomer(cust)}
                            style={{
                              padding: '0.75rem',
                              cursor: 'pointer',
                              borderBottom: idx < filteredCustomers.length - 1 ? '1px solid #e5e7eb' : 'none'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                          >
                            <div style={{ fontWeight: 600 }}>{cust.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                              {cust.phone} {cust.membershipOwned && `• ${cust.membershipOwned.membershipName}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="form-input"
                      placeholder="Enter 10-digit phone"
                      maxLength="10"
                    />
                    {phoneNumber && !validatePhoneNumber(phoneNumber) && (
                      <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                        ⚠️ Please enter a valid 10-digit phone number
                      </p>
                    )}
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
                          disabled={true}
                          className="form-input"
                          style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                        />
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                          Automatically set to today's date
                        </p>
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
              <div className="card">
                <h2 className="card-title">
                  Payment Mode
                </h2>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Select Payment Mode</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="form-select"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>

                  {paymentMode === "UPI" && (
                    <>
                      <div className="form-group">
                        <label className="form-label">Select UPI Method</label>
                        <select
                          value={upiMethod}
                          onChange={(e) => setUpiMethod(e.target.value)}
                          className="form-select"
                        >
                          <option value="">-- Select --</option>
                          <option value="PhonePe">PhonePe</option>
                          <option value="Google Pay">Google Pay</option>
                          <option value="Paytm">Paytm</option>
                          <option value="BHIM UPI">BHIM UPI</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {upiMethod === "Other" && (
                        <div className="form-group">
                          <label className="form-label">Enter UPI Method</label>
                          <input
                            type="text"
                            value={otherUpiNote}
                            onChange={(e) => setOtherUpiNote(e.target.value)}
                            className="form-input"
                            placeholder="Enter payment details"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

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
                  {totals.membershipCost > 0 && (
                    <div className="summary-line" style={{ color: '#8b5cf6' }}>
                      <span>Membership Purchase:</span>
                      <span className="font-medium">₹{totals.membershipCost.toFixed(2)}</span>
                    </div>
                  )}
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
                  <div style={{
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.5rem'
                  }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Membership Purchased
                    </h4>

                    {memberships
                      .filter(m => m.id === parseInt(purchaseMembership))
                      .map(m => (
                        <div key={m.id}>
                          <strong>{m.name}</strong>
                          {m.price && (
                            <p style={{ marginTop: '0.25rem' }}>
                              Amount: <strong>₹{m.price}</strong>
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
                    onClick={sendBillToWhatsApp}
                    className="btn btn-primary btn-block"
                    style={{ backgroundColor: '#25D366' }}
                  >
                    <MessageCircle size={20} />
                    Send Bill to WhatsApp
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
    return (
      <div className="main-content">
        <h1 className="page-title">Customers</h1>
        <div className="card">
          <CustomersTable customers={customers} onViewDetail={setSelectedCustomerDetail} />
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
                    <p className="transaction-total">₹{(tx.totals?.total || tx.total || 0).toFixed(2)}</p>
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
                    )}</div>
                </div>
                {tx.membership && (
                  <div className="mt-3" style={{ paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb' }}>
                    <p className="text-sm">
                      <span className="font-medium">Membership:</span> {tx.membership}
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
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<SalonBillingSystem />} />
      <Route path="/bill/:transactionId" element={<BillPage />} />
    </Routes>
  );
}

export default App;