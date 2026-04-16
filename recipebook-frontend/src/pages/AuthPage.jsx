import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
})

const registerSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
})

export function AuthPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setTokens, setUser } = useAuthStore()
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)

  const loginForm = useForm({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm({ resolver: zodResolver(registerSchema) })

  const handleLogin = async (data) => {
    setLoading(true)
    try {
      const res = await authApi.login(data)
      setTokens(res.access_token, res.refresh_token)
      setUser(res.user)
      navigate('/')
    } catch (e) {
      toast.error(e.response?.data?.detail ?? 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (data) => {
    setLoading(true)
    try {
      const res = await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
      })
      setTokens(res.access_token, res.refresh_token)
      setUser(res.user)
      navigate('/')
    } catch (e) {
      toast.error(e.response?.data?.detail ?? 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 dark:bg-stone-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-stone-800 rounded-2xl shadow-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-orange-500">RecipeBook</h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Ваша кулинарная книга</p>
        </div>

        <div className="flex rounded-xl bg-stone-100 dark:bg-stone-700 p-1 mb-6">
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === 'login'
                ? 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 shadow-sm'
                : 'text-stone-500 dark:text-stone-400'
            }`}
            onClick={() => setTab('login')}
          >
            {t('auth.login')}
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === 'register'
                ? 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 shadow-sm'
                : 'text-stone-500 dark:text-stone-400'
            }`}
            onClick={() => setTab('register')}
          >
            {t('auth.register')}
          </button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="flex flex-col gap-4">
            <Input
              label={t('auth.email')}
              type="email"
              placeholder="your@email.com"
              error={loginForm.formState.errors.email?.message}
              {...loginForm.register('email')}
            />
            <Input
              label={t('auth.password')}
              type="password"
              placeholder="••••••"
              error={loginForm.formState.errors.password?.message}
              {...loginForm.register('password')}
            />
            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? 'Входим...' : t('auth.login')}
            </Button>
          </form>
        ) : (
          <form onSubmit={registerForm.handleSubmit(handleRegister)} className="flex flex-col gap-4">
            <Input
              label={t('auth.name')}
              type="text"
              placeholder="Иван Иванов"
              error={registerForm.formState.errors.name?.message}
              {...registerForm.register('name')}
            />
            <Input
              label={t('auth.email')}
              type="email"
              placeholder="your@email.com"
              error={registerForm.formState.errors.email?.message}
              {...registerForm.register('email')}
            />
            <Input
              label={t('auth.password')}
              type="password"
              placeholder="••••••"
              error={registerForm.formState.errors.password?.message}
              {...registerForm.register('password')}
            />
            <Input
              label={t('auth.confirmPassword')}
              type="password"
              placeholder="••••••"
              error={registerForm.formState.errors.confirmPassword?.message}
              {...registerForm.register('confirmPassword')}
            />
            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? 'Регистрируемся...' : t('auth.register')}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
