# CLAUDE.md — RecipeBook

## Обзор проекта

**RecipeBook** — персональное веб-приложение для хранения и управления кулинарными рецептами.

- **Frontend** — React SPA (этот репозиторий: `recipebook-frontend`)
- **Backend** — FastAPI + PostgreSQL (отдельный репозиторий: `recipebook-backend`)

**Цель:** учебный проект, критерий — реализация всего функционала по ТЗ.

> Подробный план работы по дням, этапы код ревью с ПМ и заключения тестера — в файле [PROJECT_PLAN.md](PROJECT_PLAN.md)

---

## Технологический стек

| Слой | Технология | Причина выбора |
|---|---|---|
| Сборка | Vite 5 | Быстрый dev-server, современный bundler |
| Роутинг | React Router v6 | Стандарт для React SPA |
| Глобальный стейт | Zustand | Простой, без бойлерплейта (тема, язык, auth) |
| Серверный стейт | TanStack Query v5 | Кэширование, фоновое обновление, инвалидация |
| HTTP-клиент | Axios | Интерцепторы для JWT refresh |
| Стили | Tailwind CSS v3 | Быстрая вёрстка, тёмная тема из коробки |
| Формы | React Hook Form + Zod | Валидация схемами, минимум ре-рендеров |
| i18n | react-i18next | Переключение RU/EN без перезагрузки |
| Уведомления | react-hot-toast | Легковесные toast-уведомления |
| Иконки | Lucide React | Tree-shakeable, консистентный стиль |
| Экспорт | Скачивание Blob от бэка | XLSX/PDF генерирует бэкенд, фронт только скачивает |

---

## Инициализация проекта

```bash
npm create vite@latest recipebook-frontend -- --template react
cd recipebook-frontend
npm install react-router-dom @tanstack/react-query axios zustand
npm install react-hook-form zod @hookform/resolvers
npm install react-i18next i18next i18next-browser-languagedetector
npm install react-hot-toast lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## Структура проекта

```
src/
├── api/                    # Все запросы к бэкенду
│   ├── axiosInstance.js    # Настроенный axios + JWT interceptors
│   ├── authApi.js
│   ├── recipesApi.js
│   ├── categoriesApi.js
│   ├── favoritesApi.js
│   ├── reportsApi.js
│   └── menuPlanApi.js
├── components/             # Переиспользуемые компоненты
│   ├── ui/                 # Базовые: Button, Input, Modal, Card, Badge, Spinner
│   ├── layout/             # Navbar, Sidebar, PageWrapper, ProtectedRoute
│   └── features/           # Фича-компоненты (RecipeCard, CategoryBadge, ...)
├── pages/                  # Страницы (по роуту)
│   ├── AuthPage.jsx
│   ├── HomePage.jsx
│   ├── MyRecipesPage.jsx
│   ├── RecipeDetailPage.jsx
│   ├── RecipeFormPage.jsx
│   ├── CategoriesPage.jsx
│   ├── FavoritesPage.jsx
│   ├── ReportsPage.jsx
│   ├── MenuPlannerPage.jsx
│   └── ProfilePage.jsx
├── store/                  # Zustand-хранилища
│   ├── authStore.js        # Пользователь, токены, isAuthenticated
│   └── uiStore.js          # Тема, язык, вид отображения (grid/list)
├── hooks/                  # Кастомные хуки
│   ├── useRecipes.js
│   ├── useCategories.js
│   ├── useFavorites.js
│   └── useReports.js
├── locales/                # Переводы
│   ├── ru/translation.json
│   └── en/translation.json
├── utils/
│   ├── downloadFile.js     # Скачивание Blob (XLSX/PDF)
│   └── formatters.js       # Форматирование дат, времени, сложности
├── router/
│   └── index.jsx           # Все маршруты приложения
├── i18n.js                 # Инициализация i18next
├── App.jsx
└── main.jsx
```

---

## Переменные окружения

Файл `.env` в корне проекта:

```
VITE_API_URL=http://localhost:8000/api/v1
```

В коде использовать: `import.meta.env.VITE_API_URL`

---

## API-интеграция

### axiosInstance.js

```js
// src/api/axiosInstance.js
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Добавлять access-токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// При 401 — пробовать refresh, при неудаче — logout
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = useAuthStore.getState().refreshToken
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refresh_token: refreshToken }
        )
        useAuthStore.getState().setTokens(data.access_token, data.refresh_token)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return api(original)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/auth'
      }
    }
    return Promise.reject(error)
  }
)

