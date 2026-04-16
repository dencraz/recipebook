import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Sun, Moon, Globe, LayoutGrid, List, LogOut, Pencil, Check, X, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { useUiStore } from '../store/uiStore'
import { authApi } from '../api/authApi'
import i18n from '../i18n'
import { Button } from '../components/ui/Button'
import { getPhotoUrl } from '../utils/getPhotoUrl'

export function ProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, setUser, logout } = useAuthStore()
  const { theme, setTheme, language, setLanguage, recipeView, setRecipeView } = useUiStore()

  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(user?.name ?? '')
  const [savingName, setSavingName] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef(null)

  const handleTheme = (val) => setTheme(val)
  const handleLanguage = (val) => {
    setLanguage(val)
    i18n.changeLanguage(val)
  }

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  const handleSaveName = async () => {
    const trimmed = nameValue.trim()
    if (!trimmed || trimmed === user?.name) {
      setEditingName(false)
      setNameValue(user?.name ?? '')
      return
    }
    setSavingName(true)
    try {
      const updated = await authApi.updateProfile({ name: trimmed })
      setUser({ ...user, ...updated })
      setEditingName(false)
      toast.success(t('profile.nameSaved'))
    } catch {
      toast.error(t('profile.saveError'))
    } finally {
      setSavingName(false)
    }
  }

  const handleCancelName = () => {
    setEditingName(false)
    setNameValue(user?.name ?? '')
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const updated = await authApi.updateAvatar(file)
      setUser({ ...user, ...updated })
      toast.success(t('profile.avatarSaved'))
    } catch {
      toast.error(t('profile.saveError'))
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }

  const avatarUrl = getPhotoUrl(user?.avatar_url)

  return (
    <div className="p-4 lg:p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6">{t('profile.title')}</h1>

      {/* User info */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm p-4 mb-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-2xl font-bold text-orange-500 overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase() ?? '?'
              )}
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow transition-colors disabled:opacity-50"
              title={t('profile.changeAvatar')}
            >
              {uploadingAvatar ? (
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera size={12} />
              )}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Name + email */}
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-1 mb-1">
                <input
                  autoFocus
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName()
                    if (e.key === 'Escape') handleCancelName()
                  }}
                  className="flex-1 min-w-0 px-2 py-1 text-sm rounded-lg border border-orange-400 bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 outline-none focus:ring-2 focus:ring-orange-300"
                />
                <button
                  onClick={handleSaveName}
                  disabled={savingName}
                  className="p-1 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50 transition-colors"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={handleCancelName}
                  className="p-1 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 mb-0.5">
                <p className="font-semibold text-stone-800 dark:text-stone-100 truncate">{user?.name ?? '—'}</p>
                <button
                  onClick={() => { setNameValue(user?.name ?? ''); setEditingName(true) }}
                  className="p-1 rounded-lg text-stone-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                  title={t('profile.changeName')}
                >
                  <Pencil size={13} />
                </button>
              </div>
            )}
            <p className="text-sm text-stone-500 dark:text-stone-400 truncate">{user?.email ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm p-4 mb-4">
        <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4">{t('profile.settings')}</h2>

        {/* Theme */}
        <div className="flex items-center justify-between py-3 border-b border-stone-100 dark:border-stone-700">
          <div className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            {t('profile.theme')}
          </div>
          <div className="flex rounded-lg bg-stone-100 dark:bg-stone-700 p-0.5">
            <button
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                theme === 'light'
                  ? 'bg-white dark:bg-stone-600 text-stone-800 dark:text-stone-100 shadow-sm'
                  : 'text-stone-500'
              }`}
              onClick={() => handleTheme('light')}
            >
              {t('profile.themeLight')}
            </button>
            <button
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-white dark:bg-stone-600 text-stone-800 dark:text-stone-100 shadow-sm'
                  : 'text-stone-500'
              }`}
              onClick={() => handleTheme('dark')}
            >
              {t('profile.themeDark')}
            </button>
          </div>
        </div>

        {/* Language */}
        <div className="flex items-center justify-between py-3 border-b border-stone-100 dark:border-stone-700">
          <div className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
            <Globe size={16} />
            {t('profile.language')}
          </div>
          <div className="flex rounded-lg bg-stone-100 dark:bg-stone-700 p-0.5">
            <button
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                language === 'ru'
                  ? 'bg-white dark:bg-stone-600 text-stone-800 dark:text-stone-100 shadow-sm'
                  : 'text-stone-500'
              }`}
              onClick={() => handleLanguage('ru')}
            >
              {t('profile.langRu')}
            </button>
            <button
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                language === 'en'
                  ? 'bg-white dark:bg-stone-600 text-stone-800 dark:text-stone-100 shadow-sm'
                  : 'text-stone-500'
              }`}
              onClick={() => handleLanguage('en')}
            >
              {t('profile.langEn')}
            </button>
          </div>
        </div>

        {/* Recipe view */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
            <LayoutGrid size={16} />
            {t('profile.recipeView')}
          </div>
          <div className="flex rounded-lg bg-stone-100 dark:bg-stone-700 p-0.5">
            <button
              className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                recipeView === 'grid'
                  ? 'bg-white dark:bg-stone-600 text-stone-800 dark:text-stone-100 shadow-sm'
                  : 'text-stone-500'
              }`}
              onClick={() => setRecipeView('grid')}
            >
              <LayoutGrid size={12} />
              {t('profile.viewGrid')}
            </button>
            <button
              className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                recipeView === 'list'
                  ? 'bg-white dark:bg-stone-600 text-stone-800 dark:text-stone-100 shadow-sm'
                  : 'text-stone-500'
              }`}
              onClick={() => setRecipeView('list')}
            >
              <List size={12} />
              {t('profile.viewList')}
            </button>
          </div>
        </div>
      </div>

      {/* Logout */}
      <Button variant="danger" className="w-full" onClick={handleLogout}>
        <LogOut size={16} />
        {t('profile.logout')}
      </Button>
    </div>
  )
}
