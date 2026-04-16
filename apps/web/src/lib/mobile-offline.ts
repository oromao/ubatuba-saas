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

export type OfflineSyncHistoryEntry = {
  at: string;
  status: "PENDENTE" | "SINCRONIZADO" | "ERRO" | "CONFLITO";
  message: string;
  source: "device" | "sync" | "system";
};

export type OfflineQueueRecord = {
  id: string;
  projectId?: string;
  clientId: string;
  parcelId: string;
  parcelLabel: string;
  parcelUpdatedAt?: string;
  checklist: MobileChecklist;
  location?: MobileLocation;
  photoBase64?: string;
  evidences?: Array<{
    clientId: string;
    fileName?: string;
    mimeType?: string;
    base64: string;
    checksum?: string;
    capturedAt?: string;
    size?: number;
    status: "PENDENTE" | "SINCRONIZADO" | "ERRO";
    retries: number;
    lastError?: string;
    lastAttemptAt?: string;
  }>;
  createdAt: string;
  status: "PENDENTE" | "SINCRONIZADO" | "ERRO";
  retries: number;
  lastError?: string;
  lastAttemptAt?: string;
  syncHistory?: OfflineSyncHistoryEntry[];
};

const DB_NAME = 'flydea_mobile_db';
const DB_VERSION = 2;
const STORE_NAME = 'ctm_queue';

const ensureBrowser = () => {
  if (typeof window === 'undefined' || !window.indexedDB) {
    throw new Error('IndexedDB indisponivel neste ambiente');
  }
};

const ensureStore = (db: IDBDatabase) => {
  if (!db.objectStoreNames.contains(STORE_NAME)) {
    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
  }
};

const openDb = (): Promise<IDBDatabase> => {
  ensureBrowser();
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      ensureStore(request.result);
    };

    request.onsuccess = () => {
      ensureStore(request.result);
      resolve(request.result);
    };
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

export async function markOfflineQueueStatus(
  id: string,
  patch: Partial<Pick<OfflineQueueRecord, 'status' | 'retries' | 'lastError' | 'lastAttemptAt' | 'parcelUpdatedAt'>>,
): Promise<void> {
  await withStore('readwrite', async (store) => {
    const current = await requestToPromise<OfflineQueueRecord | undefined>(store.get(id));
    if (!current) return;
    await requestToPromise(
      store.put({
        ...current,
        ...patch,
      }),
    );
  });
}

export async function appendOfflineQueueHistory(id: string, entry: OfflineSyncHistoryEntry): Promise<void> {
  await withStore('readwrite', async (store) => {
    const current = await requestToPromise<OfflineQueueRecord | undefined>(store.get(id));
    if (!current) return;
    await requestToPromise(
      store.put({
        ...current,
        syncHistory: [entry, ...(current.syncHistory ?? [])].slice(0, 12),
      }),
    );
  });
}

export async function markOfflineEvidenceStatus(
  queueId: string,
  evidenceId: string,
  patch: Partial<Pick<NonNullable<OfflineQueueRecord['evidences']>[number], 'status' | 'retries' | 'lastError' | 'lastAttemptAt'>>,
): Promise<void> {
  await withStore('readwrite', async (store) => {
    const current = await requestToPromise<OfflineQueueRecord | undefined>(store.get(queueId));
    if (!current) return;
    const evidences = (current.evidences ?? []).map((item) => (item.clientId === evidenceId ? { ...item, ...patch } : item));
    await requestToPromise(store.put({ ...current, evidences }));
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