export default api
```

### Контракт с бэкендом

Все запросы идут на `VITE_API_URL` (по умолчанию `http://localhost:8000/api/v1`).
Формат ответа об ошибке от бэка:
```json
{ "detail": "Текст ошибки" }
```

Основные эндпоинты (ожидаемые от бэка):

```
POST   /auth/register          { name, email, password }
POST   /auth/login             { email, password } → { access_token, refresh_token, user }
POST   /auth/refresh           { refresh_token }   → { access_token, refresh_token }
POST   /auth/logout

GET    /recipes                ?search=&category_id=&difficulty=&max_time=
POST   /recipes
GET    /recipes/{id}
PUT    /recipes/{id}
DELETE /recipes/{id}

GET    /categories
POST   /categories
PUT    /categories/{id}
DELETE /categories/{id}

GET    /favorites
POST   /favorites/{recipe_id}
DELETE /favorites/{recipe_id}

GET    /reports/favorites      ?sort_by=
GET    /reports/categories     ?sort_by=
GET    /reports/favorites/xlsx
GET    /reports/favorites/pdf
GET    /reports/categories/xlsx
GET    /reports/categories/pdf

GET    /menu-plan              ?week_start=YYYY-MM-DD
PUT    /menu-plan              { date, meal_type, recipe_id }
DELETE /menu-plan/{id}
GET    /menu-plan/shopping-list/pdf  ?week_start=YYYY-MM-DD
```

---

## Маршруты (React Router v6)

```jsx
// src/router/index.jsx
<Routes>
  <Route path="/auth" element={<AuthPage />} />

  <Route element={<ProtectedRoute />}>
    <Route element={<AppLayout />}>
      <Route path="/"           element={<HomePage />} />
      <Route path="/my-recipes" element={<MyRecipesPage />} />
      <Route path="/recipes/new"       element={<RecipeFormPage />} />
      <Route path="/recipes/:id"       element={<RecipeDetailPage />} />
      <Route path="/recipes/:id/edit"  element={<RecipeFormPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/favorites"  element={<FavoritesPage />} />
      <Route path="/reports"    element={<ReportsPage />} />
      <Route path="/menu-planner" element={<MenuPlannerPage />} />
      <Route path="/profile"    element={<ProfilePage />} />
    </Route>
  </Route>

  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

`ProtectedRoute` — если `!isAuthenticated`, редиректит на `/auth`.

---

## Стейт-менеджмент (Zustand)

### authStore.js

```js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh, isAuthenticated: true }),

      setUser: (user) => set({ user }),

      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }  // persist в localStorage
  )
)
```

### uiStore.js

```js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUiStore = create(
  persist(
    (set) => ({
      theme: 'light',           // 'light' | 'dark'
      language: 'ru',           // 'ru' | 'en'
      recipeView: 'grid',       // 'grid' | 'list'

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setRecipeView: (view) => set({ recipeView: view }),
    }),
    { name: 'ui-storage' }
  )
)
```

---

## Тёмная тема (Tailwind)

В `tailwind.config.js` включить:
```js
module.exports = {
  darkMode: 'class',
  // ...
}
```

В `App.jsx` применять класс на `<html>`:
```jsx
useEffect(() => {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}, [theme])
```

Цветовая палитра — тёплые тона:
- Основной акцент: `orange-500` / `orange-400`
- Фон светлый: `amber-50`, `stone-100`
- Фон тёмный: `stone-900`, `stone-800`
- Текст: `stone-800` (light) / `stone-100` (dark)
- Карточки: `white` / `stone-800`, скруглённые `rounded-2xl`, тень `shadow-md`

---

## Интернационализация (i18next)

```js
// src/i18n.js
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ru from './locales/ru/translation.json'
import en from './locales/en/translation.json'

i18n.use(initReactI18next).init({
  resources: { ru: { translation: ru }, en: { translation: en } },
  lng: 'ru',
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
})

