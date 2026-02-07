import { db } from "../firebase";
import { Cost, SystemSettings, Budget, DefaultItem } from "../types";

// Collections
const COLLECTIONS = {
  COSTS: 'costs',
  SETTINGS: 'settings',
  BUDGETS: 'budgets',
  DEFAULT_ITEMS: 'default_items'
};

// --- Settings ---
export const getSettings = async (): Promise<SystemSettings> => {
  // FIX: Using v8 syntax to get collection and documents.
  const querySnapshot = await db.collection(COLLECTIONS.SETTINGS).get();
  if (querySnapshot.empty) {
    return { occupancyRate: 70, workingDaysPerMonth: 22 }; 
  }
  const data = querySnapshot.docs[0].data();
  return { id: querySnapshot.docs[0].id, ...data } as SystemSettings;
};

export const saveSettings = async (settings: SystemSettings) => {
  // FIX: Using v8 syntax for Firestore operations.
  const collectionRef = db.collection(COLLECTIONS.SETTINGS);
  const querySnapshot = await collectionRef.get();
  const { id, ...dataToSave } = settings;
  if (querySnapshot.empty) {
    // FIX: Using v8 `add` method.
    await collectionRef.add(dataToSave);
  } else {
    const docId = querySnapshot.docs[0].id;
    // FIX: Using v8 `doc` and `update` methods.
    await collectionRef.doc(docId).update(dataToSave);
  }
};

// --- Costs (Fixed and Variable) ---
export const getCosts = async (): Promise<Cost[]> => {
  // FIX: Using v8 `get` method on a collection.
  const snapshot = await db.collection(COLLECTIONS.COSTS).get();
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Cost));
};

export const addCost = async (cost: Cost) => {
  const { id, ...data } = cost;
  // FIX: Using v8 `add` method.
  await db.collection(COLLECTIONS.COSTS).add(data);
};

export const deleteCost = async (id: string) => {
  // FIX: Using v8 `doc` and `delete` methods.
  await db.collection(COLLECTIONS.COSTS).doc(id).delete();
};

// --- Default Items (Itens Padrão) ---
export const getDefaultItems = async (): Promise<DefaultItem[]> => {
  // FIX: Using v8 `get` method on a collection.
  const snapshot = await db.collection(COLLECTIONS.DEFAULT_ITEMS).get();
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as DefaultItem));
};

export const addDefaultItem = async (item: DefaultItem) => {
  const { id, ...data } = item;
  // FIX: Using v8 `add` method.
  await db.collection(COLLECTIONS.DEFAULT_ITEMS).add(data);
};

export const deleteDefaultItem = async (id: string) => {
  // FIX: Using v8 `doc` and `delete` methods.
  await db.collection(COLLECTIONS.DEFAULT_ITEMS).doc(id).delete();
};

// --- Budgets ---
export const getBudgets = async (): Promise<Budget[]> => {
  // FIX: Using v8 `get` method on a collection.
  const q = db.collection(COLLECTIONS.BUDGETS);
  const snapshot = await q.get();
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Budget));
};

export const saveBudget = async (budget: Budget) => {
  const collectionRef = db.collection(COLLECTIONS.BUDGETS);
  if (budget.id) {
    const { id, ...data } = budget;
    // FIX: Using v8 `doc` and `update` methods.
    await collectionRef.doc(id).update(data);
    return id;
  } else {
    const { id, ...data } = budget;
    // FIX: Using v8 `add` method.
    const docRef = await collectionRef.add({
      ...data,
      createdAt: Date.now()
    });
    return docRef.id;
  }
};

export const deleteBudget = async (id: string) => {
  // FIX: Using v8 `doc` and `delete` methods.
  await db.collection(COLLECTIONS.BUDGETS).doc(id).delete();
};

export const getBudgetById = async (id: string): Promise<Budget | null> => {
  // FIX: Using v8 `doc` and `get` methods.
  const docRef = db.collection(COLLECTIONS.BUDGETS).doc(id);
  const snap = await docRef.get();
  // FIX: `exists` is a property in v8, not a method.
  if (snap.exists) {
    return { id: snap.id, ...snap.data() } as Budget;
  }
  return null;
};

export const updateBudgetStatus = async (id: string, status: string) => {
  // FIX: Using v8 `doc` and `update` methods.
  await db.collection(COLLECTIONS.BUDGETS).doc(id).update({ status });
};
