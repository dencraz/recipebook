# PROJECT_PLAN.md — RecipeBook: План работы

> Учебный проект. Оценочный критерий — реализация всего функционала по ТЗ.
> Дата составления плана: 2026-04-16

---

## Общая схема

```
Frontend (React)  ←→  Backend (FastAPI + PostgreSQL)
     ↓                         ↓
  GitHub Repo             GitHub Repo
  (recipebook-frontend)   (recipebook-backend)
```

---

## Фронтенд: Доделать

### Текущее состояние

Структура проекта создана, базовые файлы на месте:

| Файл / Директория | Статус |
|---|---|
| `src/api/` — все API-модули | Созданы (интеграция с бэком не протестирована) |
| `src/components/ui/` — Button, Input, Modal, Card, Badge, Spinner | Созданы |
| `src/components/layout/` — AppLayout, Sidebar, BottomNav, ProtectedRoute | Созданы |
| `src/components/features/` — RecipeCard, RecipeFilters, CategoryBadge, EmptyState | Созданы |
| `src/pages/` — все 10 страниц | Созданы (часть — заглушки) |
| `src/hooks/` — useRecipes, useCategories, useFavorites, useReports | Созданы |
| `src/store/` — authStore, uiStore | Созданы |
| `src/i18n.js` + `locales/` | Созданы |
| `src/utils/` — downloadFile, formatters | Созданы |
| `src/router/index.jsx` | Создан |

### Что необходимо доделать

- [ ] Подключить все страницы к реальному API (убрать моки/заглушки)
- [ ] `AuthPage` — рабочий вход и регистрация с сохранением токенов
- [ ] `HomePage` — поиск и фильтры через query-параметры к API
- [ ] `MyRecipesPage` — CRUD рецептов (список + удаление)
- [ ] `RecipeDetailPage` — полная карточка, кнопка избранного, кнопки владельца
- [ ] `RecipeFormPage` — создание/редактирование: динамические ингредиенты, шаги, загрузка фото
- [ ] `CategoriesPage` — CRUD категорий, inline-форма
- [ ] `FavoritesPage` — список избранного, убрать из избранного
- [ ] `ReportsPage` — таблицы с сортировкой, скачивание XLSX/PDF
- [ ] `MenuPlannerPage` — календарь 7 дней × 3 приёма пищи, модалка выбора рецепта, PDF списка покупок
- [ ] `ProfilePage` — просмотр профиля, настройки темы/языка/вида, выход
- [ ] Тёмная тема — проверить все компоненты в dark-режиме
- [ ] Адаптивность — протестировать mobile/tablet/desktop
- [ ] Обработка ошибок — toast-уведомления на все мутации и запросы
- [ ] Пустые состояния — EmptyState на всех листинговых страницах
- [ ] Локализация — заполнить все ключи в `ru/translation.json` и `en/translation.json`
- [ ] Сборка — `npm run build` без ошибок

### GitHub репо (Frontend)

- Репозиторий: `github.com/<username>/recipebook-frontend`
- Ветки:
  - `main` — стабильная версия
  - `dev` — текущая разработка
  - `feature/*` — фичи (сливаются в `dev` через PR)
- README.md: инструкция запуска, стек, скриншоты

---

### Документация шагов работы — Frontend (3–4 дня)

#### День 1 — Основа и авторизация

| # | Задача | Результат |
|---|---|---|
| 1 | Настройка окружения, `.env`, Vite dev-server | Проект запускается |
| 2 | Реализация `AuthPage`: вход и регистрация | Токены сохраняются в `authStore` |
| 3 | `axiosInstance` — JWT interceptors (request + 401 refresh) | Автообновление токена |
| 4 | `ProtectedRoute` — редирект на `/auth` | Закрытые маршруты работают |
| 5 | Базовая вёрстка `AppLayout`, `Sidebar`, `BottomNav` | Навигация по всем разделам |

**Этап код ревью с ПМ (День 1, конец дня):**
- Проверить: структура папок соответствует CLAUDE.md
- Проверить: токены хранятся через `persist` в localStorage, не в sessionStorage
- Проверить: `_retry` флаг в interceptor предотвращает бесконечный цикл refresh
- **Вывод ПМ:** подтверждение корректности архитектуры аутентификации, разрешение переходить к страницам

