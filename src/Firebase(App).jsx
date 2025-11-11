// // src/App.jsx
// import { useEffect, useState } from 'react';
// import { Route, Routes, useNavigate } from 'react-router-dom';
// import { CustomersTable } from './components/CustomersTable';
// import { RecentTransactionsTable } from './components/RecentTransactionsTable';
// import BillPage from './pages/BillPage.jsx';
// import './App.css';

// import {
//   saveBill, getBill, saveCustomer, getCustomer,
//   getAllCustomers, getRecentBills
// } from './utils/firebaseUtils.js';

// // ...other imports and functions as is!

// function SalonBillingSystem() {
//   // ...same useState as before
//   const navigate = useNavigate();

//   // Load customers/bills from Firebase
//   useEffect(() => {
//     const fetchData = async () => {
//       const custs = await getAllCustomers();
//       setCustomers(custs);
//       const txs = await getRecentBills();
//       setTransactions(txs);
//     };
//     fetchData();
//   }, []);

//   // ...all state handlers, autocomplete, etc. stay as before!

//   // --- Save Transaction/Bill to Firestore ---
//   const saveTransaction = async (shouldPrint = false) => {
//     // validation same as before...

//     const totals = calculateTotal();
//     const txId = 'tx_' + Date.now();
//     const custId = phoneNumber ? 'cust_' + phoneNumber : 'cust_' + Date.now();

//     const transaction = {
//       id: txId,
//       customerId: custId,
//       ... // all the fields as before
//     };

//     await saveBill(transaction);

//     // Save customer & membership logic
//     let customer = await getCustomer(custId);
//     customer = customer || { ...fields... };
//     // update customer as before (visits, totalSpent, etc.)
//     await saveCustomer(customer);

//     // Refresh data
//     setTransactions(await getRecentBills());
//     setCustomers(await getAllCustomers());

//     resetForm();
//     showToast('Bill saved successfully!');
//     if (shouldPrint) printBill();
//   };

//   // --- Send WhatsApp Bill (link is universal) ---
//   const sendBillToWhatsApp = async () => {
//     // ...validation

//     const totals = calculateTotal();
//     const txId = 'tx_' + Date.now();
//     const custId = phoneNumber ? 'cust_' + phoneNumber : 'cust_' + Date.now();

//     const transaction = { id: txId, customerId: custId, ... };

//     // Save to Firestore
//     await saveBill(transaction);

//     // Save/Update customer
//     let customer = await getCustomer(custId);
//     customer = customer || { ...fields... };
//     // update membership, visits, totalSpent logic...
//     await saveCustomer(customer);

//     setTransactions(await getRecentBills());
//     setCustomers(await getAllCustomers());
//     resetForm();

//     // ✅ Use universal link
//     const billPageUrl = `https://greatlookslgbilling.vercel.app/bill/${txId}`;
//     const billMessage = `Dear ${customerName},\nHere is your invoice for a total of ₹${totals.total.toFixed(2)}.\nClick here:\n${billPageUrl}\nThank you for your business!`;
//     const whatsappUrl = `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(billMessage)}`;
//     window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
//     showToast('Bill sent to WhatsApp!');
//   };

//   // ...renderBilling, renderDashboard, renderCustomers, etc. as before (update data loading for bills/customers to use Firestore instead of localStorage)
// }
