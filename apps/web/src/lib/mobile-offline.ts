export type MobileChecklist = {
  occupancyChecked?: boolean;
  addressChecked?: boolean;
  infrastructureChecked?: boolean;
  notes?: string;
};

export type MobileLocation = {
  lat: number;
  lng: number;
};

export type OfflineQueueRecord = {
  id: string;
  projectId?: string;
  parcelId: string;
  parcelLabel: string;
  checklist: MobileChecklist;
  location?: MobileLocation;
  photoBase64?: string;
  createdAt: string;
};

const DB_NAME = 'flydea_mobile_db';
const DB_VERSION = 1;
const STORE_NAME = 'ctm_queue';

const ensureBrowser = () => {
  if (typeof window === 'undefined' || !window.indexedDB) {
    throw new Error('IndexedDB indisponivel neste ambiente');
  }
};

const openDb = (): Promise<IDBDatabase> => {
  ensureBrowser();
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Falha ao abrir IndexedDB'));
  });
};

const withStore = async <T>(
  mode: IDBTransactionMode,
  runner: (store: IDBObjectStore) => Promise<T>,
): Promise<T> => {
  const db = await openDb();
  try {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    return await runner(store);
  } finally {
    db.close();
  }
};

const requestToPromise = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Erro no IndexedDB'));
  });

export async function listOfflineQueue(): Promise<OfflineQueueRecord[]> {
  return withStore('readonly', async (store) => {
    const request = store.getAll();
    const rows = await requestToPromise<OfflineQueueRecord[]>(request);
    return rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  });
}

export async function putOfflineQueueItem(item: OfflineQueueRecord): Promise<void> {
  await withStore('readwrite', async (store) => {
    await requestToPromise(store.put(item));
  });
}

export async function removeOfflineQueueItem(id: string): Promise<void> {
  await withStore('readwrite', async (store) => {
    await requestToPromise(store.delete(id));
  });
}

export async function clearOfflineQueue(): Promise<void> {
  await withStore('readwrite', async (store) => {
    await requestToPromise(store.clear());
  });
}
