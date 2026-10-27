// --- 1. AOS (анимации при скролле) ---
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// --- 2. НАСТРОЙКИ ---
// ⚠️ ЗАМЕНИ на URL своего Cloudflare Worker (НЕ на вебхук Discord напрямую!)
const WEBHOOK_URL = 'https://ваш-воркер.имя-аккаунта.workers.dev';

// ============================================================
//  ОТПРАВКА ФОРМЫ (через Cloudflare Worker → Discord)
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('clan-form');
    const submitBtn = document.getElementById('submit-btn');
    const statusDiv = document.getElementById('form-status');

    // Если формы нет на странице — выходим
    if (!form || !submitBtn || !statusDiv) return;

    // --- Honeypot: скрытое поле против ботов ---
    // (если добавишь в HTML — раскомментируется ниже)
    // const honeypot = form.querySelector('input[name="website"]');

    // --- Автосохранение черновика ---
    const DRAFT_KEY = 'fsbp_form_draft';

    function saveDraft() {
        const data = new FormData(form);
        const draft = {};
        data.forEach((v, k) => { draft[k] = v; });
        try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch (e) {}
    }

    function loadDraft() {
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (!raw) return;
            const draft = JSON.parse(raw);
            Object.keys(draft).forEach(name => {
                const field = form.querySelector(`[name="${name}"]`);
                if (field) field.value = draft[name];
            });
        } catch (e) {}
    }

    function clearDraft() {
        try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
    }

    // Восстанавливаем черновик при загрузке
    loadDraft();

    // Сохраняем при вводе (с задержкой)
    let draftTimer;
    form.addEventListener('input', () => {
        clearTimeout(draftTimer);
        draftTimer = setTimeout(saveDraft, 500);
    });

    // --- Отправка ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Honeypot-проверка (если поле заполнено — это бот, молча игнорируем)
        // if (honeypot && honeypot.value) return;

        // Защита от повторной отправки
        if (submitBtn.disabled) return;

        submitBtn.disabled = true;
        submitBtn.textContent = 'ОТПРАВКА...';
        statusDiv.textContent = '';
        statusDiv.style.color = '';

        const data = new FormData(form);

        // Простая валидация перед отправкой
        const nickname = (data.get('nickname') || '').trim();
        const age = parseInt(data.get('age'), 10);
        const contact = (data.get('contact') || '').trim();

        if (!nickname || nickname.length < 2) {
            statusDiv.textContent = '> ОШИБКА: НИК СЛИШКОМ КОРОТКИЙ.';
            statusDiv.style.color = 'red';
            submitBtn.disabled = false;
            submitBtn.textContent = 'ОТПРАВИТЬ ЗАЯВКУ';
            return;
        }

        if (!age || age < 14 || age > 99) {
            statusDiv.textContent = '> ОШИБКА: ВОЗРАСТ ДОЛЖЕН БЫТЬ ОТ 14 ДО 99.';
            statusDiv.style.color = 'red';
            submitBtn.disabled = false;
            submitBtn.textContent = 'ОТПРАВИТЬ ЗАЯВКУ';
            return;
        }

        if (!contact) {
            statusDiv.textContent = '> ОШИБКА: УКАЖИТЕ КОНТАКТ ДЛЯ СВЯЗИ.';
            statusDiv.style.color = 'red';
            submitBtn.disabled = false;
            submitBtn.textContent = 'ОТПРАВИТЬ ЗАЯВКУ';
            return;
        }

        // Формируем payload для Discord (отправит Worker)
        const payload = {
            username: "Терминал Рейдеров [FSBP]",
            embeds: [{
                title: "📡 Новая заявка в клан!",
                color: 16711935,
                fields: [
                    { name: "1. Ник", value: nickname, inline: true },
                    { name: "2. Возраст", value: String(age), inline: true },
                    { name: "3. Время от МСК", value: data.get('timezone') || '—', inline: true },
                    { name: "4. Занятость", value: data.get('occupation') || '—', inline: true },
                    { name: "5. Опыт в кланах", value: data.get('experience') || '—', inline: false },
                    { name: "6. Контакты", value: contact, inline: false }
                ],
                timestamp: new Date().toISOString()
            }]
        };

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            statusDiv.textContent = '> ЗАЯВКА УСПЕШНО ОТПРАВЛЕНА В ШТАБ.';
            statusDiv.style.color = '#39ff14';
            form.reset();
            clearDraft();
        } catch (error) {
            statusDiv.textContent = '> ОШИБКА СВЯЗИ. ПОПРОБУЙТЕ ПОЗЖЕ.';
            statusDiv.style.color = 'red';
            console.error('[form] Ошибка отправки:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'ОТПРАВИТЬ ЗАЯВКУ';
        }
    });
});

// ============================================================
//  КНОПКА "НАВЕРХ" С ГЛИТЧ-ЭФФЕКТОМ
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;

    // Показываем кнопку после 300px прокрутки
    let scrollTicking = false;

    function updateButtonVisibility() {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
        scrollTicking = false;
    }

    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            window.requestAnimationFrame(updateButtonVisibility);
            scrollTicking = true;
        }
    }, { passive: true });

    // Клик — плавный скролл наверх
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

// ============================================================
//  плавный скролл для внутренних якорных ссылок
//  (если на сайте появятся <a href="#roster"> и т.п.)
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