---

#### День 2 — Рецепты и категории

| # | Задача | Результат |
|---|---|---|
| 1 | `HomePage` — лента рецептов, поиск, фильтры (категория, сложность, время) | Фильтрация через API работает |
| 2 | `RecipeCard` — фото, мета-данные, кнопка избранного | Карточка в grid/list виде |
| 3 | `MyRecipesPage` — список своих рецептов, удаление | CRUD через TanStack Query |
| 4 | `RecipeFormPage` — форма создания/редактирования | Zod-валидация, динамические поля |
| 5 | Загрузка фото — `FormData`, превью через `createObjectURL` | Фото прикрепляется к рецепту |
| 6 | `RecipeDetailPage` — полная страница рецепта | Ингредиенты, шаги, избранное |
| 7 | `CategoriesPage` — список, создание, редактирование, удаление | Inline-форма или модальное окно |

**Этап код ревью с ПМ (День 2, конец дня):**
- Проверить: инвалидация кэша после мутаций (`['recipes']`, `['categories']`)
- Проверить: ключи TanStack Query — массивы, а не строки
- Проверить: форма сбрасывается после успешного сабмита
- Проверить: удаление с подтверждением (Modal)
- **Вывод ПМ:** оценка UI/UX, комментарии по компонентной декомпозиции

---

#### День 3 — Избранное, отчёты, планировщик меню

| # | Задача | Результат |
|---|---|---|
| 1 | `FavoritesPage` — список избранного, убрать из избранного | Оптимистичное обновление |
| 2 | `ReportsPage` — таблица избранных / по категориям, сортировка | Данные из API |
| 3 | Скачивание XLSX/PDF — `downloadFile()` | Файл скачивается через Blob |
| 4 | `MenuPlannerPage` — сетка 7×3, навигация по неделям | Визуальный календарь |
| 5 | Модалка выбора рецепта для ячейки планировщика | Поиск по рецептам в модалке |
| 6 | PDF списка покупок — скачивание через `downloadFile()` | Файл скачивается |

**Этап код ревью с ПМ (День 3, конец дня):**
- Проверить: параметр `week_start` передаётся в формате `YYYY-MM-DD`
- Проверить: таблицы в ReportsPage сортируемы на клиенте или через API
- Проверить: скачивание файлов не ломает стейт приложения
- **Вывод ПМ:** проверка всех бизнес-фич по ТЗ, список замечаний

---

#### День 4 — Профиль, локализация, тёмная тема, финал

| # | Задача | Результат |
|---|---|---|
| 1 | `ProfilePage` — просмотр профиля, настройки UI, выход | Тема/язык/вид переключаются без перезагрузки |
| 2 | Тёмная тема — проверить все страницы и компоненты | Нет белых вспышек, все цвета соответствуют палитре |
| 3 | Локализация RU/EN — заполнить все ключи переводов | Переключение языка работает везде |
| 4 | Адаптивность — тестирование 375px / 768px / 1280px | Mobile-first вёрстка |
| 5 | `npm run build` — исправить все ошибки и предупреждения | Сборка чистая |
| 6 | Деплой или подготовка демо-среды | Приложение доступно для проверки |

**Этап код ревью с ПМ (День 4):**
- Финальный обход всех маршрутов
- Проверка консоли браузера на ошибки
- Проверка сетевых запросов (DevTools → Network)
- **Вывод ПМ:** финальное одобрение Frontend части, разрешение на сдачу

**Заключение от тестера (после Дня 4):**
- Функциональное тестирование всех страниц по сценариям ТЗ
- Кросс-браузерное тестирование: Chrome, Firefox, Edge
- Мобильное тестирование: реальное устройство или DevTools
- Сценарии: регистрация → создание рецепта → добавление в избранное → отчёт → планировщик → выход
- Сценарий с истёкшим токеном: refresh отрабатывает автоматически
- **Итоговый вердикт тестера:** список багов (P1/P2/P3) или «готово к сдаче»

