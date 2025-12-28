# Исправление вложенных динамических routes в Vercel

## Проблема

Ошибка 405 Method Not Allowed при попытке загрузить изображение:
```
POST https://portbox-y.vercel.app/api/albums/:id/images
Status Code: 405 Method Not Allowed
```

Это означает, что Vercel не находит serverless function для этого route.

## Решение

### Вариант 1: Использовать существующую структуру (Текущее)

Файл `api/albums/[id]/images.js` должен работать, но нужно убедиться, что:
1. ✅ Файл правильно задеплоен
2. ✅ Парсинг albumId исправлен (уже сделано)
3. ✅ Vercel распознает структуру

### Вариант 2: Использовать catch-all route (Альтернатива)

Если вложенные routes не работают, можно создать catch-all route:

1. **Создайте файл `api/albums/[...path].js`:**

```javascript
module.exports = async (req, res) => {
  const path = req.query.path || [];
  const pathArray = Array.isArray(path) ? path : [path];
  
  // pathArray будет: ['album-id', 'images']
  if (pathArray.length === 2 && pathArray[1] === 'images' && req.method === 'POST') {
    const albumId = pathArray[0];
    // ... остальная логика загрузки изображения
  }
};
```

2. **Обновите `vercel.json`:**
```json
{
  "rewrites": [
    {
      "source": "/api/albums/:id/images",
      "destination": "/api/albums/[...path]?path=:id&path=images"
    }
  ]
}
```

### Вариант 3: Использовать отдельный endpoint (Проще всего)

Создайте отдельный endpoint для загрузки изображений:

1. **Создайте файл `api/upload-album-image.js`:**

```javascript
// POST /api/upload-album-image?albumId=:id
module.exports = async (req, res) => {
  const albumId = req.query.albumId;
  // ... логика загрузки
};
```

2. **Обновите frontend** для использования нового endpoint

## Текущее исправление

Я исправил парсинг `albumId` в файле `api/albums/[id]/images.js`:

```javascript
// Теперь пытается получить ID из разных источников:
let albumId = req.query.id;

// Если не в query, парсит из URL
if (!albumId) {
  const urlParts = req.url.split('/').filter(Boolean);
  const albumsIndex = urlParts.indexOf('albums');
  if (albumsIndex >= 0 && albumsIndex < urlParts.length - 1) {
    albumId = urlParts[albumsIndex + 1];
  }
}
```

## Проверка

После деплоя:

1. **Проверьте структуру файлов:**
   ```bash
   ls -la api/albums/
   ```
   Должен быть файл `[id]/images.js`

2. **Проверьте в Vercel Dashboard:**
   - Functions → должна быть функция для `/api/albums/[id]/images`
   - Если нет, значит файл не распознан

3. **Попробуйте загрузить изображение:**
   - Откройте Dashboard → Portfolio
   - Попробуйте загрузить изображение
   - Проверьте Network tab в DevTools

## Если все еще не работает

### Быстрое решение: Использовать query параметр

Обновите frontend для отправки albumId в query параметре:

```javascript
// В albumsService.js
const response = await fetch(`${API_BASE_URL}/albums/${albumId}/images?albumId=${albumId}`, {
  method: 'POST',
  headers: headers,
  body: formData
});
```

И в serverless function:
```javascript
const albumId = req.query.albumId || req.query.id || /* parse from URL */;
```

## Важно

⚠️ **Vercel может не поддерживать вложенные динамические routes** в некоторых случаях.

✅ **Рекомендуется:** Использовать простую структуру без вложенности или query параметры.

## Альтернативное решение

Если ничего не помогает, можно использовать отдельный endpoint:
- `POST /api/upload-album-image?albumId=:id` вместо `/api/albums/:id/images`

Это проще и надежнее работает в Vercel.

