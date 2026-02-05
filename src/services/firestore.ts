import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  query, 
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { Cost, SystemSettings, Budget } from "../types";

// Collections
const COLLECTIONS = {
  COSTS: 'costs',
  SETTINGS: 'settings',
  BUDGETS: 'budgets'
};

// --- Settings ---
export const getSettings = async (): Promise<SystemSettings> => {
  const querySnapshot = await getDocs(collection(db, COLLECTIONS.SETTINGS));
  if (querySnapshot.empty) {
    return { occupancyRate: 70, workingDaysPerMonth: 22 }; 
  }
  const data = querySnapshot.docs[0].data();
  return { id: querySnapshot.docs[0].id, ...data } as SystemSettings;
};

export const saveSettings = async (settings: SystemSettings) => {
  const querySnapshot = await getDocs(collection(db, COLLECTIONS.SETTINGS));
  if (querySnapshot.empty) {
    await addDoc(collection(db, COLLECTIONS.SETTINGS), settings);
  } else {
    const docId = querySnapshot.docs[0].id;
    await updateDoc(doc(db, COLLECTIONS.SETTINGS, docId), { ...settings });
  }
};

// --- Costs (Fixed and Variable) ---
export const getCosts = async (): Promise<Cost[]> => {
  const snapshot = await getDocs(collection(db, COLLECTIONS.COSTS));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Cost));
};

export const addCost = async (cost: Cost) => {
  await addDoc(collection(db, COLLECTIONS.COSTS), cost);
};

export const deleteCost = async (id: string) => {
  await deleteDoc(doc(db, COLLECTIONS.COSTS, id));
};

// --- Budgets ---
export const getBudgets = async (): Promise<Budget[]> => {
  const q = query(collection(db, COLLECTIONS.BUDGETS));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Budget));
};

export const saveBudget = async (budget: Budget) => {
  if (budget.id) {
    const { id, ...data } = budget;
    await updateDoc(doc(db, COLLECTIONS.BUDGETS, id), data);
    return id;
  } else {
    const { id, ...data } = budget;
    const docRef = await addDoc(collection(db, COLLECTIONS.BUDGETS), {
      ...data,
      createdAt: Date.now()
    });
    return docRef.id;
  }
};

export const deleteBudget = async (id: string) => {
  await deleteDoc(doc(db, COLLECTIONS.BUDGETS, id));
};

export const getBudgetById = async (id: string): Promise<Budget | null> => {
  const docRef = doc(db, COLLECTIONS.BUDGETS, id);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() } as Budget;
  }
  return null;
};

export const updateBudgetStatus = async (id: string, status: string) => {
  await updateDoc(doc(db, COLLECTIONS.BUDGETS, id), { status });
};