---

---

## Бэкенд: Сделать в соответствии с ТЗ (Go)

### Технологический стек Backend

| Слой | Технология |
|---|---|
| Язык | Go 1.22+ |
| Фреймворк | Gin |
| БД | PostgreSQL 15 |
| ORM / SQL | GORM v2 |
| Миграции | golang-migrate |
| Аутентификация | JWT — golang-jwt/jwt/v5 + bcrypt (golang.org/x/crypto) |
| Генерация XLSX | xuri/excelize |
| Генерация PDF | jung-kurt/gofpdf |
| Загрузка файлов | Gin multipart (встроен в стандартную библиотеку) |
| Валидация | go-playground/validator/v10 |
| Конфигурация | joho/godotenv |
| CORS | gin-contrib/cors |
| Контейнеризация | Docker + Docker Compose |

### Структура проекта Backend (Go)

```
recipebook-backend/
├── cmd/
│   └── server/
│       └── main.go          # Точка входа: Gin, роуты, middleware
├── internal/
│   ├── config/
│   │   └── config.go        # Чтение ENV-переменных
│   ├── db/
│   │   └── db.go            # Подключение GORM + AutoMigrate / migrate
│   ├── models/              # GORM-модели (struct + TableName)
│   │   ├── user.go
│   │   ├── recipe.go
│   │   ├── category.go
│   │   ├── favorite.go
│   │   └── menu_plan.go
│   ├── handlers/            # HTTP-обработчики Gin (c *gin.Context)
│   │   ├── auth.go
│   │   ├── recipes.go
│   │   ├── categories.go
│   │   ├── favorites.go
│   │   ├── reports.go
│   │   └── menu_plan.go
│   ├── middleware/
│   │   └── auth.go          # JWT middleware → устанавливает userID в контекст
│   ├── repository/          # Запросы к БД через GORM
│   │   ├── recipes.go
│   │   ├── categories.go
│   │   ├── favorites.go
│   │   └── menu_plan.go
│   └── utils/
│       ├── jwt.go           # GenerateAccessToken, GenerateRefreshToken, ParseToken
│       ├── reports.go       # Генерация XLSX (excelize) и PDF (gofpdf)
│       └── files.go         # Сохранение загруженных фото
├── migrations/              # SQL-файлы для golang-migrate
│   ├── 000001_create_users.up.sql
│   ├── 000001_create_users.down.sql
│   ├── 000002_create_recipes.up.sql
│   └── ...
├── uploads/                 # Каталог фото (монтируется как Docker volume)
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
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U recipebook"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: .
    restart: unless-stopped
    ports:
      - "8000:8000"
    env_file: .env
    environment:
      DB_HOST: db
      DB_PORT: "5432"
    volumes:
      - uploads_data:/app/uploads
    depends_on:
      db:
        condition: service_healthy

volumes:
  postgres_data:
  uploads_data:
```

### Dockerfile (multi-stage)

```dockerfile
# Этап сборки
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server

# Финальный образ
FROM alpine:3.19
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 8000
CMD ["./server"]
```

### .env.example

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=recipebook
DB_PASSWORD=recipebook
DB_NAME=recipebook
JWT_SECRET=change-me-in-production
ACCESS_TOKEN_TTL_MINUTES=30
REFRESH_TOKEN_TTL_DAYS=7
UPLOAD_DIR=./uploads
PORT=8000
CORS_ORIGIN=http://localhost:5173
```

### Запуск Backend

```bash
# Через Docker Compose (рекомендуется, поднимает PostgreSQL автоматически)
cp .env.example .env
docker compose up --build

# Локально (PostgreSQL должен быть запущен отдельно)
cp .env.example .env
go run ./cmd/server

# Применить миграции вручную
migrate -path ./migrations \
  -database "postgres://recipebook:recipebook@localhost/recipebook?sslmode=disable" up
```

API: `http://localhost:8000` | Swagger: `http://localhost:8000/swagger/index.html`

### API-эндпоинты (реализовать все)

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout

