# RecipeBook Frontend — Полная архитектурная документация

> Документ описывает **каждый файл**, **каждую папку**, принципы работы роутинга, стейта, API-общения, компонентов и сценарии пользователя.

---

## Содержание

1. [Точки входа](#1-точки-входа)
2. [Структура папок](#2-структура-папок)
3. [Роутинг](#3-роутинг)
4. [Стейт-менеджмент (Zustand)](#4-стейт-менеджмент-zustand)
5. [API-слой и HTTP-общение](#5-api-слой-и-http-общение)
6. [Хуки данных (TanStack Query)](#6-хуки-данных-tanstack-query)
7. [Компоненты UI](#7-компоненты-ui)
8. [Компоненты Layout](#8-компоненты-layout)
9. [Feature-компоненты](#9-feature-компоненты)
10. [Страницы (Pages)](#10-страницы-pages)
11. [Интернационализация (i18n)](#11-интернационализация-i18n)
12. [Утилиты](#12-утилиты)
13. [Моковые данные (MSW)](#13-моковые-данные-msw)
14. [Конфигурационные файлы](#14-конфигурационные-файлы)
15. [Жизненный цикл запроса](#15-жизненный-цикл-запроса)
16. [Тёмная тема](#16-тёмная-тема)
17. [Сценарии пользователя](#17-сценарии-пользователя)

---

## 1. Точки входа

### `src/main.jsx`
**Роль:** Самый первый файл, который запускается при старте приложения.

Что происходит:
1. Если среда — `development`, запускается **MSW** (Mock Service Worker) — перехватчик HTTP-запросов, имитирующий бэкенд. Это позволяет работать без реального сервера.
2. После запуска MSW (или сразу в production) рендерится корневой `<App />` внутри `React.StrictMode`.
3. StrictMode дважды вызывает функции в dev-режиме, чтобы найти побочные эффекты.

```
main.jsx
  └── MSW worker.start() (только в dev)
      └── ReactDOM.createRoot().render(<App />)
```

---

### `src/App.jsx`
**Роль:** Главный компонент-обёртка. Собирает все провайдеры вместе.

Что делает:
1. Создаёт **QueryClient** — кэш для всех серверных данных. Настройки: 1 повтор при ошибке, данные считаются свежими 60 секунд.
2. Рендерит `<BrowserRouter>` — включает React Router (URL-навигация).
3. Рендерит `<QueryClientProvider>` — даёт доступ к кэшу во всём приложении.
4. `<ThemeSync>` — внутренний компонент, который следит за `uiStore.theme` и добавляет/убирает класс `dark` на `<html>`. Также слушает системное предпочтение пользователя (prefers-color-scheme).
5. `<RouterProvider>` — рендерит страницы согласно роутеру.
6. `<Toaster>` — контейнер для всплывающих уведомлений react-hot-toast.

```
App.jsx
  └── QueryClientProvider (кэш данных)
      └── BrowserRouter (URL-роутинг)
          └── ThemeSync (управление dark/light классом)
          └── RouterProvider (страницы)
          └── Toaster (toast-уведомления)
```

---

### `src/index.css`
**Роль:** Базовые стили. Подключает Tailwind через директивы `@tailwind base/components/utilities`. Сбрасывает margin/padding у body, задаёт системный шрифт.

---

## 2. Структура папок

```
src/
├── api/          # Все HTTP-запросы. Каждый файл = один ресурс бэкенда.
├── components/
│   ├── ui/       # Базовые переиспользуемые компоненты (кнопки, инпуты, модалки)
│   ├── layout/   # Компоненты структуры страницы (шапка, сайдбар, нижняя навигация)
│   └── features/ # Компоненты конкретных фич (карточка рецепта, фильтры)
├── hooks/        # Кастомные React-хуки, оборачивающие TanStack Query
├── locales/      # JSON-файлы переводов (ru, en)
├── mocks/        # Mock Service Worker — эмуляция бэкенда в dev-режиме
├── pages/        # Компоненты страниц (по одному на каждый маршрут)
├── router/       # Конфигурация React Router
├── store/        # Zustand-хранилища глобального состояния
├── utils/        # Вспомогательные функции (форматирование, скачивание файлов)
├── App.jsx
├── i18n.js       # Конфигурация i18next
└── main.jsx
```

---

## 3. Роутинг

### `src/router/index.jsx`
**Роль:** Единственное место, где описаны все URL-маршруты приложения.

Используется `createBrowserRouter` из React Router v7 с вложенными маршрутами.

#### Схема маршрутов:

```
/auth                          → AuthPage        (публичный)
/                              → ProtectedRoute
  └── AppLayout
       ├── /                   → HomePage
       ├── /my-recipes         → MyRecipesPage
       ├── /recipes/new        → RecipeFormPage (создание)
       ├── /recipes/:id        → RecipeDetailPage
       ├── /recipes/:id/edit   → RecipeFormPage (редактирование)
       ├── /categories         → CategoriesPage
       ├── /favorites          → FavoritesPage
       ├── /reports            → ReportsPage
       ├── /menu-planner       → MenuPlannerPage
       └── /profile            → ProfilePage
* (все остальные)              → NotFoundPage
```

#### Как работает защита маршрутов:
`ProtectedRoute` — компонент-обёртка. Он читает `isAuthenticated` из `authStore`. Если пользователь **не авторизован** → немедленный редирект на `/auth`. Если **авторизован** → рендерится `<Outlet />` (то есть дочерний маршрут).

#### Вложенные маршруты и `<Outlet />`:
React Router v6+ использует паттерн Outlet. `AppLayout` рендерит шапку и сайдбар, а в центре — `<Outlet />`, куда вставляется текущая страница. Это позволяет не перерисовывать навигацию при смене страниц.

---

## 4. Стейт-менеджмент (Zustand)

### `src/store/authStore.js`
**Роль:** Хранит данные об авторизации пользователя. Персистируется в `localStorage`.

| Поле | Тип | Описание |
|------|-----|----------|
| `user` | object/null | Объект пользователя (id, name, email) |
| `accessToken` | string/null | JWT для авторизации запросов |
| `refreshToken` | string/null | JWT для обновления access-токена |
| `isAuthenticated` | boolean | Флаг: вошёл ли пользователь |

| Метод | Что делает |
|-------|-----------|
| `setTokens(access, refresh)` | Сохраняет токены, устанавливает isAuthenticated = true |
| `setUser(user)` | Сохраняет данные пользователя |
| `logout()` | Обнуляет всё, isAuthenticated = false |

**Persistence:** Данные сохраняются в `localStorage` под ключом `auth-storage`. При перезагрузке страницы пользователь остаётся авторизованным.

---

### `src/store/uiStore.js`
**Роль:** Хранит настройки интерфейса. Персистируется в `localStorage`.

| Поле | Тип | По умолчанию | Описание |
|------|-----|--------------|----------|
| `theme` | 'light'/'dark' | системное | Текущая тема |
| `language` | 'ru'/'en' | 'ru' | Язык интерфейса |
| `recipeView` | 'grid'/'list' | 'grid' | Вид отображения рецептов |

**Умная инициализация темы:** При первом запуске проверяет `window.matchMedia('(prefers-color-scheme: dark)')` — подхватывает системную тему пользователя.

---

## 5. API-слой и HTTP-общение

### `src/api/axiosInstance.js`
**Роль:** Единственный настроенный axios-клиент. Все API-модули используют его.

#### Что делает:
1. Создаёт axios с `baseURL = VITE_API_URL` (по умолчанию `http://localhost:8000/api/v1`)
2. **Request interceptor:** Перед каждым запросом читает `accessToken` из authStore и добавляет заголовок `Authorization: Bearer <token>`.
3. **Response interceptor (обработка 401):**
   - Если ответ 401 (Unauthorized) и запрос ещё не ретраился:
     - Берёт `refreshToken` из authStore
     - Делает POST `/auth/refresh` с refresh-токеном
     - Получает новые токены, сохраняет их
     - Повторяет исходный запрос с новым access-токеном
   - Если refresh тоже вернул ошибку → вызывает `logout()` → редирект на `/auth`

#### Схема JWT-обновления:
```
Запрос → 401 → refresh → новые токены → повтор запроса
                       → ошибка → logout → /auth
```

---

### `src/api/authApi.js`
| Функция | Метод | URL | Описание |
|---------|-------|-----|----------|
| `login(email, password)` | POST | `/auth/login` | Вход. Возвращает токены и user |
| `register(name, email, password)` | POST | `/auth/register` | Регистрация |
| `refreshToken(token)` | POST | `/auth/refresh` | Обновление токенов |
| `logout()` | POST | `/auth/logout` | Выход (инвалидирует токен на сервере) |

---

### `src/api/recipesApi.js`
| Функция | Метод | URL | Параметры |
|---------|-------|-----|-----------|
| `getRecipes(params)` | GET | `/recipes` | search, category_id, difficulty, max_time |
| `getRecipe(id)` | GET | `/recipes/:id` | — |
| `createRecipe(data)` | POST | `/recipes` | Объект рецепта |
| `updateRecipe(id, data)` | PUT | `/recipes/:id` | Обновлённые поля |
| `deleteRecipe(id)` | DELETE | `/recipes/:id` | — |
| `uploadRecipePhoto(id, file)` | POST | `/recipes/:id/photo` | FormData с файлом |

---

### `src/api/categoriesApi.js`
| Функция | Описание |
|---------|----------|
| `getCategories()` | Список всех категорий |
| `createCategory(data)` | Создать категорию |
| `updateCategory(id, data)` | Обновить |
| `deleteCategory(id)` | Удалить |
| `uploadCategoryPhoto(id, file)` | Загрузить фото категории |

---

### `src/api/favoritesApi.js`
| Функция | Описание |
|---------|----------|
| `getFavorites()` | Все избранные рецепты |
| `addFavorite(recipeId)` | Добавить в избранное |
| `removeFavorite(recipeId)` | Убрать из избранного |

---

### `src/api/menuPlanApi.js`
| Функция | Описание |
|---------|----------|
| `getMenuPlan(weekStart)` | Получить план на неделю (передаётся дата понедельника) |
| `setMenuSlot(date, mealType, recipeId)` | Назначить рецепт в слот |
| `deleteMenuSlot(id)` | Удалить слот |
| `downloadShoppingList(weekStart)` | Скачать PDF списка покупок |

---

### `src/api/reportsApi.js`
| Функция | Описание |
|---------|----------|
| `getFavoritesReport(sortBy)` | Данные отчёта «Избранные» |
| `getCategoriesReport(sortBy)` | Данные отчёта «По категориям» |
| `downloadFavoritesXlsx()` / `downloadFavoritesPdf()` | Скачать отчёт |
| `downloadCategoriesXlsx()` / `downloadCategoriesPdf()` | Скачать отчёт |

---

## 6. Хуки данных (TanStack Query)

Хуки — прослойка между компонентами и API. Они управляют кэшем, загрузкой, ошибками и инвалидацией.

### `src/hooks/useRecipes.js`

| Хук | Тип | Ключ кэша | Описание |
|-----|-----|-----------|----------|
| `useRecipes(params)` | Query | `['recipes', params]` | Список рецептов с фильтрами |
| `useRecipe(id)` | Query | `['recipes', id]` | Один рецепт по id |
| `useCreateRecipe()` | Mutation | — | Создать. Инвалидирует `['recipes']` |
| `useUpdateRecipe()` | Mutation | — | Обновить. Инвалидирует `['recipes']` и `['recipes', id]` |
| `useDeleteRecipe()` | Mutation | — | Удалить. Инвалидирует `['recipes']` |
| `useUploadPhoto()` | Mutation | — | Загрузить фото рецепта |

Все мутации показывают toast при успехе/ошибке.

---

### `src/hooks/useCategories.js`

| Хук | Тип | Описание |
|-----|-----|----------|
| `useCategories()` | Query | Все категории, кэш `['categories']` |
| `useCreateCategory()` | Mutation | Создать. Инвалидирует `['categories']` |
| `useUpdateCategory()` | Mutation | Обновить |
| `useDeleteCategory()` | Mutation | Удалить |
| `useUploadCategoryPhoto()` | Mutation | Загрузить фото категории |

---

### `src/hooks/useFavorites.js`

| Хук | Описание |
|-----|----------|
| `useFavorites()` | Список избранного, кэш `['favorites']` |
| `useAddFavorite()` | Добавить. Инвалидирует `['favorites']` и `['recipes']` |
| `useRemoveFavorite()` | Убрать из избранного |

---

### `src/hooks/useReports.js`

| Хук | Описание |
|-----|----------|
| `useFavoritesReport(sortBy)` | Данные для таблицы отчёта избранных |
| `useCategoriesReport(sortBy)` | Данные для таблицы отчёта по категориям |
| `downloadFavoritesXlsx()` и др. | Async-функции, вызываемые по кнопке (не хуки) |

---

## 7. Компоненты UI

`src/components/ui/` — «атомарные» компоненты без бизнес-логики.

### `Button.jsx`
Кнопка с вариантами стилей и размерами.

| Prop | Значения |
|------|---------|
| `variant` | `primary` (оранжевый), `secondary`, `danger` (красный), `ghost`, `outline` |
| `size` | `sm`, `md`, `lg`, `icon` |
| `isLoading` | boolean — показывает спиннер, блокирует клик |
| `disabled` | стандартный HTML |

---

### `Input.jsx`
Содержит три компонента:

- **`Input`** — текстовое поле с label и отображением ошибки
- **`Textarea`** — многострочное поле
- **`Select`** — выпадающий список

Все поддерживают темную тему и интеграцию с React Hook Form через `ref` и `...props`.

---

### `Card.jsx`
Простая карточка-обёртка с тенью и скруглёнными углами. Принимает `onClick` для кликабельных карточек.

---

### `Badge.jsx`
Маленький цветной ярлык. Цвета: `orange`, `green`, `blue`, `red`, `stone`.

---

### `Modal.jsx`
Содержит два компонента:

- **`Modal`** — базовое модальное окно с заголовком, содержимым и подвалом. Закрывается по клику на оверлей или ESC.
- **`ConfirmModal`** — модальное окно подтверждения с кнопками «Отмена» / «Подтвердить». Используется перед удалением.

---

### `Spinner.jsx`
Содержит два компонента:

- **`Spinner`** — вращающийся индикатор загрузки. Размеры: `sm`, `md`, `lg`.
- **`PageSpinner`** — полноэкранный спиннер поверх страницы.

---

## 8. Компоненты Layout

`src/components/layout/` — компоненты структуры страницы.

### `AppLayout.jsx`
**Роль:** Главный контейнер всех защищённых страниц.

Структура:
```
AppLayout
├── Sidebar (только на desktop, lg+)
└── main
    ├── [Outlet — текущая страница]
    └── BottomNav (только на mobile)
```

---

### `Sidebar.jsx`
**Роль:** Боковая навигация на desktop (скрыта на mobile через `hidden lg:flex`).

Содержит 7 ссылок с иконками Lucide:
1. Главная (`/`) — иконка Home
2. Мои рецепты (`/my-recipes`) — иконка BookOpen
3. Категории (`/categories`) — иконка Tag
4. Избранное (`/favorites`) — иконка Heart
5. Отчёты (`/reports`) — иконка BarChart2
6. Планировщик (`/menu-planner`) — иконка Calendar
7. Профиль (`/profile`) — иконка User

Активная ссылка подсвечивается оранжевым через `NavLink` и `isActive`.

---

### `BottomNav.jsx`
**Роль:** Нижняя навигация на mobile (скрыта на desktop через `lg:hidden`).

5 иконок: Главная, Рецепты, Категории, Избранное, Профиль. Текстовые подписи под иконками.

---

### `ProtectedRoute.jsx`
**Роль:** Охранник маршрутов.

```jsx
const isAuthenticated = useAuthStore(s => s.isAuthenticated)
return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />
```

Если токена нет в localStorage — пользователь идёт на `/auth`.

---

## 9. Feature-компоненты

`src/components/features/` — компоненты конкретных функций.

### `RecipeCard.jsx`
**Роль:** Отображает один рецепт как карточку (grid) или строку (list).

Принимает:
- `recipe` — объект рецепта
- `view` — `'grid'` | `'list'`
- `showActions` — показывать кнопки редактирования/удаления
- `onDelete` — callback при удалении
- `isFavorite` — boolean
- `onFavoriteToggle` — callback

Содержит:
- Фото рецепта (или заглушку)
- Название, категорию (CategoryBadge), время, сложность
- Кнопку лайка (сердце)
- При `showActions`: кнопки «Редактировать» → `/recipes/:id/edit` и «Удалить» → вызывает `onDelete`

---

### `RecipeFilters.jsx`
**Роль:** Панель фильтрации рецептов.

Содержит:
- Поле поиска по тексту
- Select категории (использует `useCategories()`)
- Select сложности (easy/medium/hard)
- Input максимального времени (минуты)

Вызывает `onChange(filters)` при любом изменении фильтра.

---

### `CategoryBadge.jsx`
**Роль:** Маленький цветной бейдж с названием категории.

Получает `categoryId` или `category`-объект, отображает цветную точку + текст.

---

### `EmptyState.jsx`
**Роль:** Красивая заглушка для пустых списков.

Варианты (`type`): `recipes`, `favorites`, `categories`, `search`.
Каждый вариант имеет SVG-иллюстрацию, заголовок, описание и опциональную кнопку действия.

---

## 10. Страницы (Pages)

`src/pages/` — компонент каждой страницы. Каждая страница = один маршрут.

---

### `AuthPage.jsx` (`/auth`)
**Роль:** Страница входа и регистрации.

Структура:
- Две вкладки (Войти / Зарегистрироваться)
- Форма на React Hook Form + Zod-схема
- При успешном входе: `authStore.setTokens()` + `authStore.setUser()` + редирект на `/`
- Поля входа: email, пароль
- Поля регистрации: имя, email, пароль, подтверждение пароля
- Ошибки сервера — через toast

---

### `HomePage.jsx` (`/`)
**Роль:** Главная лента всех рецептов.

Логика:
1. Использует `useRecipes(filters)` для получения рецептов
2. `RecipeFilters` меняет `filters` в локальном стейте → перезапрашивает рецепты
3. Кнопки переключения вида (grid/list) меняют `uiStore.recipeView`
4. `useFavorites()` + `useAddFavorite()` / `useRemoveFavorite()` для управления избранным
5. Карточки кликабельны → `/recipes/:id`

---

### `MyRecipesPage.jsx` (`/my-recipes`)
**Роль:** Управление своими рецептами.

Отличия от HomePage:
- Кнопка «+ Добавить рецепт» → `/recipes/new`
- Каждая карточка показывает кнопки «Редактировать» и «Удалить»
- Удаление через `ConfirmModal` + `useDeleteRecipe()`

---

### `RecipeDetailPage.jsx` (`/recipes/:id`)
**Роль:** Полная страница одного рецепта.

Содержит:
- Большое фото рецепта
- Название, описание, категорию, время, сложность
- Таблицу ингредиентов (название + количество)
- Пронумерованные шаги приготовления
- Кнопку «В избранное» (залитое сердце если добавлено)
- Кнопки «Редактировать» / «Удалить» (только если `recipe.user_id === currentUser.id`)
- Кнопку «Назад»

---

### `RecipeFormPage.jsx` (`/recipes/new` и `/recipes/:id/edit`)
**Роль:** Единая форма создания и редактирования рецепта.

Логика:
- Если в URL есть `:id` → режим редактирования, загружает данные через `useRecipe(id)` и заполняет форму
- Если без `:id` → режим создания
- Форма: React Hook Form + Zod (`recipeSchema`)
- Поля: название, описание, категория, сложность, время приготовления
- Динамические ингредиенты: `useFieldArray` для добавления/удаления строк (название + количество)
- Динамические шаги: `useFieldArray` для добавления/удаления/переупорядочивания
- Загрузка фото: `<input type="file">` → preview через `URL.createObjectURL()` → при сохранении `useUploadPhoto()`
- При создании: `useCreateRecipe()` → после получения id → `uploadPhoto()` → toast → редирект на `/recipes/:id`
- При редактировании: `useUpdateRecipe()` → при наличии нового фото `uploadPhoto()` → toast

---

### `CategoriesPage.jsx` (`/categories`)
**Роль:** Управление категориями рецептов.

Логика:
- Список категорий через `useCategories()`
- Каждая карточка: цветной квадрат, название, количество рецептов, кнопки редактирования/удаления
- Клик на категорию → переход на HomePage с фильтром по этой категории
- Кнопка «+ Создать» → открывает модальное окно формы
- Форма категории: название, цвет (12 пресетов + авто), опционально фото
- Удаление через `ConfirmModal`

---

### `FavoritesPage.jsx` (`/favorites`)
**Роль:** Список избранных рецептов.

Логика:
- Загружает данные через `useFavorites()`
- Grid/list переключение из `uiStore`
- На каждой карточке: кнопка «Убрать из избранного» → `useRemoveFavorite()`
- При пустом списке — `EmptyState` с предложением добавить рецепты

---

### `ReportsPage.jsx` (`/reports`)
**Роль:** Аналитика и экспорт данных.

Структура:
- Две вкладки: «Избранные рецепты» / «По категориям»
- Каждая вкладка:
  - Краткая статистика (общее количество записей)
  - Sortable таблица (клик по заголовку колонки меняет сортировку)
  - Две кнопки: «Скачать XLSX» / «Скачать PDF» → вызывают download-функции

---

### `MenuPlannerPage.jsx` (`/menu-planner`)
**Роль:** Планировщик меню на неделю.

Структура:
- Навигация по неделям (← текущая неделя →)
- Таблица 7×3: колонки = дни (Пн–Вс), строки = приёмы пищи (Завтрак/Обед/Ужин)
- В каждой ячейке: название назначенного рецепта + кнопка удаления, или кнопка «+»
- Клик «+» → модальное окно с поиском рецептов → выбор → `setMenuSlot()`
- Кнопка «Список покупок» → `downloadShoppingList(weekStart)` → скачивает PDF

---

### `ProfilePage.jsx` (`/profile`)
**Роль:** Профиль пользователя и настройки интерфейса.

Содержит:
- Аватар (инициалы имени), имя, email
- Переключатель темы: светлая/тёмная → `uiStore.setTheme()`
- Переключатель языка: Русский/English → `uiStore.setLanguage()` + `i18n.changeLanguage()`
- Переключатель вида рецептов: Сетка/Список → `uiStore.setRecipeView()`
- Кнопка «Выйти» → `authStore.logout()` + редирект на `/auth`
- Все изменения применяются немедленно, без кнопки «Сохранить»

---

### `NotFoundPage.jsx` (`*`)
**Роль:** Страница 404.

SVG-иллюстрация + текст «Страница не найдена» + кнопка «На главную».

---

## 11. Интернационализация (i18n)

### `src/i18n.js`
Конфигурирует i18next:
- Два языка: `ru` (русский, по умолчанию) и `en` (английский)
- `fallbackLng: 'ru'` — если ключ не найден в en, берётся из ru

### `src/locales/ru/translation.json` и `src/locales/en/translation.json`
JSON-файлы переводов, организованные по секциям:

```json
{
  "nav": { "home": "Главная", "myRecipes": "Мои рецепты", ... },
  "auth": { "login": "Войти", "register": "Регистрация", ... },
  "recipe": { "title": "Название", "ingredients": "Ингредиенты", ... },
  "categories": { "title": "Категории", "create": "Создать", ... },
  "favorites": { "title": "Избранное", ... },
  "reports": { "favorites": "Избранные рецепты", ... },
  "menuPlanner": { "title": "Планировщик меню", ... },
  "profile": { "title": "Профиль", "theme": "Тема", ... },
  "notFound": { "title": "Страница не найдена", ... },
  "common": { "save": "Сохранить", "cancel": "Отмена", ... }
}
```

В компонентах используется хук `const { t } = useTranslation()` → `t('nav.home')`.

---

## 12. Утилиты

### `src/utils/formatters.js`
| Функция | Входные данные | Выход |
|---------|----------------|-------|
| `formatCookTime(minutes)` | 90 | `"1 ч 30 мин"` |
| `formatDifficulty(difficulty)` | `'easy'` | `"Легко"` |
| `formatDifficultyEn(difficulty)` | `'hard'` | `"Hard"` |
| `formatDate(dateString)` | `'2024-01-15'` | `"15.01.2024"` |
| `getWeekStart(date)` | Date объект | Date (понедельник недели) |
| `formatDateISO(date)` | Date объект | `'2024-01-15'` |

---

### `src/utils/categoryColor.js`
| Экспорт | Описание |
|---------|----------|
| `CATEGORY_COLORS` | Массив из 12 цветов (id, name, Tailwind-классы) |
| `getCategoryColor(colorId, name)` | Возвращает цвет по id или авто по хешу имени |

---

### `src/utils/downloadFile.js`
```js
export async function downloadFile(url, filename)
```
Делает GET-запрос с `responseType: 'blob'`, создаёт временную ссылку и программно кликает на неё — файл скачивается браузером.

---

## 13. Моковые данные (MSW)

`src/mocks/` — используется только в development. Позволяет запустить фронтенд без бэкенда.

### `src/mocks/browser.js`
Создаёт MSW Service Worker через `setupWorker(handlers)`.

### `src/mocks/handlers.js`
Перехватчики HTTP-запросов. Для каждого API-эндпоинта есть хендлер:
- Читает/пишет данные из `data.js` (в памяти браузера)
- Эмулирует задержки сети (200–400мс)
- Возвращает JSON как реальный сервер

Реализованные хендлеры:
- `POST /auth/login` — проверяет email/пароль, возвращает токены
- `POST /auth/register` — создаёт нового пользователя
- `GET /recipes` — возвращает рецепты с поддержкой фильтров (search, category_id, difficulty, max_time)
- `POST /recipes` — создаёт рецепт, добавляет в массив
- `PUT /recipes/:id` — обновляет рецепт
- `DELETE /recipes/:id` — удаляет
- `POST /recipes/:id/photo` — конвертирует файл в base64, сохраняет как photoUrl
- `GET/POST/DELETE /categories` — CRUD категорий
- `GET/POST/DELETE /favorites` — управление избранным
- `GET /reports/favorites` и `/reports/categories` — моковые отчёты
- `GET /menu-plan` — план на неделю
- `PUT /menu-plan` — назначение рецепта в слот
- `DELETE /menu-plan/:id` — удаление слота

### `src/mocks/data.js`
In-memory база данных для MSW:

```js
export const db = {
  users: [{ id: 1, name: 'Тест Пользователь', email: 'test@test.com', password: 'test123' }],
  recipes: [/* 5 рецептов с ингредиентами и шагами */],
  categories: [/* 5 категорий */],
  favorites: [/* 2 рецепта в избранном */],
  menuPlan: [],
}
```

---

## 14. Конфигурационные файлы

### `package.json`
Ключевые зависимости:
| Пакет | Версия | Назначение |
|-------|--------|-----------|
| react | 19.2.4 | UI-библиотека |
| react-router-dom | 7.14.1 | Клиентский роутинг |
| @tanstack/react-query | 5.99.0 | Серверный стейт, кэш |
| zustand | 5.0.12 | Глобальный стейт |
| axios | 1.15.0 | HTTP-клиент |
| react-hook-form | 7.72.1 | Управление формами |
| zod | 4.3.6 | Схемная валидация |
| i18next | 26.0.4 | Интернационализация |
| lucide-react | 1.8.0 | SVG-иконки |
| react-hot-toast | 2.6.0 | Toast-уведомления |
| msw | 2.13.3 | Mock Service Worker |
| tailwindcss | 3.4.19 | CSS-утилиты |

### `vite.config.js`
Стандартная конфигурация Vite с React-плагином.

### `tailwind.config.js`
```js
module.exports = {
  darkMode: 'class',   // тёмная тема через CSS-класс .dark на <html>
  content: ['./index.html', './src/**/*.{js,jsx}'],
}
```

### `.env`
```
VITE_API_URL=http://localhost:8000/api/v1
```

---

## 15. Жизненный цикл запроса

### Пример: пользователь открывает страницу `/my-recipes`

```
1. Браузер обращается к /my-recipes
2. React Router рендерит: ProtectedRoute → AppLayout → MyRecipesPage
3. ProtectedRoute читает isAuthenticated из localStorage → true → рендерит Outlet
4. MyRecipesPage вызывает useRecipes() → TanStack Query проверяет кэш
   a. Кэш пуст → делает GET /recipes через axiosInstance
   b. axiosInstance в Request interceptor добавляет Authorization: Bearer <token>
   c. MSW (в dev) перехватывает запрос → возвращает mock-данные
   d. TanStack Query сохраняет данные в кэш ['recipes']
   e. Компонент ре-рендерится с данными
5. Пользователь нажимает «Удалить» на карточке
   a. Открывается ConfirmModal
   b. Пользователь подтверждает
   c. Вызывается useDeleteRecipe().mutate(id)
   d. DELETE /recipes/:id → MSW удаляет из db.recipes
   e. Mutation успешна → queryClient.invalidateQueries(['recipes'])
   f. TanStack Query делает новый GET /recipes
   g. Список обновляется без перезагрузки страницы
   h. Toast: «Рецепт удалён»
```

---

### Жизненный цикл JWT refresh

```
1. Пользователь долго не заходил → access-токен истёк
2. Любой запрос возвращает 401
3. axiosInstance response interceptor ловит 401
4. Берёт refreshToken из authStore
5. POST /auth/refresh { refresh_token }
6. Получает новые access + refresh токены
7. Сохраняет через authStore.setTokens()
8. Повторяет исходный запрос с новым access-токеном
9. Пользователь ничего не заметил
```

---

## 16. Тёмная тема

Принцип работы:
1. Tailwind настроен на `darkMode: 'class'`
2. В `App.jsx` компонент `ThemeSync` следит за `uiStore.theme`
3. При изменении темы: `document.documentElement.classList.toggle('dark', theme === 'dark')`
4. Tailwind применяет все `dark:` классы при наличии `.dark` на `<html>`

Палитра цветов:
- Акцент: `orange-500` / `orange-400`
- Фон (light): `amber-50`, `stone-100`
- Фон (dark): `stone-900`, `stone-800`
- Карточки (light): `white` / карточки (dark): `stone-800`
- Текст (light): `stone-800` / текст (dark): `stone-100`

---

## 17. Сценарии пользователя

### Сценарий 1: Первый запуск (новый пользователь)

```
Пользователь открывает http://localhost:5173/
→ ProtectedRoute: isAuthenticated = false
→ Редирект на /auth
→ AuthPage: вкладка «Войти» по умолчанию
→ Пользователь переходит на вкладку «Зарегистрироваться»
→ Заполняет: имя «Иван», email «ivan@mail.ru», пароль «secret123», подтверждение «secret123»
→ Submit → Zod валидирует форму
→ register(name, email, password) → POST /auth/register
→ Получает { access_token, refresh_token, user }
→ authStore.setTokens() + authStore.setUser()
→ Редирект на /
→ HomePage: список рецептов (пустой или с данными от сервера)
```

---

### Сценарий 2: Создание рецепта

```
Пользователь на MyRecipesPage
→ Нажимает «+ Добавить рецепт»
→ Переход на /recipes/new
→ RecipeFormPage в режиме создания
→ Заполняет: название «Борщ», описание, выбирает категорию «Супы»
→ Выбирает сложность «Средняя», время 120 минут
→ Добавляет ингредиенты (кнопка «+ Добавить ингредиент»):
    - «Свёкла», «2 шт»
    - «Капуста», «300 г»
→ Добавляет шаги (кнопка «+ Добавить шаг»):
    - «Нарезать свёклу и обжарить»
    - «Добавить капусту и варить 30 минут»
→ Загружает фото: клик на область → выбор файла → появляется превью
→ Нажимает «Создать рецепт»
→ Zod валидирует все поля
→ createRecipe(data) → POST /recipes → получает { id: 6, ... }
→ Если есть фото: uploadRecipePhoto(6, file) → POST /recipes/6/photo
→ invalidateQueries(['recipes'])
→ Toast: «Рецепт создан!»
→ Редирект на /recipes/6
```

---

### Сценарий 3: Поиск и фильтрация рецептов

```
Пользователь на HomePage
→ Вводит в строку поиска «борщ»
→ Через 300мс debounce фильтр обновляется
→ useRecipes({ search: 'борщ' }) → GET /recipes?search=борщ
→ Список обновляется: показывает только «Борщ»

→ Дополнительно выбирает категорию «Супы»
→ GET /recipes?search=борщ&category_id=2

→ Выбирает сложность «Лёгкая»
→ GET /recipes?search=борщ&category_id=2&difficulty=easy

→ Устанавливает максимальное время 60 минут
→ GET /recipes?search=борщ&category_id=2&difficulty=easy&max_time=60

→ Если ничего не найдено → EmptyState «Ничего не найдено» с кнопкой «Сбросить фильтры»
```

---

### Сценарий 4: Добавление в избранное

```
Пользователь видит карточку рецепта на HomePage
→ Нажимает на иконку сердечка (пустое)
→ useAddFavorite().mutate(recipeId)
→ POST /favorites/recipeId
→ invalidateQueries(['favorites']) + invalidateQueries(['recipes'])
→ Сердечко становится залитым красным
→ Toast: «Добавлено в избранное»

Переходит на /favorites
→ Видит рецепт в списке избранного
→ Нажимает залитое сердечко
→ useRemoveFavorite().mutate(recipeId)
→ DELETE /favorites/recipeId
→ Рецепт исчезает из списка
→ Toast: «Удалено из избранного»
```

---

### Сценарий 5: Планирование меню

```
Пользователь переходит на /menu-planner
→ Видит таблицу текущей недели (Пн–Вс × Завтрак/Обед/Ужин)
→ getMenuPlan(weekStart) → GET /menu-plan?week_start=2024-01-15
→ Все слоты пустые (кнопки «+»)

→ Нажимает «+» в ячейке «Вторник / Обед»
→ Открывается модальное окно с поиском рецептов
→ Вводит «Борщ» → список фильтруется
→ Нажимает на «Борщ»
→ setMenuSlot('2024-01-16', 'lunch', 6) → PUT /menu-plan
→ Ячейка «Вт/Обед» показывает «Борщ» с кнопкой удаления

→ Нажимает стрелку «→» → переходит на следующую неделю
→ GET /menu-plan?week_start=2024-01-22

→ Возвращается на текущую неделю
→ Нажимает «Список покупок»
→ downloadShoppingList('2024-01-15') → GET /menu-plan/shopping-list/pdf?week_start=2024-01-15
→ PDF скачивается в браузер
```

---

### Сценарий 6: Просмотр отчётов и экспорт

```
Пользователь переходит на /reports
→ Вкладка «Избранные рецепты» по умолчанию
→ useFavoritesReport() → GET /reports/favorites
→ Таблица: Название, Категория, Время, Сложность, Дата добавления

→ Нажимает на заголовок «Время» → сортировка по времени ↑
→ Нажимает ещё раз → сортировка ↓

→ Нажимает «Скачать XLSX»
→ downloadFavoritesXlsx() → GET /reports/favorites/xlsx
→ Файл favorites-report.xlsx скачивается

→ Переходит на вкладку «По категориям»
→ getCategoriesReport() → GET /reports/categories
→ Таблица: Категория, Количество рецептов

→ Нажимает «Скачать PDF»
→ categories-report.pdf скачивается
```

---

### Сценарий 7: Смена темы и языка

```
Пользователь переходит на /profile
→ Видит: имя «Иван», email «ivan@mail.ru»

→ Нажимает «Тёмная» (переключатель темы)
→ uiStore.setTheme('dark')
→ ThemeSync в App.jsx: document.documentElement.classList.add('dark')
→ Весь интерфейс немедленно переключается в тёмные цвета
→ Настройка сохраняется в localStorage

→ Нажимает «English» (переключатель языка)
→ uiStore.setLanguage('en')
→ i18n.changeLanguage('en')
→ Весь текст в интерфейсе переключается на английский без перезагрузки
→ Настройка сохраняется в localStorage

→ Нажимает «Список» (переключатель вида)
→ uiStore.setRecipeView('list')
→ На всех страницах с рецептами карточки отображаются строками
```

---

### Сценарий 8: Истечение токена (автоматическое обновление)

```
Пользователь работает с сайтом
→ Access-токен истёк (через 15–60 минут, зависит от бэка)
→ Пользователь кликает на «Избранное»
→ GET /favorites → бэкенд возвращает 401
→ axiosInstance interceptor ловит 401
→ Запрашивает новый токен: POST /auth/refresh
→ Бэкенд возвращает новые токены
→ authStore.setTokens() сохраняет их
→ Исходный запрос GET /favorites повторяется с новым токеном
→ Пользователь получает данные — ничего не заметил

Если refresh-токен тоже истёк:
→ authStore.logout()
→ Редирект на /auth
→ Toast: «Сессия истекла, войдите снова»
```

---

### Сценарий 9: Редактирование категории

```
Пользователь на /categories
→ Видит карточку «Супы» с синим цветом
→ Нажимает иконку «Редактировать»
→ Открывается Modal с заполненной формой: название «Супы», цвет «blue»
→ Меняет название на «Первые блюда»
→ Выбирает цвет «green»
→ Нажимает «Сохранить»
→ updateCategory(2, { name: 'Первые блюда', color: 'green' }) → PUT /categories/2
→ invalidateQueries(['categories'])
→ Карточка обновляется: «Первые блюда» с зелёным цветом
→ Toast: «Категория обновлена»
```

---

### Сценарий 10: Выход из системы

```
Пользователь на /profile
→ Нажимает «Выйти»
→ authStore.logout() → user = null, tokens = null, isAuthenticated = false
→ localStorage очищается (auth-storage удаляется)
→ window.location.href = '/auth' (или Navigate)
→ AuthPage: форма входа
→ Попытка вернуться на / → ProtectedRoute → редирект обратно на /auth
```

---

*Документ актуален для версии проекта с MSW-моками. При подключении реального бэкенда поведение идентично — меняется только источник данных.*
