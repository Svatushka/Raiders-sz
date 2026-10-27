/* ============================================================
   [FSBP] RAIDERS — script.js
   ============================================================ */

// --- 1. AOS (анимации при скролле) ---
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// --- 2. НАСТРОЙКИ ---
// ⚠️ URL твоего Cloudflare Worker (НЕ вебхук Discord напрямую!)
const WEBHOOK_URL = 'https://ВАШ-ВОРКЕР.workers.dev';

// ============================================================
//  ОТПРАВКА ФОРМЫ (через Cloudflare Worker → Discord)
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('clan-form');
    const submitBtn = document.getElementById('submit-btn');
    const statusDiv = document.getElementById('form-status');

    if (!form || !submitBtn || !statusDiv) return;

    const honeypot = form.querySelector('input[name="website"]');
    const DRAFT_KEY = 'fsbp_form_draft';

    // --- Черновик ---
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
                if (field && name !== 'website') field.value = draft[name];
            });
        } catch (e) {}
    }

    function clearDraft() {
        try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
    }

    loadDraft();

    let draftTimer;
    form.addEventListener('input', () => {
        clearTimeout(draftTimer);
        draftTimer = setTimeout(saveDraft, 500);
    });

    // --- Показ ошибки ---
    function showError(text) {
        statusDiv.textContent = '> ' + text;
        statusDiv.style.color = 'red';
        submitBtn.disabled = false;
        submitBtn.textContent = 'ОТПРАВИТЬ ЗАЯВКУ';
    }

    // --- Отправка ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Honeypot: если поле заполнено — это бот
        if (honeypot && honeypot.value) {
            // Имитируем успех, чтобы бот не догадался
            statusDiv.textContent = '> ЗАЯВКА УСПЕШНО ОТПРАВЛЕНА В ШТАБ.';
            statusDiv.style.color = '#39ff14';
            form.reset();
            return;
        }

        if (submitBtn.disabled) return;

        submitBtn.disabled = true;
        submitBtn.textContent = 'ОТПРАВКА...';
        statusDiv.textContent = '';
        statusDiv.style.color = '';

        const data = new FormData(form);
        const nickname = (data.get('nickname') || '').trim();
        const age = parseInt(data.get('age'), 10);
        const contact = (data.get('contact') || '').trim();
        const timezone = (data.get('timezone') || '').trim();
        const occupation = data.get('occupation') || '';
        const experience = (data.get('experience') || '').trim();

        if (nickname.length < 2) return showError('НИК СЛИШКОМ КОРОТКИЙ.');
        if (!age || age < 14 || age > 99) return showError('ВОЗРАСТ ДОЛЖЕН БЫТЬ ОТ 14 ДО 99.');
        if (!timezone) return showError('УКАЖИТЕ ВРЕМЯ ОТ МСК.');
        if (!occupation) return showError('ВЫБЕРИТЕ РОД ЗАНЯТИЙ.');
        if (!experience) return showError('ЗАПОЛНИТЕ ОПЫТ В КЛАНАХ.');
        if (!contact) return showError('УКАЖИТЕ КОНТАКТ ДЛЯ СВЯЗИ.');

        const payload = {
            username: "Терминал Рейдеров [FSBP]",
            embeds: [{
                title: "📡 Новая заявка в клан!",
                color: 16711935,
                fields: [
                    { name: "1. Ник", value: nickname, inline: true },
                    { name: "2. Возраст", value: String(age), inline: true },
                    { name: "3. Время от МСК", value: timezone, inline: true },
                    { name: "4. Занятость", value: occupation, inline: true },
                    { name: "5. Опыт в кланах", value: experience, inline: false },
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

            if (!response.ok) throw new Error('HTTP ' + response.status);

            statusDiv.textContent = '> ЗАЯВКА УСПЕШНО ОТПРАВЛЕНА В ШТАБ.';
            statusDiv.style.color = '#39ff14';
            form.reset();
            clearDraft();
        } catch (error) {
            statusDiv.textContent = '> ОШИБКА СВЯЗИ. ПОПРОБУЙТЕ ПОЗЖЕ.';
            statusDiv.style.color = 'red';
            console.error('[form] Ошибка:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'ОТПРАВИТЬ ЗАЯВКУ';
        }
    });
});

// ============================================================
//  КНОПКА "НАВЕРХ"
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;

    let ticking = false;

    function updateVisibility() {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
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
//  Плавный скролл по якорям (#roster, #apply и т.д.)
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