export default i18n
```

При смене языка в uiStore вызывать `i18n.changeLanguage(language)`.

Ключи переводов организовывать по секциям:
```json
{
  "nav": { "home": "Главная", "myRecipes": "Мои рецепты", ... },
  "auth": { "login": "Войти", "register": "Регистрация", ... },
  "recipe": { "title": "Название", "ingredients": "Ингредиенты", ... },
  "reports": { "favorites": "Избранные рецепты", ... },
  "settings": { "theme": "Тема", "language": "Язык", ... }
}
```

---

## Работа с формами

Использовать **React Hook Form + Zod** для всех форм.

Пример схемы рецепта:
```js
import { z } from 'zod'

export const recipeSchema = z.object({
  title:       z.string().min(2, 'Минимум 2 символа').max(100),
  description: z.string().max(500).optional(),
  category_id: z.number().nullable(),
  difficulty:  z.enum(['easy', 'medium', 'hard']),
  cook_time:   z.number().min(1).max(1440),  // минуты
  ingredients: z.array(z.object({
    name:     z.string().min(1),
    amount:   z.string().min(1),
  })).min(1, 'Добавьте хотя бы один ингредиент'),
  steps: z.array(z.object({
    description: z.string().min(1),
  })).min(1, 'Добавьте хотя бы один шаг'),
})
```

Поле `photo` — загрузка файла через `multipart/form-data`, отдельный запрос или в составе формы.

---

## Загрузка файлов (фото рецепта)

При загрузке изображения использовать `FormData`:
```js
const formData = new FormData()
formData.append('photo', file)
// Отправлять с Content-Type: multipart/form-data
```

Показывать превью через `URL.createObjectURL(file)` до загрузки.

---

## Экспорт отчётов (XLSX / PDF)

Бэкенд возвращает файл как бинарный поток. Скачивание:

```js
// src/utils/downloadFile.js
export async function downloadFile(url, filename) {
  const response = await api.get(url, { responseType: 'blob' })
  const href = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  link.click()
  URL.revokeObjectURL(href)
}
```

---

## Описание страниц

### AuthPage (`/auth`)
- Две вкладки: «Войти» / «Зарегистрироваться»
- Поля входа: email, пароль
- Поля регистрации: имя, email, пароль, подтверждение пароля
- После успешной авторизации — редирект на `/`
- Хранить токены через `authStore.setTokens()`

### HomePage (`/`)
- Лента всех рецептов пользователя
- Строка поиска по названию
- Фильтры: категория, сложность (easy/medium/hard), максимальное время приготовления
- Отображение в виде сетки или списка (из `uiStore.recipeView`)
- На каждой карточке: фото, название, категория, время, сложность, кнопка «В избранное»

### MyRecipesPage (`/my-recipes`)
- Аналог HomePage, но явно акцентирован на управлении
- Кнопка «Добавить рецепт» → переход на `/recipes/new`
- На каждой карточке: кнопки «Редактировать» и «Удалить»

### RecipeDetailPage (`/recipes/:id`)
- Полная страница рецепта
- Фото, название, описание, категория, время, сложность
- Список ингредиентов
- Нумерованные шаги приготовления
- Кнопка «В избранное» / «Убрать из избранного»
- Кнопки «Редактировать» и «Удалить» (только для владельца)

### RecipeFormPage (`/recipes/new` и `/recipes/:id/edit`)
- Единая форма создания и редактирования
- При редактировании — предзаполнять данными из `useQuery`
- Динамический список ингредиентов (добавить/удалить строку)
- Динамический список шагов (добавить/удалить/переупорядочить)
- Загрузка фото с превью
- Выбор категории из выпадающего списка

### CategoriesPage (`/categories`)
- Список всех категорий пользователя
- Карточка категории: название, количество рецептов
- Кликнуть на категорию → фильтрует рецепты по ней
- Форма создания категории (inline или модальное окно)
- Кнопки редактирования и удаления

### FavoritesPage (`/favorites`)
- Список рецептов, добавленных в избранное
- Такой же вид сетки/списка как на HomePage
- Кнопка убрать из избранного

### ReportsPage (`/reports`)
- Две вкладки: «Избранные рецепты» / «По категориям»
- Таблица с данными (sortable по колонкам)
- Кнопки экспорта: «Скачать XLSX» / «Скачать PDF»
- Краткая статистика над таблицей (общее количество, распределение)

### MenuPlannerPage (`/menu-planner`)
- Визуальный календарь на 7 дней (текущая неделя, навигация по неделям)
- Колонки: Пн–Вс, строки: Завтрак / Обед / Ужин
- В каждой ячейке: название назначенного рецепта или кнопка «+»
- По клику «+» — модальное окно с поиском и выбором рецепта
- Кнопка «Список покупок» → скачать PDF сводного списка ингредиентов

### ProfilePage (`/profile`)
- Информация о пользователе: имя, email (только просмотр)
- Секция настроек интерфейса:
  - Переключатель темы: светлая / тёмная
  - Переключатель языка: Русский / English
  - Переключатель вида рецептов: Сетка / Список
  - Все изменения применяются немедленно (без кнопки «Сохранить»)
- Кнопка «Выйти» — вызывает `authStore.logout()`, редирект на `/auth`

---

## Компоненты Layout

### AppLayout
- Боковая навигация (Sidebar) на десктопе
- Нижняя навигация (BottomNav) на мобильных устройствах
- `<Outlet />` для вложенных страниц

### Navbar / Sidebar
Пункты меню:
1. Главная
2. Мои рецепты
3. Категории
4. Избранное
5. Отчёты
6. Планировщик меню
7. Профиль

Кнопка **Профиль** ведёт на страницу `/profile`, которая объединяет:
- Информацию о пользователе (имя, email)
- Настройки интерфейса (тема, язык, вид отображения)
- Кнопку «Выйти» (`authStore.logout()` → редирект на `/auth`)

### ProtectedRoute
```jsx
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />
}
```

---

## Обработка ошибок

- Ошибки API показывать через `react-hot-toast` (`toast.error(error.response?.data?.detail ?? 'Ошибка')`)
- Состояния загрузки — показывать `Spinner` компонент
- Пустые состояния (нет рецептов, нет избранного) — показывать иллюстрацию с текстом

---

## Адаптивность

- Mobile-first подход
- Брейкпоинты Tailwind: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- На мобильных: 1 колонка в сетке рецептов, нижняя навигация
- На планшетах: 2 колонки
- На десктопе: 3–4 колонки, боковая навигация

---

## Правила написания кода

- Все компоненты — функциональные, именованный экспорт (не default)
- Файлы компонентов — PascalCase: `RecipeCard.jsx`
- Хуки — camelCase с префиксом `use`: `useRecipes.js`
- Константы — UPPER_SNAKE_CASE
- API-функции возвращают `response.data` (не весь response)
- Не использовать `any` типы (если добавляется TypeScript)
- Запросы мутации (POST/PUT/DELETE) инвалидируют соответствующие TanStack Query ключи
- Ключи запросов TanStack Query — массивы с именем ресурса: `['recipes']`, `['recipes', id]`, `['categories']`

---

## Запуск проекта

```bash
# Разработка
npm run dev

