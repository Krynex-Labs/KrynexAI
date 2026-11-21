Write notes about your work here (For AI agents):

## 2026-11-21 — Background music
- В обе панели Appearance (модалка + секция) добавлен блок Music: кнопка play/pause (`data-music-toggle`) и ползунок громкости (`data-music-volume`, `data-music-value`). Разметка одинаковая, ID не дублируются.
- `script.js` + инлайн `full.html`: модуль создаёт один `new Audio('assets/music.mp3')` (loop, preload=none), кнопка вызывает play/pause после жеста пользователя (autoplay-политика), громкость сохраняется в localStorage по ключу `krynexlabs_music_volume`. `MAX_GAIN=0.35` — даже на 100% звук тихий. Состояние кнопок и обоих слайдеров синхронизируется через `sync()`.
- Файл `assets/music.mp3` положил пользователь (11.7 MB, ID3v2.4). Проверять целостность не нужно.
- Стили `.music-*`: акцентная заливка слайдера через `--fill`, разные thumb для WebKit/Gecko.
- Процент громкости теперь кликабелен: кнопка `[data-music-value]` скрывается, появляется number-поле `[data-music-input]`, Enter/blur применяет значение (0–100, clamping в `setVolume`), Escape отменяет. Обе панели синхронизируются.
- В подсказке указан трек **Bonobo — Cycles** — по просьбе пользователя, чтобы не было «без указания». В README добавлено напоминание: указание авторства не заменяет лицензию на публикацию.
- `scripts/check.mjs`: проверяет наличие `assets/music.mp3` и всех трёх контролов music в обоих HTML. README/CHANGELOG обновлены.

## 2026-11-21 — GitHub contact
- В секции Contacts (`#contacts`) добавлена карточка `https://github.com/Krynex-Labs` с подписью `@Krynex-Labs` и официальным SVG GitHub из Simple Icons (`https://cdn.simpleicons.org/github`). Иконка красится через CSS `.contact-icon svg{fill:var(--text)}`.
- Одинаково в `index.html` и `full.html`. Ссылка открывается в новой вкладке (`target="_blank" rel="noopener"`).

## 2026-11-21 — License: Apache 2.0 + CITATION.cff
- `LICENSE` заменён с Unlicense на полный текст Apache License 2.0 (канонический, с Appendix). Добавлен `CITATION.cff` (CFF 1.2.0: title, abstract, author Yakovlev Anton, license Apache-2.0, date-released 2026-11-21, keywords).
- README: раздел License обновлён; CHANGELOG: добавлены пункты Added/Changed; `scripts/check.mjs` теперь проверяет наличие `CITATION.cff`, текст Apache 2.0 в LICENSE и совпадение `license:` в CFF.
- В CFF намеренно нет `repository-code`/`url` — публичный репозиторий и домен неизвестны; комментарий в файле об этом.

## 2026-11-21 — Repository tooling: новые файлы
- Добавлены рабочие файлы (не заглушки): `manifest.webmanifest` (PWA, подключён в `<head>` обоих HTML), `robots.txt`, `sitemap.xml` (хост-заглушка `krynexlabs.example` — заменить перед публикацией), `humans.txt`, `.editorconfig`, `.gitattributes`, `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `scripts/check.mjs`, `.github/workflows/verify.yml`.
- `scripts/check.mjs`: проверяет наличие ключевых файлов, баланс тегов и скобок, уникальность id, внутренние ссылки, отсутствие console.log, валидность манифеста. Запуск: `node scripts/check.mjs` — 18 проверок PASS. CI запускает тот же скрипт на push/PR.
- README.md дополнен разделом Development. Новых зависимостей и сборки нет.
- Замечание для себя: количество файлов не делает репозиторий профессиональным — ценность в том, что каждый файл что-то проверяет или описывает.

## 2026-11-21 — Header: ссылки на все 11 секций
- В `.nav-links` добавлены недостающие ссылки: `#contacts`, `#ai-feed`, `#appearance` (подпись "Themes", чтобы не путать с кнопкой Appearance, открывающей модалку), `#reviews`. Итого 11 ссылок — по числу пронумерованных секций; все цели существуют.
- На десктопе (≥851px) хедер стал двухрядным: бренд и правые кнопки в первом ряду, все 11 ссылок — во втором (`order:3`, на всю ширину, `justify-content:space-between`, шрифт 11.5px). Иначе 11 пунктов не влезали в одну строку. `scroll-padding-top` увеличен до 115px, чтобы якоря не прятались под липкий хедер.
- В мобильном меню продолжены staggered-задержки появления: nth-child 9..12 и кнопка `.nav-appearance`.
- Правки в `index.html`, `full.html`, `style.css` + инлайн-стили `full.html`. Проверка: 11 ссылок и все цели на месте, баланс тегов/CSS-скобок.

## 2026-11-21 — Reviews: секция отзывов-карусель
- Добавлена секция `11 / Reviews` (`id="reviews"`) перед Contact в `index.html` и `full.html`: 6 демо-отзывов (звёзды, цитата, имя/роль, инициалы). Тексты — случайные заглушки, перед публикацией заменить на реальные.
- Карусель: `.reviews-track` с `overflow-x:auto` + `scroll-snap-type:x mandatory` (свайп на тач-устройствах работает нативно), стрелки.prev/next, точки, счётчик `01 / 06`, стрелки клавиатуры при фокусе внутри секции. Кнопки-стрелки блокируются на краях.
- Стили `.reviews-*`, `.review-*` добавлены в `style.css` и инлайн в `full.html`; секция участвует в collapse (`data-collapse="reviews"`), как остальные.
- JS-модуль «Reviews carousel» в конце `script.js` и инлайн в `full.html`: шаг = `cards[1].offsetLeft - cards[0].offsetLeft`, активный индекс синхронизируется по событию `scroll`.
- Проверка: `node --check` обоих JS, баланс тегов/ID, 6 карточек в каждой копии, баланс CSS-скобок.

