import { useState, useEffect } from 'react'
import Auth from './components/Auth'
import './App.css'

const BUILDINGS = {
  cursor: { name: 'Курсор', baseCost: 15, baseIncome: 0.1, emoji: '👆' },
  worker: { name: 'Рабочий', baseCost: 100, baseIncome: 1, emoji: '👷' },
  factory: { name: 'Завод', baseCost: 1000, baseIncome: 10, emoji: '🏭' },
  robot: { name: 'Робот', baseCost: 10000, baseIncome: 100, emoji: '🤖' },
  ai: { name: 'ИИ', baseCost: 100000, baseIncome: 1000, emoji: '🧠' },
  spaceship: { name: 'Космический корабль', baseCost: 1000000, baseIncome: 10000, emoji: '🚀' },
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [money, setMoney] = useState(0)
  const [buildings, setBuildings] = useState({
    cursor: 0, worker: 0, factory: 0, robot: 0, ai: 0, spaceship: 0
  })
  const [clickPower, setClickPower] = useState(1)
  const [tab, setTab] = useState('game')
  const [syncStatus, setSyncStatus] = useState('синхронизировано')
  const [showProfile, setShowProfile] = useState(false)
  const [profileTab, setProfileTab] = useState('profile')
  const [playerName, setPlayerName] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [topPlayers, setTopPlayers] = useState([])
  const [language, setLanguage] = useState('ru')
  const [showSettings, setShowSettings] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  // Проверка пользователя при загрузке
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      loadGameData(JSON.parse(savedUser).email)
    }
    setLoading(false)
  }, [])

  // Загрузка данных игры
  const loadGameData = (email) => {
    const saved = localStorage.getItem(`game_${email}`)
    if (saved) {
      const data = JSON.parse(saved)
      setMoney(data.money || 0)
      setBuildings(data.buildings || buildings)
      setClickPower(data.clickPower || 1)
      setPlayerName(data.playerName || '')
    }
    // Загружаем топ игроков
    updateTopPlayers()
  }

  // Получение топа игроков
  const updateTopPlayers = () => {
    const allUsers = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('game_')) {
        const data = JSON.parse(localStorage.getItem(key))
        const email = key.replace('game_', '')
        allUsers.push({
          email,
          name: data.playerName || 'Неизвестный',
          money: data.money || 0
        })
      }
    }
    setTopPlayers(allUsers.sort((a, b) => b.money - a.money).slice(0, 10))
  }

  // Сохранение данных игры
  const saveGameData = () => {
    if (!user) return
    
    setSyncStatus('сохраняю...')
    const gameData = {
      money,
      buildings,
      clickPower,
      playerName
    }
    
    localStorage.setItem(`game_${user.email}`, JSON.stringify(gameData))
    setSyncStatus('синхронизировано')
    updateTopPlayers()
  }

  // Обновление имени игрока
  const updatePlayerName = (newName) => {
    setPlayerName(newName)
    setSyncStatus('сохраняю...')
    const gameData = {
      money,
      buildings,
      clickPower,
      playerName: newName
    }
    localStorage.setItem(`game_${user.email}`, JSON.stringify(gameData))
    setSyncStatus('синхронизировано')
    setEditingName(false)
    updateTopPlayers()
  }

  // Автосохранение каждые 5 секунд
  useEffect(() => {
    if (!user) return
    
    const saveInterval = setInterval(() => {
      saveGameData()
    }, 5000)
    
    return () => clearInterval(saveInterval)
  }, [user, money, buildings, clickPower])

  // Автосохранение при покупке (с debounce 300ms)
  useEffect(() => {
    if (!user) return
    
    const debounceTimer = setTimeout(() => {
      saveGameData()
    }, 300)
    
    return () => clearTimeout(debounceTimer)
  }, [money, buildings, clickPower])

  // Пассивный доход
  useEffect(() => {
    const interval = setInterval(() => {
      let income = 0
      Object.entries(buildings).forEach(([key, count]) => {
        if (BUILDINGS[key]) {
          income += BUILDINGS[key].baseIncome * count
        }
      })
      if (income > 0) {
        setMoney(prev => prev + income)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [buildings])

  const handleClick = () => {
    setMoney(prev => prev + clickPower)
  }

  const getCost = (building, count) => {
    return BUILDINGS[building].baseCost * Math.pow(1.15, count)
  }

  const buyBuilding = (building) => {
    const cost = getCost(building, buildings[building])
    if (money >= cost) {
      setMoney(prev => prev - cost)
      setBuildings(prev => ({ ...prev, [building]: prev[building] + 1 }))
      // Сохраняем данные сразу после покупки
      setSyncStatus('сохраняю...')
    }
  }

  const buyClickUpgrade = () => {
    const cost = 1000 * Math.pow(1.1, clickPower - 1)
    if (money >= cost) {
      setMoney(prev => prev - cost)
      setClickPower(prev => prev + 1)
      // Сохраняем данные сразу после покупки
      setSyncStatus('сохраняю...')
    }
  }

  const getIncome = () => {
    let income = 0
    Object.entries(buildings).forEach(([key, count]) => {
      if (BUILDINGS[key]) {
        income += BUILDINGS[key].baseIncome * count
      }
    })
    return income.toFixed(1)
  }

  const formatNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
    return Math.floor(num)
  }

  // Показать загрузку
  if (loading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <h1>💸 Cash Flow</h1>
          <p>⏳ Загрузка...</p>
        </div>
      </div>
    )
  }

  // Показать форму входа если не залогинен
  if (!user) {
    return <Auth user={user} onLoginSuccess={() => {}} />
  }

  return (
    <div className="app">
      {/* Заголовок с логотипом в углу и кнопкой кабинета */}
      <div className="header">
        <div className="header-left">
          <span className="logo">💸</span>
          <span className="sync-status">{syncStatus}</span>
        </div>
        <button className="profile-btn" onClick={() => setShowProfile(!showProfile)}>👤 Профиль</button>
      </div>

      {/* Счётчик денег */}
      <div className="money-display">
        <div className="money">${formatNumber(money)}</div>
        <div className="income">+${getIncome()} / сек</div>
      </div>

      {/* Показать профиль если открыт */}
      {showProfile && (
        <div className="profile-tab">
          <div className="profile-header">
            <h2>👤 Кабинет</h2>
            <button className="close-btn" onClick={() => setShowProfile(false)}>✕</button>
          </div>

          {/* Вкладки профиля */}
          <div className="profile-tabs">
            <button
              className={`profile-tab-btn ${profileTab === 'profile' ? 'active' : ''}`}
              onClick={() => setProfileTab('profile')}
            >
              👤 Профиль
            </button>
            <button
              className={`profile-tab-btn ${profileTab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setProfileTab('leaderboard')}
            >
              🏆 Топ 10
            </button>
          </div>

          <div className="profile-content">
            {/* Раздел профиля */}
            {profileTab === 'profile' && (
              <>
                <div className="profile-section">
                  <div className="section-title">🎮 Мой профиль</div>
                  <div className="profile-item">
                    <span className="label">Имя:</span>
                    {editingName ? (
                      <div className="name-edit-field">
                        <input
                          type="text"
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          placeholder="Введите своё имя"
                          maxLength="20"
                          autoFocus
                        />
                        <button onClick={() => updatePlayerName(playerName)} className="save-name-btn">✓</button>
                        <button onClick={() => {
                          setPlayerName(playerName)
                          setEditingName(false)
                        }} className="cancel-name-btn">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => setEditingName(true)} className="name-display">
                        {playerName || 'Не установлено'} ✏️
                      </button>
                    )}
                  </div>
                  <div className="profile-item">
                    <span className="label">Email:</span>
                    <span className="value">{user.email}</span>
                  </div>
                  <div className="profile-item">
                    <span className="label">Баланс:</span>
                    <span className="value">${formatNumber(money)}</span>
                  </div>
                  <div className="profile-item">
                    <span className="label">Доход/сек:</span>
                    <span className="value">${getIncome()}</span>
                  </div>
                  <div className="profile-item">
                    <span className="label">Уровень клика:</span>
                    <span className="value">{clickPower}</span>
                  </div>
                </div>

                <div className="profile-divider"></div>
                <button onClick={() => {
                  const confirmed = window.confirm('Вы уверены, что хотите выйти?')
                  if (confirmed) {
                    localStorage.removeItem('currentUser')
                    setUser(null)
                  }
                }} className="logout-profile-btn">
                  🚪 Выход
                </button>
              </>
            )}

            {/* Раздел топ игроков */}
            {profileTab === 'leaderboard' && (
              <div className="profile-section">
                <div className="section-title">🏆 Рейтинг игроков</div>
                {topPlayers.length > 0 ? (
                  <div className="leaderboard">
                    {topPlayers.map((player, index) => (
                      <div key={index} className={`leaderboard-item ${user.email === player.email ? 'current-user' : ''}`}>
                        <div className="rank">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </div>
                        <div className="player-info">
                          <div className="player-name">{player.name}</div>
                          <div className="player-email">{player.email}</div>
                        </div>
                        <div className="player-balance">${formatNumber(player.money)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-players">Нет данных об игроках</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Вкладки */}
      {!showProfile && (
      <div className="tabs">
        <button 
          className={`tab ${tab === 'game' ? 'active' : ''}`}
          onClick={() => setTab('game')}
        >
          🎮 Игра
        </button>
        <button 
          className={`tab ${tab === 'buildings' ? 'active' : ''}`}
          onClick={() => setTab('buildings')}
        >
          🏢 Здания
        </button>
        <button 
          className={`tab ${tab === 'upgrades' ? 'active' : ''}`}
          onClick={() => setTab('upgrades')}
        >
          ⚡ Апгрейды
        </button>
      </div>
      )}

      {/* Основная игра */}
      {!showProfile && tab === 'game' && (
        <div className="game-tab">
          <button className="big-click-btn" onClick={handleClick}>
            <span className="click-emoji">👆</span>
            <div>КЛИКНИ!</div>
            <small>+${clickPower}</small>
          </button>
          <div className="quick-stats">
            <div className="stat">
              <span>⏱️</span>
              <div>
                <div>Доход в сек</div>
                <div className="stat-value">${getIncome()}</div>
              </div>
            </div>
            <div className="stat">
              <span>👆</span>
              <div>
                <div>Сила клика</div>
                <div className="stat-value">${clickPower}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Здания */}
      {!showProfile && tab === 'buildings' && (
        <div className="buildings-tab">
          {Object.entries(BUILDINGS).map(([key, building]) => {
            const count = buildings[key]
            const cost = getCost(key, count)
            const canBuy = money >= cost
            return (
              <button
                key={key}
                className={`building-card ${canBuy ? 'available' : 'unavailable'}`}
                onClick={() => buyBuilding(key)}
              >
                <div className="building-emoji">{building.emoji}</div>
                <div className="building-info">
                  <div className="building-name">{building.name}</div>
                  <div className="building-income">+${building.baseIncome.toFixed(2)}/сек</div>
                  <div className="building-owned">Куплено: {count}</div>
                </div>
                <div className="building-cost">${formatNumber(cost)}</div>
              </button>
            )
          })}
        </div>
      )}

      {/* Апгрейды */}
      {!showProfile && tab === 'upgrades' && (
        <div className="upgrades-tab">
          <button
            className={`upgrade-card ${money >= 1000 * Math.pow(1.1, clickPower - 1) ? 'available' : 'unavailable'}`}
            onClick={buyClickUpgrade}
          >
            <div className="upgrade-emoji">⚡</div>
            <div className="upgrade-info">
              <div className="upgrade-name">Прокачка клика</div>
              <div className="upgrade-level">Уровень: {clickPower}</div>
              <div className="upgrade-effect">+1 к силе клика</div>
            </div>
            <div className="upgrade-cost">${formatNumber(1000 * Math.pow(1.1, clickPower - 1))}</div>
          </button>
        </div>
      )}

      {/* Модальное окно настроек */}
      {showSettings && (
        <div className="settings-modal">
          <div className="settings-content">
            <div className="settings-header">
              <h2>⚙️ Настройки</h2>
              <button className="close-btn" onClick={() => setShowSettings(false)}>✕</button>
            </div>

            {/* Язык */}
            <div className="settings-section">
              <div className="setting-title">🌐 Язык</div>
              <div className="language-buttons">
                <button
                  className={`lang-btn ${language === 'ru' ? 'active' : ''}`}
                  onClick={() => setLanguage('ru')}
                >
                  🇷🇺 Русский
                </button>
                <button
                  className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                  onClick={() => setLanguage('en')}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            {/* Сброс прогресса */}
            <div className="settings-section">
              <div className="setting-title">⚠️ Опасная зона</div>
              <button onClick={() => {
                if (window.confirm(language === 'ru' 
                  ? 'Очистить прогресс? Это нельзя отменить!'
                  : 'Clear progress? This cannot be undone!'
                )) {
                  setMoney(0)
                  setBuildings({ cursor: 0, worker: 0, factory: 0, robot: 0, ai: 0, spaceship: 0 })
                  setClickPower(1)
                  setPlayerName('')
                  saveGameData()
                  setShowSettings(false)
                }
              }} className="reset-btn">
                {language === 'ru' ? '🗑️ Очистить прогресс' : '🗑️ Clear Progress'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Футер */}
      {!showProfile && !showSettings && (
      <div className="footer">
        <div className="footer-leaderboard">
          <div className="footer-title">🏆 Топ 3</div>
          {topPlayers.slice(0, 3).map((player, index) => (
            <div key={index} className="footer-player">
              <span className="footer-rank">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
              <span className="footer-name">{(player.name || 'Неизвестный').substring(0, 10)}</span>
              <span className="footer-money">${formatNumber(player.money)}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setShowSettings(true)} className="settings-btn">
          ⚙️ Настройки
        </button>
      </div>
      )}
    </div>
  )
}

export default App