# Сборка
npm run build

# Предпросмотр сборки
npm run preview
```

Фронтенд по умолчанию запускается на `http://localhost:5173`.
Бэкенд должен быть запущен на `http://localhost:8000` и разрешать CORS с `http://localhost:5173`.

---

## Важные замечания

- **CORS**: Бэкенд должен разрешать запросы с `http://localhost:5173` (или текущего адреса фронта)
- **Изображения**: URL изображений рецептов — абсолютные ссылки, возвращаемые бэкендом
- **JWT refresh**: Если refresh-токен истёк → `authStore.logout()` → редирект на `/auth`
- **Изоляция данных**: Все запросы возвращают только данные авторизованного пользователя (бэк это гарантирует)
- **Генерация отчётов**: Только на стороне бэка — фронтенд скачивает готовый файл через `downloadFile()`

---

## Backend — Краткая справка (Go)

> Полный план реализации Backend с документацией шагов, код ревью и тестированием — в [PROJECT_PLAN.md](PROJECT_PLAN.md)

### Стек

| Слой | Технология |
|---|---|
| Язык | Go 1.22+ |
| Фреймворк | Gin |
| БД | PostgreSQL 15 |
| ORM / SQL | GORM v2 |
| Миграции | golang-migrate |
| Аутентификация | JWT — golang-jwt/jwt/v5, bcrypt (golang.org/x/crypto) |
| Генерация XLSX | xuri/excelize |
| Генерация PDF | jung-kurt/gofpdf |
| Загрузка файлов | Gin multipart (встроен) |
| Валидация | go-playground/validator/v10 |
| Конфигурация | joho/godotenv + os.Getenv |
| CORS | gin-contrib/cors |
| Контейнеризация | Docker + Docker Compose |

