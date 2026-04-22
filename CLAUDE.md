# CLAUDE.md — RecipeBook

## Обзор проекта

**RecipeBook** — персональное веб-приложение для хранения и управления кулинарными рецептами.
Монорепозиторий: фронтенд и бэкенд в одной папке, единый `docker-compose.yml` в корне.

- `recipebook-frontend/` — React SPA (Vite)
- `recipebook-backend/` — Go + Gin + PostgreSQL

**Цель:** учебный проект, критерий — реализация всего функционала по ТЗ.

> Подробный план работы по дням, этапы код ревью с ПМ и заключения тестера — в [PROJECT_PLAN.md](PROJECT_PLAN.md)

---

## Запуск проекта

### Через Docker Compose (рекомендуется)

```bash
# Из корня репозитория
docker compose up --build
```

| Сервис | Адрес |
|---|---|
| Frontend (Nginx) | http://localhost:3000 |
| Backend API | http://localhost:8000/api/v1 |
| PostgreSQL | localhost:5432 |

В Docker фронтенд (`VITE_API_URL=/api/v1`) обращается к бэкенду через Nginx-прокси.

### Локальная разработка

```bash
# Backend
cd recipebook-backend
cp .env.example .env   # заполнить переменные
go run ./cmd/server

# Frontend (отдельный терминал)
cd recipebook-frontend
npm install
npm run dev            # http://localhost:5173
```

При локальной разработке фронтенд читает `VITE_API_URL` из `.env` — должен указывать на `http://localhost:8000/api/v1`.

---

## Frontend

### Технологический стек

| Слой | Технология | Версия |
|---|---|---|
| Сборка | Vite | 8 |
| UI | React | 19 |
| Роутинг | React Router | v7 |
| Глобальный стейт | Zustand | v5 |
| Серверный стейт | TanStack Query | v5 |
| HTTP-клиент | Axios | 1.x |
| Стили | Tailwind CSS | v3 |
| Формы | React Hook Form + Zod | 7.x + 4.x |
| i18n | react-i18next | 17.x |
| Уведомления | react-hot-toast | 2.x |
| Иконки | Lucide React | 1.x |

### Структура проекта

```
src/
├── api/
│   ├── axiosInstance.js    # Axios + JWT interceptors
│   ├── authApi.js
│   ├── recipesApi.js
│   ├── categoriesApi.js
│   ├── favoritesApi.js
│   ├── reportsApi.js
│   └── menuPlanApi.js
├── components/
│   ├── ui/                 # Button, Input, Modal, Card, Badge, Spinner
│   ├── layout/             # AppLayout, Sidebar, BottomNav, ProtectedRoute
│   ├── features/           # RecipeCard, RecipeFilters, CategoryBadge, EmptyState
│   └── ErrorBoundary.jsx
├── pages/
│   ├── AuthPage.jsx
│   ├── HomePage.jsx
│   ├── MyRecipesPage.jsx
│   ├── RecipeDetailPage.jsx
│   ├── RecipeFormPage.jsx
│   ├── CategoriesPage.jsx
│   ├── FavoritesPage.jsx
│   ├── ReportsPage.jsx
│   ├── MenuPlannerPage.jsx
│   ├── ProfilePage.jsx
│   └── NotFoundPage.jsx
├── store/
│   ├── authStore.js        # Пользователь, токены, isAuthenticated
│   └── uiStore.js          # Тема, язык, вид (grid/list)
├── hooks/
│   ├── useRecipes.js
│   ├── useCategories.js
│   ├── useFavorites.js
│   └── useReports.js
├── locales/
│   ├── ru/translation.json
│   └── en/translation.json
├── utils/
│   ├── downloadFile.js     # Скачивание Blob (XLSX/PDF)
│   ├── formatters.js       # Форматирование дат, времени, сложности
│   ├── getPhotoUrl.js      # Нормализация URL фото (абсолютные/относительные)
│   └── categoryColor.js    # Цветовая палитра категорий (12 цветов + хэш-фолбэк)
├── router/
│   └── index.jsx
├── i18n.js
├── App.jsx                 # Включает ThemeSync (следит за prefers-color-scheme)
└── main.jsx
```

### Переменные окружения

Файл `recipebook-frontend/.env`:
```
VITE_API_URL=http://localhost:8000/api/v1
```

В продакшене Vite-аргумент `VITE_API_URL=/api/v1` задаётся в `docker-compose.yml`.

### Цветовая система категорий

