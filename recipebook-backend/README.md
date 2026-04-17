# RecipeBook Backend (Go + Gin + PostgreSQL)

## Запуск через Docker Compose (рекомендуется)

```bash
# Скопировать .env
cp .env.example .env

# Запустить (поднимет PostgreSQL + бэкенд)
docker compose up --build
```

API доступно на `http://localhost:8000`

## Запуск локально (без Docker)

Требования: Go 1.22+, PostgreSQL 15

```bash
cp .env.example .env
# Отредактировать .env — указать реальные данные БД

go mod tidy
go run ./cmd/server
```

## Переменные окружения (.env)

| Переменная | Значение по умолчанию | Описание |
|---|---|---|
| `DB_HOST` | `localhost` | Хост PostgreSQL |
| `DB_PORT` | `5432` | Порт PostgreSQL |
| `DB_USER` | `recipebook` | Пользователь БД |
| `DB_PASSWORD` | `recipebook` | Пароль БД |
| `DB_NAME` | `recipebook` | Имя БД |
| `JWT_SECRET` | `change-me-in-production` | Секрет JWT |
| `ACCESS_TOKEN_TTL_MINUTES` | `30` | TTL access-токена (мин) |
| `REFRESH_TOKEN_TTL_DAYS` | `7` | TTL refresh-токена (дней) |
| `UPLOAD_DIR` | `./uploads` | Папка для загружаемых фото |
| `PORT` | `8000` | Порт сервера |
| `CORS_ORIGIN` | `http://localhost:5173` | Разрешённый Origin для CORS |

## API эндпоинты

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout          (требует JWT)

GET    /api/v1/recipes              ?search=&category_id=&difficulty=&max_time=
POST   /api/v1/recipes
GET    /api/v1/recipes/:id
PUT    /api/v1/recipes/:id
DELETE /api/v1/recipes/:id
POST   /api/v1/recipes/:id/photo    (multipart/form-data)

GET    /api/v1/categories
POST   /api/v1/categories
PUT    /api/v1/categories/:id
DELETE /api/v1/categories/:id

GET    /api/v1/favorites
POST   /api/v1/favorites/:recipe_id
DELETE /api/v1/favorites/:recipe_id

GET    /api/v1/reports/favorites
GET    /api/v1/reports/categories
GET    /api/v1/reports/favorites/xlsx
GET    /api/v1/reports/favorites/pdf
GET    /api/v1/reports/categories/xlsx
GET    /api/v1/reports/categories/pdf

GET    /api/v1/menu-plan            ?week_start=YYYY-MM-DD
PUT    /api/v1/menu-plan
DELETE /api/v1/menu-plan/:id
GET    /api/v1/menu-plan/shopping-list/pdf  ?week_start=YYYY-MM-DD
```

## Структура проекта

```
recipebook-backend/
├── cmd/server/main.go           # Точка входа, роутинг Gin
├── internal/
│   ├── config/config.go         # Чтение ENV
│   ├── db/db.go                 # GORM подключение + AutoMigrate
│   ├── models/                  # GORM модели
│   ├── handlers/                # HTTP обработчики
│   ├── middleware/auth.go       # JWT middleware
│   ├── repository/              # Запросы к БД
│   └── utils/                   # JWT, файлы, отчёты
├── uploads/                     # Загруженные фото
├── Dockerfile
├── docker-compose.yml
└── .env.example
```