GET    /api/v1/recipes                ?search=&category_id=&difficulty=&max_time=
POST   /api/v1/recipes
GET    /api/v1/recipes/:id
PUT    /api/v1/recipes/:id
DELETE /api/v1/recipes/:id

GET    /api/v1/categories
POST   /api/v1/categories
PUT    /api/v1/categories/:id
DELETE /api/v1/categories/:id

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
PUT    /api/v1/menu-plan
DELETE /api/v1/menu-plan/:id
GET    /api/v1/menu-plan/shopping-list/pdf  ?week_start=YYYY-MM-DD
```

**Формат ошибок:** `{ "detail": "Текст ошибки" }`
**CORS:** разрешить `http://localhost:5173`
**Изоляция данных:** все запросы фильтруются по `userID` из JWT-контекста

### GitHub репо (Backend)

- Репозиторий: `github.com/<username>/recipebook-backend`
- Ветки:
  - `main` — стабильная версия
  - `dev` — текущая разработка
  - `feature/*` — фичи (сливаются в `dev` через PR)
- README.md: инструкция запуска через `docker compose up`, переменные окружения

---

### Документация шагов работы — Backend Go (3–4 дня)

#### День 1 — Инициализация проекта, БД, аутентификация

| # | Задача | Результат |
|---|---|---|
| 1 | `go mod init`, структура папок, `cmd/server/main.go` | Проект компилируется |
| 2 | `docker-compose.yml` — PostgreSQL + backend сервис | `docker compose up` поднимает БД |
| 3 | `internal/db/db.go` — подключение GORM к PostgreSQL | Соединение установлено |
| 4 | GORM-модели: `User`, `Recipe`, `Category`, `Favorite`, `MenuPlan` | AutoMigrate / миграции применены |
| 5 | `internal/utils/jwt.go` — генерация и парсинг JWT access/refresh | Токены создаются и валидируются |
| 6 | `internal/handlers/auth.go` — POST /register, /login, /refresh, /logout | Регистрация и вход работают |
| 7 | `internal/middleware/auth.go` — JWT middleware, `userID` в gin.Context | Защищённые роуты получают пользователя |
| 8 | `gin-contrib/cors` — разрешить `localhost:5173` | Фронтенд может обращаться к API |

**Этап код ревью с ПМ (День 1, конец дня):**
- Проверить: bcrypt используется для хэширования (не MD5/SHA)
- Проверить: истёкший access-токен возвращает 401, не 403
- Проверить: refresh-токен хранится в БД (таблица `refresh_tokens`) — нельзя повторно использовать после logout
- Проверить: JWT_SECRET читается из ENV, не захардкожен
- Проверить: `docker compose up` поднимает всё без ручных шагов
- **Вывод ПМ:** подтверждение безопасности схемы аутентификации, разрешение переходить к бизнес-роутам

---

#### День 2 — Рецепты и категории

| # | Задача | Результат |
|---|---|---|
| 1 | Request/Response struct-ы для рецептов и категорий (с тегами `binding:"required"`) | Валидация входных данных через validator |
| 2 | `repository/recipes.go` — CRUD + фильтры: `ILIKE search`, `category_id`, `difficulty`, `max_time` | SQL-запросы через GORM |
| 3 | `handlers/recipes.go` — 5 эндпоинтов (GET list, POST, GET :id, PUT :id, DELETE :id) | Все роуты работают |
| 4 | Загрузка фото — `c.FormFile("photo")`, сохранение в `UPLOAD_DIR`, возврат URL | Фото привязывается к рецепту |
| 5 | Изоляция: все запросы фильтруются по `owner_id = userID из контекста` | Чужие рецепты недоступны |
| 6 | `repository/categories.go` + `handlers/categories.go` — 4 эндпоинта CRUD | Категории работают |
| 7 | В ответе категории — поле `recipe_count` через LEFT JOIN COUNT | Агрегация без N+1 |

**Этап код ревью с ПМ (День 2, конец дня):**
- Проверить: DELETE/PUT чужого рецепта → 403 или 404 (не 200)
- Проверить: имя файла фото — UUID, не оригинальное имя (безопасность)
- Проверить: `recipe_count` — один SQL-запрос с JOIN, не цикл запросов
- Проверить: Dockerfile собирает образ без ошибок
- **Вывод ПМ:** оценка качества GORM-запросов, рекомендации по индексам

