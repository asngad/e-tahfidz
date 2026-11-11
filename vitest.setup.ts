import '@testing-library/jest-dom/vitest';

// jsdom tidak menyediakan matchMedia; beberapa komponen UI memakainya.
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// jsdom tidak menyediakan clipboard; diperlukan untuk tombol salin kode.
if (!navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    writable: true,
    value: {
      writeText: () => Promise.resolve(),
    },
  });
}

// Beberapa kombinasi Node/jsdom tidak mengekspos localStorage ke global.
// Sediakan implementasi in-memory agar test yang menyimpan sesi tetap jalan.
function createMemoryStorage(): Storage {
  let data: Record<string, string> = {};
  return {
    get length() {
      return Object.keys(data).length;
    },
    clear() {
      data = {};
    },
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    key(index: number) {
      return Object.keys(data)[index] ?? null;
    },
    removeItem(key: string) {
      delete data[key];
    },
    setItem(key: string, value: string) {
      data[key] = String(value);
    },
  } as Storage;
}

function ensureLocalStorage(): void {
  let available: boolean;
  try {
    available = typeof localStorage !== 'undefined' && localStorage !== null;
    if (available) {
      localStorage.setItem('__probe__', '1');
      localStorage.removeItem('__probe__');
    }
  } catch {
    available = false;
  }

  if (available) return;

  const storage = createMemoryStorage();
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    writable: true,
    value: storage,
  });
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value: storage,
  });
}

ensureLocalStorage();