В `src/utils/categoryColor.js` определена палитра из 12 цветов (`CATEGORY_COLORS`).
Каждый цвет имеет `id`, классы Tailwind для фона, текста, точки и кольца.
Функция `getCategoryColor(colorId, fallbackName)` возвращает цвет по id или автоматически по хэшу названия.

### Тёмная тема

`tailwind.config.js` — `darkMode: 'class'`.
`ThemeSync` в `App.jsx` применяет класс `dark` на `<html>` и следит за системными предпочтениями.

### Маршруты (React Router v7)

```jsx
<Routes>
  <Route path="/auth" element={<AuthPage />} />
  <Route element={<ProtectedRoute />}>
    <Route element={<AppLayout />}>
      <Route path="/"                    element={<HomePage />} />
      <Route path="/my-recipes"          element={<MyRecipesPage />} />
      <Route path="/recipes/new"         element={<RecipeFormPage />} />
      <Route path="/recipes/:id"         element={<RecipeDetailPage />} />
      <Route path="/recipes/:id/edit"    element={<RecipeFormPage />} />
      <Route path="/categories"          element={<CategoriesPage />} />
      <Route path="/favorites"           element={<FavoritesPage />} />
      <Route path="/reports"             element={<ReportsPage />} />
      <Route path="/menu-planner"        element={<MenuPlannerPage />} />
      <Route path="/profile"             element={<ProfilePage />} />
    </Route>
  </Route>
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

### Стейт-менеджмент (Zustand v5)

```js
// authStore.js — persist в localStorage ('auth-storage')
{ user, accessToken, refreshToken, isAuthenticated, setTokens, setUser, logout }

// uiStore.js — persist в localStorage ('ui-storage')
{ theme: 'light'|'dark', language: 'ru'|'en', recipeView: 'grid'|'list',
  setTheme, setLanguage, setRecipeView }
```

### Ключевые правила кода

- Компоненты — функциональные, **именованный экспорт** (не default)
- Файлы компонентов — `PascalCase.jsx`, хуки — `useCamelCase.js`
- API-функции возвращают `response.data`
- Запросы мутации инвалидируют соответствующие TanStack Query ключи
- Ключи запросов: `['recipes']`, `['recipes', id]`, `['categories']` и т.д.
- Ошибки API — `toast.error(error.response?.data?.detail ?? 'Ошибка')`
- Пустые состояния — компонент `<EmptyState />`

---

## Backend

### Технологический стек

| Слой | Технология |
|---|---|
| Язык | Go 1.22 |
| Фреймворк | Gin 1.10 |
| БД | PostgreSQL 15 |
| ORM | GORM v2 (auto-migrate при старте) |
| Аутентификация | golang-jwt/jwt/v5 + bcrypt |
| Генерация XLSX | xuri/excelize v2 |
| Генерация PDF | unidoc/unipdf/v3 |
| Загрузка файлов | Gin multipart (встроен) |
| Валидация | go-playground/validator/v10 |
| Конфигурация | joho/godotenv + os.Getenv |
| CORS | gin-contrib/cors |

### Структура проекта

```
recipebook-backend/
├── cmd/server/main.go          # Точка входа
├── internal/
│   ├── config/config.go        # ENV-переменные
│   ├── db/db.go                # Подключение GORM
│   ├── models/                 # GORM-модели
│   │   ├── user.go
│   │   ├── recipe.go           # ingredients/steps хранятся как JSONB
│   │   ├── category.go         # поле color (id из CATEGORY_COLORS)
│   │   ├── favorite.go
│   │   └── menu_plan.go
│   ├── handlers/               # HTTP-обработчики Gin
│   │   ├── auth.go             # Register, Login, Refresh, Logout, UpdateProfile, UpdateAvatar
│   │   ├── recipes.go          # CRUD + UploadPhoto
│   │   ├── categories.go       # CRUD + UploadPhoto
│   │   ├── favorites.go
│   │   ├── reports.go          # JSON + XLSX + PDF
│   │   └── menu_plan.go        # CRUD + ShoppingListPDF
│   ├── middleware/auth.go       # JWT middleware → устанавливает user_id в контекст
│   ├── repository/             # Запросы к БД, всегда фильтруются по userID
│   │   ├── recipes.go
│   │   ├── categories.go
│   │   ├── favorites.go
│   │   └── menu_plan.go
│   └── utils/
│       ├── jwt.go
│       ├── reports.go          # Генерация XLSX/PDF через excelize + unipdf
│       ├── files.go            # Сохранение загруженных файлов
│       ├── pdffonts.go
│       ├── pdffonts_embed.go
│       └── pdffonts_noembed.go
├── Dockerfile
├── docker-compose.yml          # Только db + backend (для запуска без frontend)
├── .env / .env.example
├── go.mod
└── go.sum
```

### API-эндпоинты

```
POST   /api/v1/auth/register          { name, email, password }
POST   /api/v1/auth/login             { email, password } → { access_token, refresh_token, user }
POST   /api/v1/auth/refresh           { refresh_token }   → { access_token, refresh_token }
POST   /api/v1/auth/logout
PATCH  /api/v1/auth/profile           { name }
PATCH  /api/v1/auth/avatar            multipart: avatar

