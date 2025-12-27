# Настройка Production для Vercel

## Проблема

Frontend на Vercel (`https://portbox-y.vercel.app`) пытается обратиться к `localhost:5002`, который недоступен из интернета.

## Решения

### Вариант 1: Развернуть Backend на Production сервере (Рекомендуется)

1. **Разверните backend на production сервере** (например, Railway, Render, Heroku, или VPS):
   - Backend должен быть доступен по публичному URL (например, `https://api.portbox.com`)

2. **Настройте переменные окружения в Vercel:**
   - Перейдите в Vercel Dashboard → Ваш проект → Settings → Environment Variables
   - Добавьте:
     ```
     REACT_APP_API_URL=https://your-backend-url.com/api
     ```
   - Убедитесь, что переменная добавлена для **Production**, **Preview**, и **Development**

3. **Обновите CORS на backend:**
   - Убедитесь, что ваш production backend разрешает запросы с `https://portbox-y.vercel.app`
   - CORS уже настроен в `backend/server.js` для поддержки Vercel доменов

4. **Перезапустите deployment в Vercel:**
   - После добавления переменных окружения, Vercel автоматически перезапустит deployment

### Вариант 2: Использовать только Supabase (Для Albums API)

Если вы используете Supabase для albums API, можно полностью убрать зависимость от backend:

1. **Убедитесь, что все операции с albums используют Supabase:**
   - Albums API уже использует Supabase для хранения данных
   - Изображения загружаются в Supabase Storage

2. **Обновите `albumsService.js` для использования только Supabase:**
   - Если backend не нужен для albums, можно напрямую использовать Supabase client

3. **Настройте Supabase CORS:**
   - В Supabase Dashboard → Settings → API
   - Добавьте в CORS: `https://portbox-y.vercel.app`

### Вариант 3: Использовать Vercel Serverless Functions (Для Backend API)

Если нужно сохранить backend логику, можно использовать Vercel Serverless Functions:

1. **Создайте папку `api/` в корне проекта:**
   ```bash
   mkdir -p api/albums
   ```

2. **Создайте serverless functions для albums API**

3. **Обновите `REACT_APP_API_URL` в Vercel:**
   ```
   REACT_APP_API_URL=https://portbox-y.vercel.app/api
   ```

## Текущая настройка CORS

Backend уже настроен для поддержки:
- ✅ `https://portbox-y.vercel.app`
- ✅ `https://*.vercel.app` (все preview deployments)
- ✅ Правильная обработка preflight запросов (OPTIONS)

## Проверка

После настройки:

1. **Проверьте переменные окружения в Vercel:**
   - Settings → Environment Variables
   - Убедитесь, что `REACT_APP_API_URL` указывает на production backend

2. **Проверьте CORS в браузере:**
   - Откройте DevTools → Network
   - Проверьте, что запросы к API проходят успешно
   - Проверьте заголовки ответа: `Access-Control-Allow-Origin`

3. **Проверьте логи backend:**
   - Убедитесь, что запросы доходят до backend
   - Проверьте, что CORS не блокирует запросы

## Важные замечания

⚠️ **Backend на localhost недоступен из интернета!**

- `localhost:5002` работает только для локальной разработки
- Для production нужен публично доступный backend URL
- Или используйте только Supabase (который уже публично доступен)

## Быстрое решение (Временное)

Если нужно быстро протестировать, можно использовать ngrok для создания туннеля к localhost:

```bash
ngrok http 5002
```

Затем обновите `REACT_APP_API_URL` в Vercel на URL от ngrok (например, `https://xxxxx.ngrok.io/api`).

⚠️ **Это только для тестирования!** Для production используйте настоящий сервер.
