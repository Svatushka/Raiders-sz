/* ============================================================
   [FSBP] RAIDERS — script.js
   ============================================================ */

// ⚠️ ВСТАВЬ ССЫЛКУ НА СВОЙ ВЕБХУК DISCORD НИЖЕ
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1564231664337428501/C8abZ01ZEyzkOd4oxOva6bLqc6i1UUxDtIqstZH1vxOqKu78ykphM83ZWK48dRw38rMO';

// --- 0. ТЕМА (загружаем ДО всего, чтобы не мигало) ---
(function initTheme() {
    const saved = localStorage.getItem('fsbp_theme') || 'cyberpunk';
    document.documentElement.setAttribute('data-theme', saved);
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
//  2. AOS
// ============================================================
window.addEventListener('load', () => {
    setTimeout(() => {
        AOS.init({ duration: 1000, once: true, offset: 100 });
    }, 2200);
});

// ============================================================
//  3. ПЕРЕКЛЮЧАТЕЛЬ ТЕМ
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.theme-btn');
    const current = document.documentElement.getAttribute('data-theme') || 'cyberpunk';

    buttons.forEach(btn => {
        if (btn.dataset.theme === current) btn.classList.add('active');
        else btn.classList.remove('active');

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

    const hoverTargets = 'a, button, input, select, textarea, .roster-card, .theme-btn';
    document.querySelectorAll(hoverTargets).forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('hover'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
})();

// ============================================================
//  5. KONAMI CODE → режим "ВЫБРОС"
// ============================================================
(function initKonami() {
    const sequence = [
        'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
        'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
        'b','a'
    ];
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
//  6. ФОРМА (WIZARD) — РЕАЛЬНАЯ ОТПРАВКА В DISCORD
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('clan-form');
    const submitBtn = document.getElementById('submit-btn');
    const statusDiv = document.getElementById('form-status');
    const wizNext = document.getElementById('wiz-next');
    const wizPrev = document.getElementById('wiz-prev');
    const wizardSteps = document.querySelectorAll('.wizard-step');
    const wizardIndicators = document.querySelectorAll('.wizard-step-indicator');

    if (!form || !submitBtn || !statusDiv) return;

    const DRAFT_KEY = 'fsbp_form_draft';
    const TOTAL_STEPS = wizardSteps.length;
    let currentStep = 1;

    // ---------- Черновик ----------
    function saveDraft() {
        const data = new FormData(form);
        const draft = {};
        data.forEach((v, k) => { if (k !== 'website') draft[k] = v; });
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

    // ---------- Управление wizard ----------
    function updateWizard() {
        wizardSteps.forEach(s => {
            s.classList.toggle('active', Number(s.dataset.step) === currentStep);
        });
        wizardIndicators.forEach(ind => {
            const n = Number(ind.dataset.stepNum);
            ind.classList.toggle('active', n === currentStep);
            ind.classList.toggle('done', n < currentStep);
        });

        wizPrev.classList.toggle('hidden', currentStep === 1);
        wizNext.classList.toggle('hidden', currentStep === TOTAL_STEPS);
        submitBtn.classList.toggle('hidden', currentStep !== TOTAL_STEPS);
    }

    function validateStep(stepNum) {
        const step = document.querySelector(`.wizard-step[data-step="${stepNum}"]`);
        if (!step) return true;
        const fields = step.querySelectorAll('input:not([type=hidden]):not(.honeypot), select, textarea');
        let valid = true;

        fields.forEach(field => {
            field.style.borderColor = '';
            const val = (field.value || '').trim();

            if (field.hasAttribute('required') && !val) {
                field.style.borderColor = '#ff0044';
                valid = false;
                return;
            }

            if (field.type === 'number' && val) {
                const num = parseInt(val, 10);
                const min = field.hasAttribute('min') ? parseInt(field.min, 10) : -Infinity;
                const max = field.hasAttribute('max') ? parseInt(field.max, 10) : Infinity;
                if (num < min || num > max) {
                    field.style.borderColor = '#ff0044';
                    valid = false;
                }
            }
        });

        if (!valid) {
            statusDiv.textContent = '> ЗАПОЛНИТЕ ВСЕ ПОЛЯ ЭТОГО ШАГА.';
            statusDiv.style.color = 'red';
        } else {
            statusDiv.textContent = '';
        }
        return valid;
    }

    wizNext.addEventListener('click', () => {
        if (!validateStep(currentStep)) return;
        if (currentStep < TOTAL_STEPS) {
            currentStep++;
            updateWizard();
        }
    });

    wizPrev.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateWizard();
        }
    });

    updateWizard();

    // ---------- Реальная отправка ----------
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateStep(currentStep)) return;
        if (submitBtn.disabled) return;

        submitBtn.disabled = true;
        submitBtn.textContent = 'ОТПРАВКА...';
        statusDiv.textContent = '';
        statusDiv.style.color = '';

        const data = new FormData(form);
        const nickname = (data.get('nickname') || '').trim();
        const age = parseInt(data.get('age'), 10);
        const timezone = (data.get('timezone') || '').trim();
        const occupation = data.get('occupation') || '';
        const experience = (data.get('experience') || '').trim();
        const contact = (data.get('contact') || '').trim();

        // Формируем JSON для Discord
        const payload = {
            username: 'Терминал Рейдеров [FSBP]',
            embeds: [{
                title: '📡 Новая заявка в клан!',
                color: 16711935,
                fields: [
                    { name: '1. Ник', value: nickname, inline: true },
                    { name: '2. Возраст', value: String(age), inline: true },
                    { name: '3. Время от МСК', value: timezone, inline: true },
                    { name: '4. Занятость', value: occupation, inline: true },
                    { name: '5. Опыт в кланах', value: experience, inline: false },
                    { name: '6. Контакты', value: contact, inline: false }
                ],
                timestamp: new Date().toISOString()
            }]
        };

        // ХАК: Отправляем как FormData с ключом payload_json, чтобы обойти CORS
        const discordFormData = new FormData();
        discordFormData.append('payload_json', JSON.stringify(payload));

        try {
            // mode: 'no-cors' позволяет браузеру не блокировать запрос к Discord
            await fetch(DISCORD_WEBHOOK, {
                method: 'POST',
                mode: 'no-cors',
                body: discordFormData
            });

            // Из-за no-cors мы не можем прочитать ответ сервера, 
            // но если ошибки сети не было, значит Discord принял заявку.
            statusDiv.textContent = '> ЗАЯВКА УСПЕШНО ОТПРАВЛЕНА В ШТАБ.';
            statusDiv.style.color = '#39ff14';
            
            form.reset();
            clearDraft();
            currentStep = 1;
            updateWizard();
        } catch (error) {
            statusDiv.textContent = '> ОШИБКА СЕТИ. ПРОВЕРЬТЕ ПОДКЛЮЧЕНИЕ.';
            statusDiv.style.color = 'red';
            console.error('[form] Ошибка отправки:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'ОТПРАВИТЬ ЗАЯВКУ';
        }
    });
});

// ============================================================
//  7. КНОПКА "НАВЕРХ"
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
//  8. Плавный якорный скролл
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
