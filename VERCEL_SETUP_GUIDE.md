# 🔧 Vercel Setup Guide - SUPABASE_SERVICE_ROLE_KEY

## Проблема: RLS Policy Violation (42501)

Вы видите ошибку: **"Row Level Security policy is blocking this operation. SUPABASE_SERVICE_ROLE_KEY is required to bypass RLS."**

Это означает, что в Vercel не установлен `SUPABASE_SERVICE_ROLE_KEY`.

## ✅ Решение: Добавить Service Role Key в Vercel

### Шаг 1: Получить Service Role Key из Supabase

1. Зайдите в **Supabase Dashboard**: https://app.supabase.com
2. Выберите ваш проект
3. Перейдите в **Settings** (⚙️) → **API**
4. Найдите секцию **Project API keys**
5. Скопируйте **`service_role`** ключ (НЕ `anon` ключ!)
   - ⚠️ ВАЖНО: `service_role` ключ начинается с `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Это длинная строка, похожая на JWT токен

### Шаг 2: Добавить переменную в Vercel

1. Зайдите в **Vercel Dashboard**: https://vercel.com/dashboard
2. Выберите ваш проект (`portbox-y`)
3. Перейдите в **Settings** → **Environment Variables**
4. Нажмите **Add New**
5. Заполните:
   ```
   Name:  SUPABASE_SERVICE_ROLE_KEY
   Value: <вставьте service_role ключ из Supabase>
   ```
6. Выберите **Environment**: 
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
   (или выберите "All" чтобы применить ко всем)
7. Нажмите **Save**

### Шаг 3: Передеплоить проект

⚠️ **КРИТИЧЕСКИ ВАЖНО**: После добавления переменной окружения **ОБЯЗАТЕЛЬНО** передеплойте проект!

**Вариант A: Через Dashboard**
1. Vercel Dashboard → Project → **Deployments**
2. Найдите последний деплой
3. Нажмите **⋯** (три точки) → **Redeploy**
4. Подтвердите

**Вариант B: Через Git push**
```bash
# Сделайте любой коммит и пуш (даже пустой)
git commit --allow-empty -m "Trigger redeploy for env vars"
git push
```

### Шаг 4: Проверить

После передеплоя:

1. **Проверьте логи**: Vercel Dashboard → Functions → `/api/custom-links` → Logs
   - Должны видеть: `✅ Using SERVICE_ROLE_KEY - RLS policies will be bypassed.`

2. **Проверьте функциональность**: 
   - Попробуйте создать custom link в приложении
   - Должно работать без ошибки 500

## 📋 Необходимые переменные окружения в Vercel:

Минимальный набор:
- ✅ `REACT_APP_SUPABASE_URL` или `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (для обхода RLS)
- ✅ `REACT_APP_SUPABASE_ANON_KEY` (опционально, для клиентской части)
- ✅ `REACT_APP_SITE_URL` = `https://portbox-y.vercel.app` (ссылки из email: подтверждение регистрации, сброс пароля)

Подробнее: [SUPABASE_AUTH_URL_SETUP.md](./SUPABASE_AUTH_URL_SETUP.md)

## 🔍 Проверка текущих переменных:

В Vercel Dashboard → Settings → Environment Variables вы должны видеть:

```
✅ REACT_APP_SUPABASE_URL        = https://xxxxx.supabase.co
✅ SUPABASE_SERVICE_ROLE_KEY     = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (длинный)
✅ REACT_APP_SUPABASE_ANON_KEY   = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (длинный)
```

## ⚠️ Безопасность Service Role Key:

- **НЕ добавляйте** `SUPABASE_SERVICE_ROLE_KEY` в `.env` файлы, которые могут попасть в Git
- **НЕ используйте** Service Role Key на клиенте (в React коде)
- Service Role Key должен быть **ТОЛЬКО** в Vercel Environment Variables
- Он используется только в serverless функциях (`/api/*`)

## 🐛 Если ошибка осталась после настройки:

1. **Убедитесь, что передеплоили** - переменные не применяются автоматически!
2. **Проверьте правильность ключа** - скопировали ли вы именно `service_role`, а не `anon`?
3. **Проверьте логи функции** - Vercel Dashboard → Functions → `/api/custom-links` → Logs
4. **Проверьте RLS политики в Supabase** - они должны разрешать операции для аутентифицированных пользователей

## 📞 Дополнительная помощь:

Если проблема остается:
- Проверьте логи Vercel: Dashboard → Functions → Logs
- Проверьте Supabase Dashboard → Database → Policies для таблицы `custom_links`
