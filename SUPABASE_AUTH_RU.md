# Настройка авторизации в Supabase

## Быстрый старт

### 1. Создайте проект в Supabase

1. Перейдите на https://app.supabase.com
2. Нажмите "New Project"
3. Заполните данные:
   - **Имя проекта**: например, "model-portfolio"
   - **Пароль базы данных**: создайте надежный пароль
   - **Регион**: выберите ближайший к вашим пользователям
4. Нажмите "Create new project" и подождите инициализации

### 2. Получите API ключи

1. В панели Supabase перейдите в **Settings** → **API**
2. Скопируйте два значения:
   - **Project URL** (например: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (в разделе "Project API keys" → "anon public")

### 3. Настройте переменные окружения

1. Создайте файл `.env` в корне проекта:
   ```bash
   cp env.example .env
   ```

2. Откройте `.env` и добавьте ваши ключи Supabase:
   ```env
   REACT_APP_SUPABASE_URL=https://ваш-project-id.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=ваш-anon-key-здесь
   ```

3. **Важно**: Никогда не коммитьте файл `.env` в git. Убедитесь, что `.env` есть в `.gitignore`.

### 4. Настройте Email аутентификацию

1. В панели Supabase перейдите в **Authentication** → **Providers**
2. Убедитесь, что **Email** включен
3. Настройте URL:
   - **Site URL**: ваш production URL (например: `https://yourdomain.com`)
   - **Redirect URLs**: добавьте оба URL:
     - `http://localhost:3000/**` (для разработки)
     - `https://yourdomain.com/**` (для продакшена)

### 5. (Опционально) Настройте Storage для фото профиля

Если хотите загружать фото профиля:

1. В панели Supabase перейдите в **Storage**
2. Нажмите "Create a new bucket"
3. Назовите его `profile-photos`
4. Включите **Public bucket**
5. Нажмите "Create bucket"

#### Настройка политик Storage (через SQL Editor):

1. Перейдите в **SQL Editor** → **New query**
2. Вставьте и выполните этот SQL:

```sql
-- Политика для загрузки (INSERT)
CREATE POLICY "Allow authenticated users to upload profile photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Политика для просмотра (SELECT)
CREATE POLICY "Allow public access to profile photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'profile-photos');

-- Политика для удаления (DELETE)
CREATE POLICY "Allow users to delete their own profile photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

3. Нажмите "Run"

### 6. Проверьте работу

1. Запустите приложение:
   ```bash
   npm start
   # или
   pnpm start
   ```

2. Попробуйте зарегистрировать новый аккаунт:
   - Заполните форму регистрации
   - Вы должны получить email подтверждения (если включено)
   - Проверьте панель Supabase: **Authentication** → **Users** - должен появиться новый пользователь

3. Попробуйте войти с созданным аккаунтом

## Как это работает

### Регистрация (Sign Up)
1. Пользователь заполняет форму (email, пароль, имя, фамилия, телефон, тип пользователя)
2. Supabase создает аккаунт
3. Метаданные пользователя сохраняются в `user_metadata`
4. Отправляется email подтверждения (если включено)
5. Пользователь автоматически входит в систему

### Вход (Sign In)
1. Пользователь вводит email и пароль
2. Supabase проверяет учетные данные
3. Создается сессия и сохраняется в localStorage
4. Данные пользователя загружаются в React контекст

### Выход (Sign Out)
1. Пользователь нажимает "Выйти"
2. Сессия Supabase очищается
3. Пользователь перенаправляется на главную страницу

## Структура метаданных пользователя

Метаданные хранятся в Supabase и включают:
```javascript
{
  firstName: string,
  lastName: string,
  phone: string,
  userType: 'model' | 'photographer' | 'stylist' | 'makeup_artist' | 'hair_stylist',
  profilePhotos: [
    {
      id: string,
      url: string,
      uploadedAt: string,
      isMain: boolean
    }
  ],
  links: []
}
```

## Использование в коде

### В компонентах React:

```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { 
    user,              // Текущий пользователь
    isAuthenticated,   // Логин: true/false
    loading,           // Загрузка: true/false
    login,             // Функция входа
    register,          // Функция регистрации
    logout,            // Функция выхода
    updateProfile      // Обновление профиля
  } = useAuth();

  // Пример входа
  const handleLogin = async () => {
    const result = await login({
      email: 'user@example.com',
      password: 'password123'
    });
    
    if (result.success) {
      console.log('Вход успешен!');
    } else {
      console.error('Ошибка:', result.error);
    }
  };

  // Пример регистрации
  const handleRegister = async () => {
    const result = await register({
      email: 'user@example.com',
      password: 'password123',
      firstName: 'Иван',
      lastName: 'Иванов',
      phone: '+1234567890',
      userType: 'model'
    });
    
    if (result.success) {
      console.log('Регистрация успешна!');
    }
  };

  if (loading) return <div>Загрузка...</div>;
  
  if (!isAuthenticated) {
    return <div>Пожалуйста, войдите в систему</div>;
  }

  return (
    <div>
      <p>Привет, {user.firstName}!</p>
      <button onClick={logout}>Выйти</button>
    </div>
  );
}
```

## Решение проблем

### Ошибка: "Missing Supabase environment variables"
- Убедитесь, что файл `.env` существует и содержит правильные переменные
- Перезапустите сервер разработки после добавления переменных окружения

### Пользователи не получают email подтверждения
- Проверьте **Authentication** → **Email Templates** в панели Supabase
- Проверьте настройки SMTP (Supabase предоставляет SMTP по умолчанию в разработке)
- Проверьте папку спам

### Ошибка: "Invalid API key"
- Убедитесь, что используете **anon/public key**, а не service role key
- Проверьте, что в `.env` нет лишних пробелов

### Фото не загружаются
- Убедитесь, что bucket `profile-photos` существует и публичный
- Проверьте, что политики Storage настроены правильно
- Убедитесь, что вы авторизованы при загрузке

## Дополнительные ресурсы

- [Документация Supabase](https://supabase.com/docs)
- [Документация Supabase Auth](https://supabase.com/docs/guides/auth)
- [Документация Supabase Storage](https://supabase.com/docs/guides/storage)
- [JavaScript клиент Supabase](https://supabase.com/docs/reference/javascript/introduction)

## Поддержка

Если возникли проблемы:
1. Проверьте консоль браузера на наличие ошибок
2. Проверьте логи в панели Supabase
3. Просмотрите эту инструкцию
4. Обратитесь к документации Supabase