GET    /api/v1/recipes                ?search=&category_id=&difficulty=&max_time=
POST   /api/v1/recipes                { title, description, category_id, difficulty, cook_time, ingredients, steps }
GET    /api/v1/recipes/:id
PUT    /api/v1/recipes/:id
DELETE /api/v1/recipes/:id
POST   /api/v1/recipes/:id/photo      multipart: photo

GET    /api/v1/categories
POST   /api/v1/categories             { name, color }
PUT    /api/v1/categories/:id         { name, color }
DELETE /api/v1/categories/:id
POST   /api/v1/categories/:id/photo   multipart: photo

GET    /api/v1/favorites
POST   /api/v1/favorites/:recipe_id
DELETE /api/v1/favorites/:recipe_id

GET    /api/v1/reports/favorites      ?sort_by=
GET    /api/v1/reports/categories     ?sort_by=
GET    /api/v1/reports/favorites/xlsx
GET    /api/v1/reports/favorites/pdf
GET    /api/v1/reports/categories/xlsx
GET    /api/v1/reports/categories/pdf

GET    /api/v1/menu-plan              ?week_start=YYYY-MM-DD
PUT    /api/v1/menu-plan              { date, meal_type, recipe_id }
DELETE /api/v1/menu-plan/:id
GET    /api/v1/menu-plan/shopping-list/pdf  ?week_start=YYYY-MM-DD

GET    /uploads/*                     Статические файлы фотографий
GET    /health                        { status: "ok" }
```

Формат ошибки от бэкенда:
```json
{ "detail": "Текст ошибки" }
```

Все защищённые маршруты требуют `Authorization: Bearer <access_token>`.
Все запросы в `repository/` фильтруются по `userID` из JWT — пользователь видит только свои данные.

### Переменные окружения

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

### Модели БД

| Таблица | Ключевые поля |
|---|---|
| `users` | id, name, email, hashed_password, avatar_url, created_at |
| `recipes` | id, owner_id (FK), title, description, category_id (FK), difficulty, cook_time, photo_url, ingredients (JSONB), steps (JSONB) |
| `categories` | id, owner_id (FK), name, color (id из CATEGORY_COLORS), photo_url |
| `favorites` | id, user_id (FK), recipe_id (FK) — уникальный индекс (user_id, recipe_id) |
| `menu_plan` | id, user_id (FK), recipe_id (FK), date, meal_type — уникальный индекс (user_id, date, meal_type) |

---

## Docker Compose (корень репозитория)

```yaml
services:
  db:       postgres:15-alpine, порт 5432, healthcheck
  backend:  Go-приложение, порт 8000, depends_on db (healthy)
  frontend: Nginx SPA, порт 3000, VITE_API_URL=/api/v1
```

Nginx в frontend-контейнере проксирует `/api/` → backend:8000 и отдаёт статику.

---

## Важные замечания

- **JWT refresh**: При 401 axios-интерцептор пробует `/auth/refresh`. При неудаче — `authStore.logout()` → редирект на `/auth`.
- **Фото**: URL из бэка бывают абсолютными (`http://...`) или относительными (`/uploads/...`). Утилита `getPhotoUrl.js` обрабатывает оба случая.
- **Генерация отчётов**: Только на стороне бэка (excelize + unipdf). Фронт скачивает готовый файл через `downloadFile.js` (responseType: 'blob').
- **Цвета категорий**: Хранятся как строковый id (`'orange'`, `'rose'` и т.д.) в поле `color` таблицы `categories`. Функция `getCategoryColor()` на фронте маппит id → Tailwind-классы.
- **Миграции**: GORM auto-migrate запускается при старте сервера — отдельный инструмент миграций не используется.
