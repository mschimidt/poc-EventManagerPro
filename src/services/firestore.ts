import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  query, 
  where, 
  getDoc,
  setDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { FixedCost, SystemSettings, Budget } from "../types";

// Collections
const COLLECTIONS = {
  FIXED_COSTS: 'fixed_costs',
  SETTINGS: 'settings',
  BUDGETS: 'budgets'
};

// --- Settings ---
export const getSettings = async (): Promise<SystemSettings> => {
  const querySnapshot = await getDocs(collection(db, COLLECTIONS.SETTINGS));
  if (querySnapshot.empty) {
    // Return default if not exists
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

// --- Fixed Costs ---
export const getFixedCosts = async (): Promise<FixedCost[]> => {
  const snapshot = await getDocs(collection(db, COLLECTIONS.FIXED_COSTS));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FixedCost));
};

export const addFixedCost = async (cost: FixedCost) => {
  await addDoc(collection(db, COLLECTIONS.FIXED_COSTS), cost);
};

export const deleteFixedCost = async (id: string) => {
  await deleteDoc(doc(db, COLLECTIONS.FIXED_COSTS, id));
};

// --- Budgets ---
export const getBudgets = async (): Promise<Budget[]> => {
  const q = query(collection(db, COLLECTIONS.BUDGETS)); // Can add ordering here
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Budget));
};

export const saveBudget = async (budget: Budget) => {
  if (budget.id) {
    // Update
    const { id, ...data } = budget;
    await updateDoc(doc(db, COLLECTIONS.BUDGETS, id), data);
    return id;
  } else {
    // Create
    // IMPORTANTE: Removemos o 'id' (que é undefined) do objeto antes de salvar
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
