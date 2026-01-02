# Настройка Vercel Serverless Functions для Albums API

## Что было создано

1. ✅ **Serverless Function** `api/albums/index.js`:
   - Обрабатывает `GET /api/albums` - получение всех альбомов
   - Обрабатывает `POST /api/albums` - создание нового альбома
   - Поддерживает CORS
   - Использует Supabase для хранения данных

2. ✅ **Обновлен `vercel.json`**:
   - Добавлен rewrite для `/api/*` routes

## Что нужно сделать

### 1. Убедитесь, что переменные окружения установлены в Vercel

В Vercel Dashboard → Ваш проект → Settings → Environment Variables добавьте:

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# ИЛИ
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

⚠️ **Важно:** Добавьте эти переменные для **Production**, **Preview**, и **Development**.

### 2. Убедитесь, что `@supabase/supabase-js` установлен

Проверьте, что в `package.json` есть зависимость:
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.86.0"
  }
}
```

Если нет, установите:
```bash
npm install @supabase/supabase-js
```

### 3. Задеплойте на Vercel

```bash
git add .
git commit -m "Add Vercel serverless functions for albums API"
git push
```

Vercel автоматически обнаружит папку `api/` и создаст serverless functions.

## Проверка

После деплоя:

1. **Проверьте GET endpoint:**
   ```bash
   curl https://portbox-y.vercel.app/api/albums
   ```
   Должен вернуть список альбомов.

2. **Проверьте POST endpoint:**
   ```bash
   curl -X POST https://portbox-y.vercel.app/api/albums \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"title":"Test Album","description":"Test"}'
   ```

3. **Проверьте в браузере:**
   - Откройте `https://portbox-y.vercel.app`
   - Откройте DevTools → Network
   - Попробуйте создать альбом
   - Проверьте, что запросы идут на `https://portbox-y.vercel.app/api/albums`

## Дополнительные endpoints

Если нужны другие endpoints (загрузка изображений, удаление альбомов), создайте дополнительные serverless functions:

- `api/albums/[id].js` - для операций с конкретным альбомом
- `api/albums/[id]/images.js` - для загрузки изображений
- `api/images/[id].js` - для удаления изображений

## Troubleshooting

### Ошибка 405 Method Not Allowed
- Убедитесь, что файл `api/albums/index.js` существует
- Проверьте, что функция экспортируется правильно
- Перезапустите deployment в Vercel

### Ошибка "Supabase not configured"
- Проверьте переменные окружения в Vercel
- Убедитесь, что переменные добавлены для всех окружений (Production, Preview, Development)
- Перезапустите deployment после добавления переменных

### Ошибка "Module not found: @supabase/supabase-js"
- Убедитесь, что `@supabase/supabase-js` в `package.json`
- Запустите `npm install` локально
- Задеплойте снова

## Структура файлов

```
project/
├── api/
│   └── albums/
│       └── index.js    # GET и POST /api/albums
├── vercel.json         # Конфигурация Vercel
└── package.json        # Зависимости
```



