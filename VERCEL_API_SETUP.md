# Настройка API для работы на Vercel

## Что было исправлено

1. ✅ **Автоматическое определение API URL** в `albumsService.js`:
   - В production (Vercel) автоматически использует `https://portbox-y.vercel.app/api`
   - В development использует `http://localhost:5002/api`

2. ✅ **CORS настроен** в backend для поддержки Vercel доменов

## Варианты настройки

### Вариант 1: Использовать отдельный Backend сервер (Рекомендуется)

Если у вас есть отдельный backend сервер (например, на Railway, Render, Heroku):

1. **Настройте переменную окружения в Vercel:**
   - Vercel Dashboard → Ваш проект → Settings → Environment Variables
   - Добавьте:
     ```
     REACT_APP_API_URL=https://your-backend-url.com/api
     ```
   - Убедитесь, что переменная добавлена для **Production**, **Preview**, и **Development**

2. **Перезапустите deployment в Vercel**

### Вариант 2: Использовать Vercel Serverless Functions

Если вы хотите разместить backend API на том же Vercel домене:

1. **Создайте папку `api/` в корне проекта:**
   ```bash
   mkdir -p api/albums
   ```

2. **Создайте serverless functions** для каждого endpoint:
   - `api/albums/index.js` - для GET и POST `/api/albums`
   - `api/albums/[id].js` - для операций с конкретным альбомом
   - `api/albums/[id]/images.js` - для загрузки изображений

3. **Обновите `vercel.json`:**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "build",
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "/api/$1"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

4. **API будет доступен по адресу:**
   - `https://portbox-y.vercel.app/api/albums`

### Вариант 3: Использовать только Supabase (Текущее решение)

Albums API уже использует Supabase для хранения данных. Если вы хотите полностью убрать зависимость от backend:

1. **Используйте Supabase Storage для загрузки изображений:**
   - Изображения уже загружаются в Supabase Storage
   - URL изображений возвращаются из Supabase

2. **Настройте Supabase CORS:**
   - Supabase Dashboard → Settings → API
   - Добавьте в CORS: `https://portbox-y.vercel.app`

3. **Обновите `albumsService.js`** для прямого использования Supabase client (если нужно)

## Текущая настройка

После обновления кода:

- ✅ **Автоматическое определение URL**: В production автоматически используется `https://portbox-y.vercel.app/api`
- ✅ **CORS настроен**: Backend разрешает запросы с Vercel доменов
- ✅ **Fallback на localhost**: В development используется `localhost:5002`

## Проверка

1. **Проверьте переменные окружения в Vercel:**
   - Если `REACT_APP_API_URL` не установлен, будет использоваться автоматическое определение
   - Если установлен, будет использоваться указанный URL

2. **Проверьте в браузере:**
   - Откройте DevTools → Console
   - Проверьте, что запросы идут на правильный URL
   - Проверьте, что нет CORS ошибок

3. **Проверьте логи:**
   - В консоли браузера должны быть логи успешных запросов
   - Если есть ошибки, проверьте Network tab в DevTools

## Важно

⚠️ **Если backend на localhost:**
- Backend на `localhost:5002` **недоступен** из интернета
- Для production нужен публично доступный backend URL
- Или используйте Vercel Serverless Functions

✅ **Текущее решение:**
- Код автоматически определяет production URL
- Если backend развернут на production сервере, просто добавьте `REACT_APP_API_URL` в Vercel
- Если используете только Supabase, backend не нужен для albums API