---

#### День 3 — Избранное, отчёты, планировщик меню

| # | Задача | Результат |
|---|---|---|
| 1 | `handlers/favorites.go` — GET /favorites, POST /favorites/:id, DELETE /favorites/:id | Уникальный индекс (user_id, recipe_id) — нет дублей |
| 2 | `handlers/reports.go` — GET отчёт «избранные» с сортировкой | JSON-ответ |
| 3 | GET отчёт «по категориям» — GROUP BY через GORM | JSON-ответ с агрегацией |
| 4 | `utils/reports.go` — генерация XLSX через `excelize` | XLSX-файл с заголовком `Content-Disposition` |
| 5 | Генерация PDF через `gofpdf` | PDF-файл с корректными заголовками |
| 6 | `handlers/menu_plan.go` — GET /menu-plan?week_start=, PUT, DELETE /:id | Записи планировщика |
| 7 | GET /menu-plan/shopping-list/pdf — агрегация ингредиентов за неделю → PDF | PDF скачивается |

**Этап код ревью с ПМ (День 3, конец дня):**
- Проверить: `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` для XLSX
- Проверить: `Content-Type: application/pdf` для PDF
- Проверить: `Content-Disposition: attachment; filename="report.xlsx"` присутствует
- Проверить: уникальный индекс `(user_id, date, meal_type)` в `menu_plan`
- **Вывод ПМ:** проверка соответствия форматов ответов ожиданиям фронтенда

---

#### День 4 — Финализация, Docker, документация

| # | Задача | Результат |
|---|---|---|
| 1 | Глобальный error handler в Gin — все ошибки в `{ "detail": "..." }` | Консистентный формат ошибок |
| 2 | Swagger через `swaggo/swag` — аннотации на все хендлеры | `/swagger/index.html` актуален |
| 3 | Проверка всех эндпоинтов через Swagger UI или Postman | Нет незакрытых маршрутов |
| 4 | Healthcheck в `docker-compose.yml` — backend ждёт готовности БД | `docker compose up` стабилен |
| 5 | Проверка изоляции данных: два пользователя, запрос чужих ресурсов → 403/404 | Изоляция работает |
| 6 | `.env.example` добавлен, `README.md` с инструкцией `docker compose up` | Репо воспроизводим |

**Этап код ревью с ПМ (День 4):**
- Финальный прогон всех эндпоинтов через Postman-коллекцию
- Проверка консистентности JSON-схем с тем, что ожидает фронтенд
- Проверка: `docker compose up --build` с нуля работает без ошибок
- **Вывод ПМ:** финальное одобрение Backend части, разрешение на интеграцию с фронтендом

**Заключение от тестера (после Дня 4):**
- Функциональное тестирование через Postman/Swagger: все 30+ эндпоинтов
- Тестирование граничных случаев: пустые поля, невалидные данные, чужой ID
- Тестирование безопасности: запрос без токена → 401, чужой ресурс → 403/404
- Интеграционное тестирование: фронтенд подключён к бэку, полный E2E-сценарий
- Проверка файлов: XLSX открывается в Excel, PDF корректно отображается
- Проверка Docker: `docker compose up` — единственная команда для запуска
- **Итоговый вердикт тестера:** список багов (P1/P2/P3) или «готово к интеграционной сдаче»

---

## Интеграция Frontend ↔ Backend

После завершения обеих частей:

1. Убедиться, что бэкенд запущен на `http://localhost:8000`
2. В `.env` фронтенда: `VITE_API_URL=http://localhost:8000/api/v1`
3. Прогнать полный сценарий E2E:
   - Регистрация → Вход → Создать категорию → Создать рецепт с фото → Добавить в избранное → Посмотреть отчёт → Скачать XLSX → Добавить в планировщик → Скачать список покупок → Выйти
4. Убедиться, что тёмная тема и переключение языка работают на всех страницах
5. Проверить поведение при истёкшем access-токене (автоматический refresh)
