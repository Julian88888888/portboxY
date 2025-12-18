# Настройка портфолио через Supabase Database

Этот гайд покажет, как настроить хранение портфолио альбомов в таблице Supabase вместо user_metadata.

## Преимущества использования таблицы:

- ✅ Лучшая производительность для больших объемов данных
- ✅ Возможность делать запросы и фильтрацию
- ✅ Легче управлять данными через SQL
- ✅ Row Level Security (RLS) для безопасности
- ✅ Нет ограничений размера (user_metadata ограничен)

## Шаг 1: Создание таблицы в Supabase

1. Перейдите в ваш проект Supabase: https://app.supabase.com
2. Откройте **SQL Editor** в левой панели
3. Нажмите **"New query"**
4. Вставьте и выполните этот SQL:

```sql
-- Создание таблицы portfolio_albums
CREATE TABLE IF NOT EXISTS portfolio_albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  tag TEXT NOT NULL DEFAULT 'Portfolio',
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Создание индекса для быстрого поиска по user_id
CREATE INDEX IF NOT EXISTS idx_portfolio_albums_user_id ON portfolio_albums(user_id);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_portfolio_albums_updated_at 
  BEFORE UPDATE ON portfolio_albums 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Включение Row Level Security
ALTER TABLE portfolio_albums ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи могут видеть только свои альбомы
CREATE POLICY "Users can view their own portfolio albums"
  ON portfolio_albums
  FOR SELECT
  USING (auth.uid() = user_id);

-- Политика: пользователи могут создавать свои альбомы
CREATE POLICY "Users can insert their own portfolio albums"
  ON portfolio_albums
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Политика: пользователи могут обновлять свои альбомы
CREATE POLICY "Users can update their own portfolio albums"
  ON portfolio_albums
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Политика: пользователи могут удалять свои альбомы
CREATE POLICY "Users can delete their own portfolio albums"
  ON portfolio_albums
  FOR DELETE
  USING (auth.uid() = user_id);
```

5. Нажмите **"Run"** (или Ctrl+Enter)

## Шаг 2: Проверка таблицы

1. Перейдите в **Table Editor** в левой панели
2. Вы должны увидеть таблицу `portfolio_albums`
3. Проверьте, что все колонки созданы правильно

## Шаг 3: Обновление кода приложения

Код уже обновлен для работы с таблицей! Функции в `AuthContext.js` теперь используют Supabase таблицу вместо user_metadata.

## Структура таблицы

| Колонка | Тип | Описание |
|---------|-----|----------|
| `id` | UUID | Уникальный идентификатор альбома |
| `user_id` | UUID | ID пользователя (связь с auth.users) |
| `title` | TEXT | Название альбома |
| `description` | TEXT | Описание альбома |
| `tag` | TEXT | Категория (Fashion, Glamour, etc.) |
| `image_url` | TEXT | URL изображения в Storage |
| `display_order` | INTEGER | Порядок отображения |
| `created_at` | TIMESTAMP | Дата создания |
| `updated_at` | TIMESTAMP | Дата последнего обновления |

## Как это работает

1. **Загрузка альбомов**: При загрузке пользователя, альбомы загружаются из таблицы `portfolio_albums`
2. **Добавление альбома**: Изображение загружается в Storage, затем запись создается в таблице
3. **Редактирование**: Обновляется запись в таблице
4. **Удаление**: Удаляется запись из таблицы и файл из Storage

## Безопасность (RLS)

Row Level Security гарантирует, что:
- Пользователи видят только свои альбомы
- Пользователи могут создавать/редактировать/удалять только свои альбомы
- Невозможно получить доступ к чужим данным

## Миграция с user_metadata

Если у вас уже есть данные в user_metadata, вы можете мигрировать их:

```sql
-- Миграция данных из user_metadata в таблицу
-- ВНИМАНИЕ: Запустите это только один раз!

INSERT INTO portfolio_albums (user_id, title, description, tag, image_url, created_at)
SELECT 
  id as user_id,
  album->>'title' as title,
  album->>'description' as description,
  album->>'tag' as tag,
  album->>'imageUrl' as image_url,
  (album->>'uploadedAt')::timestamp as created_at
FROM auth.users,
LATERAL jsonb_array_elements(user_metadata->'portfolioAlbums') as album
WHERE user_metadata->'portfolioAlbums' IS NOT NULL
  AND jsonb_array_length(user_metadata->'portfolioAlbums') > 0;
```

## Тестирование

1. Войдите в приложение
2. Перейдите в Dashboard → Portfolio
3. Нажмите "Add New Album"
4. Заполните форму и загрузите изображение
5. Проверьте в Supabase Table Editor, что запись создалась

## Troubleshooting

### Ошибка: "permission denied for table portfolio_albums"
- Убедитесь, что RLS политики созданы правильно
- Проверьте, что пользователь авторизован

### Ошибка: "relation portfolio_albums does not exist"
- Убедитесь, что таблица создана (проверьте в Table Editor)
- Проверьте, что вы используете правильный проект Supabase

### Альбомы не отображаются
- Проверьте консоль браузера на наличие ошибок
- Убедитесь, что user_id совпадает с auth.uid()
- Проверьте, что данные есть в таблице через Table Editor

## Дополнительные возможности

### Сортировка альбомов

Вы можете добавить сортировку по `display_order`:

```sql
-- Обновить порядок альбома
UPDATE portfolio_albums 
SET display_order = 1 
WHERE id = 'album-id-here' AND user_id = auth.uid();
```

### Поиск и фильтрация

```sql
-- Найти все альбомы с тегом "Fashion"
SELECT * FROM portfolio_albums 
WHERE user_id = auth.uid() AND tag = 'Fashion'
ORDER BY created_at DESC;
```

### Статистика

```sql
-- Количество альбомов пользователя
SELECT COUNT(*) FROM portfolio_albums 
WHERE user_id = auth.uid();
```


