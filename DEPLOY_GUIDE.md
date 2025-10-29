# 🚀 Инструкция по деплою YouTube → Статья

## 📦 Что создано:

1. **Backend API** (`api/index.py`) - Flask сервер для получения субтитров
2. **Frontend** (`youtube-to-article-v2.jsx`) - React приложение
3. **Конфигурация** (`vercel.json`, `requirements.txt`)

---

## 🎯 Вариант 1: Деплой на Vercel (рекомендую)

### Шаг 1: Подготовка

1. Установи Vercel CLI:
```bash
npm install -g vercel
```

2. Создай аккаунт на [vercel.com](https://vercel.com) (можно через GitHub)

### Шаг 2: Деплой Backend

1. Открой терминал в папке с проектом

2. Убедись что структура такая:
```
youtube-transcript-api/
├── api/
│   ├── index.py
│   └── requirements.txt
├── vercel.json
└── youtube-to-article-v2.jsx
```

3. Выполни команду:
```bash
vercel
```

4. Ответь на вопросы:
   - Set up and deploy? → **Y**
   - Which scope? → выбери свой аккаунт
   - Link to existing project? → **N**
   - Project name? → `youtube-transcript-api` (или любое)
   - In which directory is your code? → `.` (нажми Enter)
   - Want to override settings? → **N**

5. После деплоя получишь URL типа:
```
https://youtube-transcript-api-xyz.vercel.app
```

### Шаг 3: Проверка API

Открой в браузере:
```
https://your-url.vercel.app/api/health
```

Должен вернуться JSON:
```json
{
  "status": "ok",
  "message": "YouTube Transcript API is running"
}
```

### Шаг 4: Настройка Frontend

1. В React приложении найди строку:
```javascript
const [apiUrl, setApiUrl] = useState('http://localhost:5000');
```

2. Замени на свой URL:
```javascript
const [apiUrl, setApiUrl] = useState('https://your-url.vercel.app');
```

3. Или просто вставь URL в поле "API Backend URL" в интерфейсе

**Готово! 🎉**

---

## 🎯 Вариант 2: Локальный запуск (для тестов)

### Backend (локально)

1. Установи зависимости:
```bash
cd api
pip install -r requirements.txt
```

2. Запусти сервер:
```bash
python index.py
```

Сервер запустится на `http://localhost:5000`

### Frontend

Используй React приложение с `apiUrl = 'http://localhost:5000'`

---

## 🎯 Вариант 3: Другие платформы

### Railway.app

1. Зарегистрируйся на [railway.app](https://railway.app)
2. Создай новый проект → Deploy from GitHub
3. Выбери свой репозиторий
4. Railway автоматически определит Python и задеплоит

### Render.com

1. Зарегистрируйся на [render.com](https://render.com)
2. New → Web Service
3. Подключи GitHub репозиторий
4. Настройки:
   - Build Command: `pip install -r api/requirements.txt`
   - Start Command: `cd api && python index.py`

---

## 🔧 Решение проблем

### Ошибка CORS

Если видишь ошибку CORS в браузере:

1. Убедись что `flask-cors` установлен
2. Проверь что в `index.py` есть строка `CORS(app)`

### API не работает

1. Проверь логи на Vercel: `vercel logs`
2. Проверь что все файлы на месте
3. Попробуй переделоплоить: `vercel --prod`

### YouTube блокирует запросы

Если получаешь ошибки типа "IP blocked":
- Это нормально для некоторых видео
- Используй ручной режим ввода
- Или добавь прокси в `index.py` (см. документацию youtube-transcript-api)

---

## 📝 Использование

### Автоматический режим:
1. Вставь ссылку на YouTube видео
2. Нажми "Конвертировать"
3. Получи готовую статью

### Ручной режим:
1. Открой видео на YouTube
2. Нажми "⋮" под видео
3. Выбери "Show transcript"
4. Скопируй текст и вставь в приложение

---

## 💰 Стоимость

- **Vercel**: Бесплатно (100GB bandwidth/месяц)
- **Railway**: $5/месяц после пробного периода
- **Render**: Бесплатно (но засыпает через 15 мин неактивности)

**Рекомендую Vercel** - проще всего и без ограничений для твоих задач.

---

## 🎨 Дальнейшие улучшения

1. Добавить кэширование транскриптов
2. Поддержка плейлистов
3. Выбор языка статьи
4. Экспорт в PDF/DOCX
5. История конвертаций

---

## ❓ Вопросы?

Если что-то не работает - пиши, разберёмся!
