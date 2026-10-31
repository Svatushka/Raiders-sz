/* ============================================================
   [FSBP] RAIDERS — script.js
   ============================================================ */

// --- 0. ТЕМА (загружаем ДО всего, чтобы не мигало) ---
(function initTheme() {
    const saved = localStorage.getItem('fsbp_theme') || 'cyberpunk';
    document.documentElement.setAttribute('data-theme', saved);
})();

// --- 0.1 СБРОС СТАРОГО PWA ---
(function cleanupOldPWA() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for (let registration of registrations) {
                registration.unregister();
                console.log('[PWA] Старый Service Worker удален');
            }
        });
    }
})();

// ============================================================
//  1. PRELOADER
// ============================================================
(function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;
    let hidden = false;

    function hidePreloader() {
        if (hidden) return;
        hidden = true;
        preloader.classList.add('hide');
        setTimeout(() => preloader.remove(), 700);
    }

    const start = performance.now();
    const MIN_VISIBLE = 2100;

    window.addEventListener('load', () => {
        const elapsed = performance.now() - start;
        setTimeout(hidePreloader, Math.max(0, MIN_VISIBLE - elapsed));
    });

    setTimeout(hidePreloader, 5000);
})();

// ============================================================
//  2. AOS + ПЕЧАТНАЯ МАШИНКА + СЧЕТЧИК КЛАНА
// ============================================================
const HAS_PRELOADER = !!document.getElementById('preloader');

window.addEventListener('load', () => {
    setTimeout(() => {
        // Проверяем, загружена ли библиотека AOS, прежде чем её запускать
        if (typeof AOS !== 'undefined') {
            AOS.init({ duration: 1000, once: true, offset: 100 });
        }
    }, HAS_PRELOADER ? 2200 : 100);
});

document.addEventListener('DOMContentLoaded', () => {
    // 1. Печатная машинка
    const textToType = "Зона ждет. Молодой клан. Stalzone.";
    const typeTarget = document.getElementById('typewriter-text');
    let typeIndex = 0;

    if (typeTarget) {
        setTimeout(function typeChar() {
            if (typeIndex < textToType.length) {
                typeTarget.textContent += textToType.charAt(typeIndex);
                typeIndex++;
                setTimeout(typeChar, 50);
            }
        }, 2500);
    }

    // 2. Счетчик существования клана
    const clanFoundingDate = new Date(2024, 7, 18);
    const uptimeDisplay = document.getElementById('uptime-display');

    function updateUptime() {
        if (!uptimeDisplay) return;

        const now = new Date();
        const diff = now - clanFoundingDate;

        if (diff < 0) {
            uptimeDisplay.textContent = "Данные повреждены...";
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        const pad = (num) => String(num).padStart(2, '0');

        uptimeDisplay.textContent = `${days} дн. ${pad(hours)} ч. ${pad(minutes)} мин. ${pad(seconds)} сек.`;
    }

    if (uptimeDisplay) {
        updateUptime();
        setInterval(updateUptime, 1000);
    }
});

// ============================================================
//  3. ПЕРЕКЛЮЧАТЕЛЬ ТЕМ
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.theme-btn');
    const current = document.documentElement.getAttribute('data-theme') || 'cyberpunk';

    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === current);

        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            document.documentElement.setAttribute('data-theme', theme);
            try { localStorage.setItem('fsbp_theme', theme); } catch (e) {}
            buttons.forEach(b => b.classList.toggle('active', b === btn));
        });
    });
});

// ============================================================
//  4. КАСТОМНЫЙ КУРСОР
// ============================================================
(function initCursor() {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
    });

    function animate() {
        dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
        requestAnimationFrame(animate);
    }
    animate();

    const hoverTargets = 'a, button, .roster-card, .theme-btn, .quick-link-card, .gallery-item, .timeline-item';
    document.querySelectorAll(hoverTargets).forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('hover'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
})();

// ============================================================
//  5. KONAMI CODE → режим "ВЫБРОС"
// ============================================================
(function initKonami() {
    const sequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let pos = 0;

    document.addEventListener('keydown', (e) => {
        if (!e.key) return;
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        const expected = sequence[pos];

        if (key === expected) {
            pos++;
            if (pos === sequence.length) {
                pos = 0;
                activateEmission();
            }
        } else {
            pos = (key === sequence[0]) ? 1 : 0;
        }
    });

    function activateEmission() {
        const warning = document.getElementById('emission-warning');
        document.body.classList.add('emission');
        if (warning) warning.classList.add('show');

        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.value = 220;
            osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 1.2);
            osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 2.4);
            gain.gain.value = 0.08;
            osc.connect(gain).connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 2.5);
        } catch (e) {}

        setTimeout(() => {
            document.body.classList.remove('emission');
            if (warning) warning.classList.remove('show');
        }, 6000);
    }
})();

// ============================================================
//  6. КНОПКА "НАВЕРХ"
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;

    let ticking = false;
    function updateVisibility() {
        backToTopBtn.classList.toggle('show', window.scrollY > 300);
        ticking = false;
    }
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateVisibility);
            ticking = true;
        }
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// ============================================================
//  7. Плавный якорный скролл
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#' || href.length < 2) return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
});

