# Настройка переменных окружения в Vercel

## Проблема
Если вы видите ошибку "Missing Supabase environment variables", это означает, что переменные окружения не настроены в Vercel.

## Решение

### Шаг 1: Получите ваши Supabase credentials

1. Зайдите на https://app.supabase.com
2. Выберите ваш проект
3. Перейдите в **Settings** → **API**
4. Скопируйте:
   - **Project URL** (например: `https://xxxxx.supabase.co`)
   - **anon public key** (длинная строка, начинающаяся с `eyJ...`)

### Шаг 2: Добавьте переменные в Vercel

1. Зайдите на https://vercel.com
2. Выберите ваш проект
3. Перейдите в **Settings** → **Environment Variables**
4. Добавьте следующие переменные:

   **Переменная 1:**
   - Name: `REACT_APP_SUPABASE_URL`
   - Value: ваш Supabase Project URL
   - Environment: Production, Preview, Development (выберите все)

   **Переменная 2:**
   - Name: `REACT_APP_SUPABASE_ANON_KEY`
   - Value: ваш Supabase anon key
   - Environment: Production, Preview, Development (выберите все)

### Шаг 3: Передеплойте проект

После добавления переменных:
1. Перейдите в **Deployments**
2. Найдите последний deployment
3. Нажмите **"..."** → **"Redeploy"**
4. Или сделайте новый commit и push - Vercel автоматически пересоберёт проект

## Проверка

После передеплоя проверьте:
1. Откройте ваше приложение
2. Откройте консоль браузера (F12)
3. Не должно быть ошибок о missing environment variables
4. Приложение должно работать корректно

## Важно

- ⚠️ **Никогда не коммитьте `.env` файл в git!**
- ✅ Все переменные окружения должны быть настроены в Vercel
- ✅ Переменные должны начинаться с `REACT_APP_` чтобы быть доступными в React приложении

