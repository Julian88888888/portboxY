# Исправление: Backend контейнер падает

## Проблема
```
Error: Cannot find module '@supabase/supabase-js'
```

Backend контейнер не может найти модуль `@supabase/supabase-js`, хотя он есть в `package.json`.

## Решение

### Шаг 1: Пересоберите backend контейнер

```bash
# Остановите контейнеры
docker-compose down

# Пересоберите backend с установкой всех зависимостей
docker-compose build --no-cache backend

# Запустите снова
docker-compose up -d

# Проверьте логи
docker-compose logs -f backend
```

### Шаг 2: Если проблема остаётся - установите зависимости вручную

```bash
# Войдите в контейнер
docker-compose exec backend sh

# Внутри контейнера
cd /app
npm install

# Выйдите
exit
```

### Шаг 3: Проверьте работоспособность

```bash
# Health check
curl http://localhost:5002/health

# Albums test
curl http://localhost:5002/api/albums/test
```

## Альтернативное решение

Если проблема с volume mount, попробуйте:

1. Удалите volume с node_modules:
```bash
docker-compose down -v
docker-compose build --no-cache backend
docker-compose up -d
```

2. Или установите зависимости локально перед запуском:
```bash
cd backend
npm install
cd ..
docker-compose up -d
```

## Проверка

После пересборки проверьте логи:
```bash
docker-compose logs backend | grep -i "error\|supabase\|listening"
```

Должно быть:
- ✅ Нет ошибок "Cannot find module"
- ✅ Сервер запущен: "Server running on port 5000"
- ✅ Albums API доступен: "Albums API: http://localhost:5002/api/albums"

