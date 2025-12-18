# Исправление проблемы с тегом "Glamour" не отображающимся

## Проблема
Тег "Glamour" (и другие теги) не отображается в `discount_tag` для альбомов портфолио.

## Возможные причины

1. **Колонка `tag` отсутствует в таблице `portfolio_albums`**
   - Если таблица была создана до добавления поля `tag`
   
2. **Существующие записи имеют NULL в поле `tag`**
   - Старые альбомы могли быть созданы без тега

3. **Проблема с загрузкой данных**
   - Тег сохраняется, но не загружается обратно

## Решение

### Шаг 1: Проверьте структуру таблицы

Выполните в Supabase SQL Editor:

```sql
-- Проверьте, существует ли колонка tag
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'portfolio_albums'
AND column_name = 'tag';
```

### Шаг 2: Добавьте колонку, если её нет

Выполните скрипт `fix_portfolio_tag_column.sql`:

```sql
-- Этот скрипт безопасно добавит колонку tag, если её нет
-- И обновит существующие записи
```

Или выполните вручную:

```sql
-- Добавить колонку tag, если её нет
ALTER TABLE portfolio_albums 
ADD COLUMN IF NOT EXISTS tag TEXT NOT NULL DEFAULT 'Portfolio';

-- Обновить существующие записи с NULL
UPDATE portfolio_albums 
SET tag = 'Portfolio' 
WHERE tag IS NULL;
```

### Шаг 3: Проверьте данные

```sql
-- Проверьте, какие теги есть в базе
SELECT id, title, tag 
FROM portfolio_albums 
ORDER BY created_at DESC 
LIMIT 10;
```

### Шаг 4: Откройте консоль браузера

1. Откройте DevTools (F12)
2. Перейдите на вкладку Console
3. Создайте новый альбом с тегом "Glamour"
4. Проверьте логи:
   - Должно быть: `Saving album with tag: Glamour`
   - Должно быть: `Loaded album tag: Glamour for album: [название]`

### Шаг 5: Если тег всё ещё не отображается

Проверьте в коде Dashboard.js строка 928:

```javascript
<div className="discount_tag">{album.tag || 'Portfolio'}</div>
```

Убедитесь, что `album.tag` содержит значение. Добавьте временный console.log:

```javascript
{console.log('Album tag:', album.tag)}
<div className="discount_tag">{album.tag || 'Portfolio'}</div>
```

## Проверка работы

1. Создайте новый альбом с тегом "Glamour"
2. Сохраните альбом
3. Проверьте, что тег отображается в списке альбомов
4. Если не отображается, проверьте консоль браузера на наличие ошибок

## Дополнительная отладка

Если проблема сохраняется, проверьте:

1. **В Supabase Table Editor**: Откройте таблицу `portfolio_albums` и проверьте, что колонка `tag` существует и содержит значения

2. **В Network tab**: Проверьте запросы к Supabase при загрузке альбомов - убедитесь, что поле `tag` возвращается в ответе

3. **В React DevTools**: Проверьте состояние `user.portfolioAlbums` - убедитесь, что каждый альбом имеет поле `tag`

## Быстрое исправление

Если нужно быстро исправить существующие альбомы:

```sql
-- Установить тег "Glamour" для всех альбомов (если нужно)
UPDATE portfolio_albums 
SET tag = 'Glamour' 
WHERE tag IS NULL OR tag = 'Portfolio';
```

Или установить разные теги вручную через Supabase Table Editor.