### Структура проекта Backend (Go)

```
recipebook-backend/
├── cmd/
│   └── server/
│       └── main.go          # Точка входа, запуск Gin
├── internal/
│   ├── config/
│   │   └── config.go        # Чтение ENV-переменных
│   ├── db/
│   │   └── db.go            # Подключение GORM к PostgreSQL
│   ├── models/              # GORM-модели
│   │   ├── user.go
│   │   ├── recipe.go
│   │   ├── category.go
│   │   ├── favorite.go
│   │   └── menu_plan.go
│   ├── handlers/            # HTTP-обработчики (Gin)
│   │   ├── auth.go
│   │   ├── recipes.go
│   │   ├── categories.go
│   │   ├── favorites.go
│   │   ├── reports.go
│   │   └── menu_plan.go
│   ├── middleware/
│   │   ├── auth.go          # JWT middleware (извлечение current_user)
│   │   └── cors.go
│   ├── repository/          # Запросы к БД (бизнес-логика)
│   │   ├── recipes.go
│   │   ├── categories.go
│   │   ├── favorites.go
│   │   └── menu_plan.go
│   └── utils/
│       ├── jwt.go           # Генерация и валидация JWT
│       ├── reports.go       # Генерация XLSX/PDF
│       └── files.go         # Сохранение загруженных файлов
├── migrations/              # SQL-файлы миграций
│   ├── 001_create_users.up.sql
│   ├── 001_create_users.down.sql
│   └── ...
├── uploads/                 # Загружаемые фото (монтируется через Docker volume)
├── Dockerfile
├── docker-compose.yml
├── .env
├── .env.example
├── go.mod
├── go.sum
└── README.md
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.9'

services:
  db:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: recipebook
      POSTGRES_PASSWORD: recipebook
      POSTGRES_DB: recipebook
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: .
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      DB_HOST: db
      DB_PORT: 5432
      DB_USER: recipebook
      DB_PASSWORD: recipebook
      DB_NAME: recipebook
      JWT_SECRET: change-me-in-production
      ACCESS_TOKEN_TTL_MINUTES: 30
      REFRESH_TOKEN_TTL_DAYS: 7
      UPLOAD_DIR: /app/uploads
    volumes:
      - uploads_data:/app/uploads
    depends_on:
      - db

volumes:
  postgres_data:
  uploads_data:
```

### Dockerfile

```dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o server ./cmd/server

FROM alpine:3.19
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 8000
CMD ["./server"]
```

### Запуск Backend

```bash
# Через Docker Compose (рекомендуется)
docker compose up --build

# Локально без Docker
cp .env.example .env          # заполнить переменные
go run ./cmd/server           # запуск сервера

# Миграции (если запускать без Docker)
migrate -path ./migrations -database "postgres://recipebook:recipebook@localhost/recipebook?sslmode=disable" up
```

API доступно на `http://localhost:8000`, документация Swagger: `http://localhost:8000/swagger/index.html`

### Переменные окружения (.env)

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=recipebook
DB_PASSWORD=recipebook
DB_NAME=recipebook
JWT_SECRET=your-secret-key
ACCESS_TOKEN_TTL_MINUTES=30
REFRESH_TOKEN_TTL_DAYS=7
UPLOAD_DIR=./uploads
PORT=8000
CORS_ORIGIN=http://localhost:5173
```

### Модели БД (GORM)

| Таблица | Ключевые поля |
|---|---|
| `users` | id, name, email, hashed_password, created_at |
| `recipes` | id, owner_id (FK), title, description, category_id (FK), difficulty, cook_time, photo_url, ingredients (JSONB), steps (JSONB) |
| `categories` | id, owner_id (FK), name |
| `favorites` | id, user_id (FK), recipe_id (FK) — уникальный индекс (user_id, recipe_id) |
| `menu_plan` | id, user_id (FK), recipe_id (FK), date, meal_type — уникальный индекс (user_id, date, meal_type) |

### Формат ответа об ошибке

```json
{ "detail": "Текст ошибки" }
```

### Изоляция данных

Все запросы в `repository/` фильтруются по `userID` из JWT middleware — пользователь видит только свои данные.