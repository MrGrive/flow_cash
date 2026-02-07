import { useState } from 'react'
import './Auth.css'

export default function Auth({ user, onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (password.length < 6) {
      setError('Пароль должен быть минимум 6 символов')
      return
    }

    setLoading(true)

    try {
      // Локальная аутентификация (для тестирования)
      const userData = { email, password }
      localStorage.setItem('currentUser', JSON.stringify(userData))
      
      setEmail('')
      setPassword('')
      onLoginSuccess()
      window.location.reload() // Перезагрузить страницу
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    window.location.reload()
  }

  // Если пользователь залогинен
  if (user) {
    return (
      <div className="auth-container logged-in">
        <div className="user-info">
          <span className="user-email">{user.email}</span>
          <button onClick={handleLogout} className="logout-btn">
            Выход
          </button>
        </div>
      </div>
    )
  }

  // Форма входа/регистрации
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>💸 Cash Flow</h1>
        <p className="auth-subtitle">Создавай денежный поток</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Пароль (минимум 6 символов)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? '⏳ Загрузка...' : (isSignUp ? '📝 Создать аккаунт' : '🔐 Войти')}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isSignUp ? 'Уже есть аккаунт? ' : 'Нет аккаунта? '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
              }}
              className="toggle-btn"
            >
              {isSignUp ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </p>
        </div>

        <div className="demo-notice">
          <p>✅ DEMO: Работает с localstorage</p>
          <p className="small">Для production добавьте Firebase конфиг</p>
        </div>
      </div>
    </div>
  )
}
