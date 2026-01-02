# Как добавить альбомы - Инструкция

## Где добавить альбом?

### Вариант 1: В Dashboard (Рекомендуется)

1. Откройте приложение и войдите в систему
2. Перейдите в **Dashboard** (Панель управления)
3. Найдите вкладку **"Portfolio"** (Портфолио)
4. Прокрутите вниз до секции **"Image Albums (New API)"**
5. Нажмите кнопку **"+ Create New Album"**

### Вариант 2: Через API напрямую

Вы можете создать альбом через API запрос:

```bash
curl -X POST http://localhost:5002/api/albums \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ваш-токен>" \
  -d '{
    "title": "Мой первый альбом",
    "description": "Описание альбома"
  }'
```

## Пошаговая инструкция

### Шаг 1: Создание альбома

1. В Dashboard нажмите **"+ Create New Album"**
2. Заполните форму:
   - **Title** (Название) - обязательно
   - **Description** (Описание) - необязательно
   - **Cover Image** (Обложка) - необязательно (можно добавить позже)
3. Нажмите **"Create Album"**

### Шаг 2: Добавление изображений в альбом

После создания альбома вы можете добавить изображения:

**Через API:**
```bash
curl -X POST http://localhost:5002/api/albums/<album-id>/images \
  -H "Authorization: Bearer <ваш-токен>" \
  -F "image=@/path/to/image.jpg"
```

**Через код:**
```javascript
import { uploadImageToAlbum } from '../services/albumsService';

const fileInput = document.querySelector('input[type="file"]');
const result = await uploadImageToAlbum(albumId, fileInput.files[0]);
```

### Шаг 3: Просмотр альбомов

Альбомы автоматически отображаются:
- В **Dashboard** → Portfolio → Image Albums
- В **ModelPage** → Portfolio section

## Важные моменты

### Автоматическая обложка
- Если альбом не имеет обложки, первое загруженное изображение автоматически становится обложкой
- Если обложка удалена, следующее изображение автоматически становится обложкой

### Удаление альбома
- При удалении альбома все его изображения также удаляются (CASCADE)
- Это действие нельзя отменить

### Ограничения
- Максимальный размер изображения: 10MB
- Поддерживаемые форматы: JPG, PNG, GIF, WebP

## Пример использования в коде

```javascript
import { 
  createAlbum, 
  uploadImageToAlbum, 
  getAlbums,
  deleteAlbum 
} from '../services/albumsService';

// Создать альбом
const album = await createAlbum({
  title: 'Моя коллекция',
  description: 'Лучшие фотографии'
});

// Добавить изображение
if (album.success) {
  const image = await uploadImageToAlbum(
    album.data.id, 
    imageFile
  );
}

// Получить все альбомы
const albums = await getAlbums();

// Удалить альбом
await deleteAlbum(albumId);
```

## Устранение проблем

### Ошибка "relation images does not exist"
Выполните SQL схему из файла `albums_schema_fixed.sql` в Supabase SQL Editor.

### Альбомы не отображаются
1. Проверьте, что таблицы созданы в базе данных
2. Проверьте консоль браузера на наличие ошибок
3. Убедитесь, что backend сервер запущен на порту 5002

### Не могу создать альбом
1. Проверьте, что вы авторизованы
2. Проверьте токен в заголовке Authorization
3. Убедитесь, что backend API доступен

## Где находятся файлы?

- **Frontend Service**: `src/services/albumsService.js`
- **Backend Controller**: `backend/controllers/albumController.js`
- **Backend Routes**: `backend/routes/albums.js`
- **SQL Schema**: `albums_schema_fixed.sql`
- **Dashboard Component**: `src/components/Dashboard.js` (секция "Image Albums")

## Дополнительная информация

Полная документация API находится в файле `ALBUMS_API_DOCUMENTATION.md`


