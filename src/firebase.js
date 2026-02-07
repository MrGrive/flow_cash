// ⚠️ DEMO MODE - Firebase отключен для тестирования
// Для production замените на реальный Firebase конфиг

export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback) => {
    callback(null)
    return () => {}
  }
}

export const db = null

// Создаем простой mock для тестирования
export const mockAuth = {
  register: (email, password) => Promise.resolve({ uid: email }),
  login: (email, password) => Promise.resolve({ uid: email }),
  logout: () => Promise.resolve()
}