## 2026-11-21 — Appearance: отдельная секция настроек
- Добавлена секция `10 / Appearance` (`id="appearance"`) между Gamification и Contact в `index.html` и `full.html`: те же органы управления, что в модалке `settingsModal` — тема (System/Dark/Light), акцент (8 пресетов + picker + hex), фон (9 пресетов + picker + hex), сохранённые темы, Reset. Кнопка-переключатель темы в хедере (`#themeBtn`) и модалка остались на месте.
- Чтобы не дублировать ID, новые контролы используют `data-*` атрибуты. `script.js` (и инлайн в `full.html`): модуль Appearance теперь работает с двумя панелями — `pair(id, attr)` собирает пару элементов (модалка + секция), `paint()`/обработчики/`renderThemes()` обновляют обе; кнопки-пресеты ищутся через `document.querySelectorAll('[data-*-choice]')`.
- Стили `.appearance-panel` (2 колонки на десктопе, 1 на ≤850px) добавлены в `style.css` и инлайн в `full.html`; секция участвует в системе collapse (`data-collapse="appearance"`).
- Убрал пустоту между Theme и Background: панель разбита на два независимых `.appearance-col` (слева Theme + Accent color, справа Background + My themes) — раньше сетка выравнивала строки по самому высокому блоку (акценту), из-за чего под Theme был большой зазор.
- Проверка: `node --check script.js` и инлайн-JS из `full.html` — ok; баланс тегов/ID без дублей в обоих HTML; скобки CSS сбалансированы.

## 2026-11-21 — Gamification: fix broken layout (незакрытый div)
- Причина: в `<div class="section-head reveal">` секции 09 был лишний открытый `<div>` и только два `</div>` в конце — `section-head` оставался незакрытым. Поэтому `.gam-stats`, `.gam-grid` и весь дальнейший контент оказались ВНУТРИ `.section-head`, который `display:flex; justify-content:space-between; align-items:end`: заголовок внизу слева, статы по центру, карточки — отдельной колонкой справа и вверх ("контент справа, пустота слева").
- Fix: убран лишний `<div>` в `index.html` (секция `#gamification`) и в той же инлайн-разметке `full.html`. CSS-правки из первой попытки откачены — стили не были причиной.
- Проверка: HTML-парсер (стек тегов) больше не показывает незакрытых тегов — `html/body/main` закрываются корректно; баланс `{}` в CSS/HTML не нарушен.

## 2026-11-21 — Gamification (id: gamification)
- Новый раздел после AI Feed (секция 09): kicker «09 / Gamification», h2 «Earn as you go»; ссылка «Gamification» в nav после «FAQ»; добавлена задержка появления 8-го элемента мобильного меню (style.css).
- script.js: модуль «Gamification» в конце (IIFE). Состояние в localStorage — `krynexlabs_gamification`: {coins, tasks, visited, achievements, stats{firstVisit, lastVisit, sessionStart, returned}}.
  - Задания (10): посещение #services/#about/#process/#pricing/#build (2 коина каждое); read-faq (2) — клик по `.faq-q`; open-contact (2) — клик по `#openContact` или `.choose-plan`; time-10m/20m/30m (1 каждое после 10/20/30 минут на сайте).
  - Отслеживание: IntersectionObserver на 5 секциях (threshold .2); делегированные клики по `#faq .faq-q` и `#openContact, .choose-plan`; интервал 5 с (обновляет время на сайте).
  - Достижения (6): First visit (при загрузке), Explorer (все 5 секций), FAQ fan (read-faq), 10 minutes on the site (≥10 мин), Task master (≥5 заданий), Welcome back (другая сессия с другого дня).
  - Обмен: mailto `krynexlabs@gmail.com` (тема «Coins exchange», body с текущим балансом); ставка 10 коинов = 1% скидки.
- Верификация: `node --check script.js` — ok; линк-based набор проверок `gam_test.js` (в кэше opencode: `node gam_test.js`) — 20 PASS (наличие элементов, начисление монет: 2 за каждую секцию, +2 FAQ/форма, +3 за 31 минуту → 17 коинов, достижения, mailto, localStorage). full.html сгенерирован повторно (style.css + script.js инлайн).

## 2026-11-21 — About: creator card
Добавил в секцию About (index.html, full.html) карточку создателя:
- Блок `.about-cards` с карточкой: роль "Founder / Creator", имя "Yakovlev Anton Andreevich", описание "Creates everything: AI products, automation, the company itself. St. Petersburg, Russia."
- Стили карточки: `.about-card`, `.about-card-role`, `.about-card h3`, `.about-card p` + мобильный вариант
- Стрелка-секция сворачивает/раскрывает секцию About как остальные (связано с предыдущей задачей: все секции влезли в систему collapse)

## AI Feed (секция 08 / AI Feed)
Новая секция после Contacts — "Posts about AI": парсится при заходе на сайт (JS, mode:cors):
- Hugging Face blog — `https://huggingface.co/blog/feed.xml` (RSS, verified 200 + айтемы) — посты от разных авторов HF (ibm-research, ggml-org и т.д.)
- Telegram — `https://t.me/s/KrynexLabs` — парсится регулярками/DOMParser из HTML страницы (добавлена фильтрация по AI_RE: /ai\b|llm|gpt|claude|gemini|anthropic|openai|neural|transformer|fine-tun|нейро/i). Блок Bluesky — отказались (appview требует auth — 401 AuthMissing). Данные: dedupe по link, max 12 карточек.