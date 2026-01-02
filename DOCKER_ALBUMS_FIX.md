# Исправление Albums API для Docker Compose

## Проблема
При запуске через `docker-compose` возникает ошибка `ERR_CONNECTION_RESET` при создании альбомов.

## Решение

### 1. Обновите docker-compose.yml

В секции `backend` добавлены переменные окружения для Supabase:

```yaml
environment:
  # ... существующие переменные ...
  # Supabase configuration for albums API
  SUPABASE_URL: ${SUPABASE_URL:-${REACT_APP_SUPABASE_URL:-}}
  SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY:-}
  REACT_APP_SUPABASE_URL: ${REACT_APP_SUPABASE_URL:-}
  REACT_APP_SUPABASE_ANON_KEY: ${REACT_APP_SUPABASE_ANON_KEY:-}
```

### 2. Создайте .env файл в корне проекта

Создайте файл `.env` (или обновите существующий):

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here

# Supabase Service Role Key (для backend)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Или можно использовать одно и то же значение
SUPABASE_URL=${REACT_APP_SUPABASE_URL}
```

**Где взять ключи:**
1. Откройте Supabase Dashboard: https://app.supabase.com
2. Выберите ваш проект
3. Settings → API
4. Скопируйте:
   - **Project URL** → `REACT_APP_SUPABASE_URL`
   - **anon public** → `REACT_APP_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ секретный ключ!)

### 3. Перезапустите контейнеры

```bash
# Остановите контейнеры
docker-compose down

# Пересоберите backend (если нужно)
docker-compose build backend

# Запустите снова
docker-compose up -d

# Проверьте логи backend
docker-compose logs -f backend
```

### 4. Проверьте, что backend работает

```bash
# Проверка health endpoint
curl http://localhost:5002/health

# Проверка albums test endpoint
curl http://localhost:5002/api/albums/test
```

### 5. Проверьте логи контейнеров

```bash
# Логи backend
docker-compose logs backend

# Логи frontend
docker-compose logs frontend

# Все логи
docker-compose logs
```

## Частые проблемы

### Проблема 1: Backend контейнер не запускается

**Решение:**
```bash
# Проверьте логи
docker-compose logs backend

# Пересоберите контейнер
docker-compose build backend
docker-compose up -d backend
```

### Проблема 2: Переменные окружения не передаются

**Решение:**
1. Убедитесь, что `.env` файл в корне проекта
2. Проверьте синтаксис в `.env` (без пробелов вокруг `=`)
3. Перезапустите контейнеры:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Проблема 3: Frontend не может подключиться к backend

**Решение:**
- Frontend обращается к `http://localhost:5002/api` - это правильно для браузера
- Убедитесь, что порт 5002 проброшен: `"5002:5000"` в docker-compose.yml
- Проверьте, что backend контейнер запущен: `docker-compose ps`

### Проблема 4: CORS ошибки

**Решение:**
В `backend/server.js` убедитесь, что разрешён origin frontend:
```javascript
const allowedOrigins = [
  'http://localhost:3000',  // Frontend порт
  'http://localhost:3001',
  // ...
];
```

### Проблема 5: Таблицы не созданы в Supabase

**Решение:**
1. Откройте Supabase Dashboard → SQL Editor
2. Выполните SQL из `albums_schema_fixed.sql`
3. Проверьте, что таблицы созданы:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_name IN ('albums', 'images');
   ```

## Проверка работоспособности

### Шаг 1: Проверьте backend
```bash
curl http://localhost:5002/health
# Должен вернуть: {"success":true,"message":"Server is running"}
```

### Шаг 2: Проверьте albums API
```bash
curl http://localhost:5002/api/albums/test
# Должен вернуть: {"success":true,"message":"Albums API is working!"}
```

### Шаг 3: Проверьте переменные в контейнере
```bash
docker-compose exec backend env | grep SUPABASE
# Должны показаться переменные SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY
```

### Шаг 4: Проверьте логи backend
```bash
docker-compose logs backend | grep -i "supabase\|albums\|error"
# Не должно быть критических ошибок
```

## Структура файлов

```
project/
├── .env                    # Переменные окружения (создайте если нет)
├── docker-compose.yml      # Обновлён с Supabase переменными
├── backend/
│   ├── .env               # Опционально, для локальной разработки
│   └── ...
└── ...
```

## Важные замечания

1. **Service Role Key** - это секретный ключ с полными правами. Не коммитьте его в git!
2. Добавьте `.env` в `.gitignore`:
   ```
   .env
   .env.local
   ```
3. Для production используйте Docker secrets или переменные окружения платформы (Vercel, Heroku, etc.)

## Быстрая проверка

Выполните все команды по порядку:

```bash
# 1. Проверьте .env файл
cat .env | grep SUPABASE

# 2. Перезапустите контейнеры
docker-compose down && docker-compose up -d

# 3. Проверьте логи
docker-compose logs backend | tail -20

# 4. Проверьте health
curl http://localhost:5002/health

# 5. Проверьте albums test
curl http://localhost:5002/api/albums/test
```

Если все шаги проходят успешно, albums API должен работать!


