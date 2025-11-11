// src/utils/firebaseUtils.js
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebase';

// ===== TRANSACTIONS =====
export const saveBill = async (transaction) => {
  try {
    await setDoc(doc(db, 'transactions', transaction.id), transaction);
    return true;
  } catch (error) {
    console.error('Error saving bill:', error);
    return false;
  }
};

export const getBill = async (transactionId) => {
  try {
    const docSnap = await getDoc(doc(db, 'transactions', transactionId));
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error('Error getting bill:', error);
    return null;
  }
};

export const getRecentBills = async (limitCount = 500) => {
  try {
    const q = query(
      collection(db, 'transactions'),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error getting recent bills:', error);
    return [];
  }
};

export const deleteBill = async (transactionId) => {
  try {
    await deleteDoc(doc(db, 'transactions', transactionId));
    return true;
  } catch (error) {
    console.error('Error deleting bill:', error);
    return false;
  }
};

// ===== CUSTOMERS =====
export const saveCustomer = async (customer) => {
  try {
    await setDoc(doc(db, 'customers', customer.id), customer);
    return true;
  } catch (error) {
    console.error('Error saving customer:', error);
    return false;
  }
};

export const getCustomer = async (customerId) => {
  try {
    const docSnap = await getDoc(doc(db, 'customers', customerId));
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error('Error getting customer:', error);
    return null;
  }
};

export const getAllCustomers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'customers'));
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error getting customers:', error);
    return [];
  }
};

export const deleteCustomer = async (customerId) => {
  try {
    await deleteDoc(doc(db, 'customers', customerId));
    return true;
  } catch (error) {
    console.error('Error deleting customer:', error);
    return false;
  }
};

// ===== STAFF =====
export const initializeStaff = async () => {
  try {
    const docSnap = await getDoc(doc(db, 'config', 'staff'));
    if (!docSnap.exists()) {
      const staffData = [
        { id: 1, name: 'Vicky' },
        { id: 2, name: 'Rakhi' },
        { id: 3, name: 'Akash' },
        { id: 4, name: 'Komal' },
        { id: 5, name: 'Babul' },
        { id: 6, name: 'Nishu' },
        { id: 7, name: 'Nabin' },
        { id: 8, name: 'Rushan' }
      ];
      await setDoc(doc(db, 'config', 'staff'), { data: staffData });
      return staffData;
    }
    return docSnap.data().data;
  } catch (error) {
    console.error('Error initializing staff:', error);
    return [];
  }
};

export const getStaff = async () => {
  try {
    const docSnap = await getDoc(doc(db, 'config', 'staff'));
    return docSnap.exists() ? docSnap.data().data : [];
  } catch (error) {
    console.error('Error getting staff:', error);
    return [];
  }
};

// ===== MEMBERSHIPS =====
export const initializeMemberships = async () => {
  try {
    const docSnap = await getDoc(doc(db, 'config', 'memberships'));
    if (!docSnap.exists()) {
      const membershipData = [
        { id: 1, name: 'Green Card', discount: 10, price: 3000, validityMonths: 12 },
        { id: 2, name: 'Service Card', servicesNum: 6, services: 'services', timesNum: 12, times: 'times', price: 5000 }
      ];
      await setDoc(doc(db, 'config', 'memberships'), { data: membershipData });
      return membershipData;
    }
    return docSnap.data().data;
  } catch (error) {
    console.error('Error initializing memberships:', error);
    return [];
  }
};

export const getMemberships = async () => {
  try {
    const docSnap = await getDoc(doc(db, 'config', 'memberships'));
    return docSnap.exists() ? docSnap.data().data : [];
  } catch (error) {
    console.error('Error getting memberships:', error);
    return [];
  }
};