
🎮 Клан Рейдеры [FSBP] — Stalzone
Одностраничный сайт-визитка клана Рейдеры [FSBP] для игрового проекта Stalzone. Стилизован под киберпанк-терминал с эффектами CRT-монитора, глитчами и неоновым свечением. Полностью статичный, без сборки и зависимостей — хостится на GitHub Pages.

✨ Особенности
🎨 3 темы оформления — Киберпанк, Сталкер, Матрица (переключатель в правом верхнем углу, выбор сохраняется в localStorage).

💻 Прелоадер с эмуляцией загрузки КПК и прогресс-баром.

⌨️ Печатная машинка в подзаголовке и живой счётчик «Клан активен: X дн. XX ч. XX мин. XX сек.» с момента основания.

🖱️ Кастомный курсор (точка + инерционное кольцо) на устройствах с мышью.

📇 Карточки состава с онлайн/офлайн статусами.

📡 Форма заявки-wizard (3 шага) с валидацией, автосохранением черновика и отправкой в Discord через Webhook.

🕵️ Honeypot-поле для защиты от простых ботов.

🟢 Discord CTA — кнопка быстрого перехода в Discord-сервер.

📱 Адаптивная вёрстка + поддержка safe-area-inset для iPhone с «чёлкой».

🎁 Konami Code Easter Egg — наберите ↑ ↑ ↓ ↓ ← → ← → B A и активируется режим «ВЫБРОС» (тряска + красный оверлей + звук).

🔼 Кнопка «Наверх», плавный якорный скролл, AOS-анимации.

🧭 Кастомная страница 404 («Сектор потерян»).

🔍 SEO: Open Graph, Twitter Card, sitemap.xml, robots.txt, canonical.

📁 Структура проекта
Raiders-sz/
├── index.html          # Главная страница
├── 404.html            # Кастомная страница ошибки
├── style.css           # Все стили (темы, анимации, адаптив)
├── script.js           # Прелоадер, темы, курсор, форма, Konami
├── robots.txt          # Правила для поисковиков
├── sitemap.xml         # Карта сайта
└── images/
    ├── avatar.png      # Аватар клана (блок «О нас»)
    ├── cover.jpg       # Фон в шапке (hero)
    └── okno.png        # Favicon

🚀 Быстрый старт
Проект не требует сборки. Достаточно открыть index.html в браузере или поднять локальный сервер:
# Python
python -m http.server 8000

# Node.js (npx)
npx serve .

Затем откройте http://localhost:8000

⚙️ Настройка перед публикацией
Перед заливкой на прод замените плейсхолдеры:

1. Discord-вебхук (обязательно)
В script.js, в самом верху:
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/ВАШ_ID/ВАШ_ТОКЕН';

Как получить:

Discord → настройки канала → Интеграции → Вебхуки → Новый вебхук → Скопировать URL.

2. Ссылка-приглашение в Discord
В index.html, блок .discord-cta:

<a href="https://discord.gg/ВАШ_ИНВАЙТ" ...>

3. Дата основания клана
В script.js (функция updateUptime):

// Год, Месяц (0-11!), День
const clanFoundingDate = new Date(2024, 7, 18); // 18 августа 2024

4. Домен
Если сайт переезжает с https://svatushka.github.io/Raiders-sz/, обновите абсолютные URL:

index.html — <link rel="canonical">, метатеги og:url, og:image, twitter:image

sitemap.xml — <loc>

robots.txt — Sitemap:

404.html — <base href="/Raiders-sz/">

5. Состав клана
В index.html, секция .roster-grid — каждая карточка это .roster-card с полями:

h3 — ник

.role — роль

.status.online или .status.offline — статус

Добавьте или удалите блоки по необходимости.

🌐 Деплой на GitHub Pages
Запушьте репозиторий в GitHub (имя репо — Raiders-sz или ваше).

Settings → Pages → Source: Deploy from a branch → ветка main → папка / (root).

Через минуту сайт доступен по адресу https://ВАШ_НИК.github.io/ИМЯ_РЕПО/.

Для кастомного домена — добавьте CNAME-файл и настройте DNS по инструкции GitHub.

🧩 Технологии
HTML5 — семантическая вёрстка

CSS3 — переменные темы, grid, backdrop-filter, keyframes-анимации

Vanilla JS (ES5/ES6) — без фреймворков

Google Fonts — Rajdhani, Share Tech Mono

AOS — анимации при скролле (CDN)

Discord Webhooks API — приём заявок