// ============================================================
//  8. SCROLL PROGRESS + SCANLINE ROLL
// ============================================================
(function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ticking = false;

    function update() {
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;

        if (bar) bar.style.width = pct + '%';

        if (!reduce) {
            const offset = -(window.scrollY * 0.35);
            document.body.style.setProperty('--scanline-offset', offset + 'px');
        }

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!reduce) document.body.classList.add('is-scrolling');

        if (!ticking) {
            window.requestAnimationFrame(update);
            ticking = true;
        }

        clearTimeout(window.__scrollIdle);
        window.__scrollIdle = setTimeout(() => {
            document.body.classList.remove('is-scrolling');
            if (!reduce) {
                document.body.style.setProperty('--scanline-offset', '0px');
            }
        }, 180);
    }, { passive: true });

    // Пересчёт при изменении размера (например, поворот экрана)
    window.addEventListener('resize', () => {
        if (!ticking) {
            window.requestAnimationFrame(update);
            ticking = true;
        }
    });

    // Инициализация на случай, если страница открыта с уже прокрученной позицией
    update();
})();
// ============================================================
//  9. ФИЛЬТР СОСТАВА
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const playerCards = document.querySelectorAll('.player-card');

    if (!filterBtns.length || !playerCards.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 1. Переключаем активный класс на кнопках
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 2. Получаем выбранный фильтр
            const filterValue = btn.getAttribute('data-filter');

            // 3. Фильтруем карточки
            playerCards.forEach(card => {
                const squad = card.getAttribute('data-squad');

                if (filterValue === 'all' || filterValue === squad) {
                    card.classList.remove('hidden');
                    // Перезапускаем анимацию появления
                    card.style.animation = 'none';
                    card.offsetHeight; // триггер рефлоу
                    card.style.animation = null;
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
});
// ============================================================
//  10. БАЗА ИГРОКОВ И АВТОМАТИЧЕСКИЙ РЕНДЕР СОСТАВА
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const filtersContainer = document.getElementById('roster-filters');
    const gridContainer = document.getElementById('player-grid');

    // Если мы не на странице состава — выходим
    if (!filtersContainer || !gridContainer) return;

    // --- НАСТРОЙКА ОТРЯДОВ ---
    // Здесь задаются ID отряда и его красивое название для кнопок
    const squads = {
        'all': 'Все',
        'altushki': 'Альтушки',
        'skuf': 'СКУФ',
        'boyz': 'Бой З',
        'ralik': 'RALIK',
        'banka': 'BANKA',
        'xiki': 'XIKI',
       'roum': 'Roum`s'
    };

    // --- БАЗА ИГРОКОВ ---
    // Чтобы добавить нового игрока, просто скопируйте строку ниже и измените данные.
    // squad должен совпадать с одним из ID в объекте squads выше.
    const players = [
        { name: "Саня_Дагон", role: "Лидер", squad: "altushki" },
        { name: "Andrey_Kyzmichk", role: "Коллер", squad: "skuf" },
        { name: "Rikso", role: "Капитан отряда", squad: "roum" },
        { name: "Void_Hacker", role: "Хакер", squad: "ralik" },
        { name: "Steel_Sniper", role: "Снайпер", squad: "banka" },
        { name: "Med_Tech", role: "Медик", squad: "skuf" },
        { name: "Rust_Scav", role: "Разведчик", squad: "altushki" },
        { name: "Neon_Rookie", role: "Новобранец", squad: "ralik" },
        { name: "Hikikomori", role: "Разведчик", squad: "xiki" } // Пример игрока из XIKI
    ];

    // 1. Генерация кнопок фильтра
    Object.entries(squads).forEach(([id, title], index) => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn' + (index === 0 ? ' active' : '');
        btn.dataset.filter = id;
        btn.textContent = title;
        filtersContainer.appendChild(btn);
    });

    // 2. Генерация карточек игроков
    players.forEach(player => {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.dataset.squad = player.squad;
        
        // Получаем красивое название отряда для бейджа на карточке
        const squadTitle = squads[player.squad] || player.squad;

        card.innerHTML = `
            <h3 class="player-name">${player.name}</h3>
            <div class="player-info">
                <span class="player-role">${player.role}</span>
                <span class="player-squad">${squadTitle}</span>
            </div>
        `;
        
        gridContainer.appendChild(card);
    });

    // 3. Логика фильтрации (та же, что была раньше, но теперь ищет созданные элементы)
    const filterBtns = document.querySelectorAll('.filter-btn');
    const playerCards = document.querySelectorAll('.player-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            playerCards.forEach(card => {
                const squad = card.getAttribute('data-squad');

                if (filterValue === 'all' || filterValue === squad) {
                    card.classList.remove('hidden');
                    // Перезапуск анимации
                    card.style.animation = 'none';
                    card.offsetHeight; 
                    card.style.animation = null;
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
});
