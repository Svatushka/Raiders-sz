// --- НАСТРОЙКА ФОНОВЫХ ЧАСТИЦ (Киберпанк) ---
particlesJS("particles-js", {
    "particles": {
        "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
        "color": { "value": ["#ff00ff", "#00ffff"] },
        "shape": { "type": "circle" },
        "opacity": { "value": 0.5, "random": true, "anim": { "enable": true, "speed": 1, "opacity_min": 0.1, "sync": false } },
        "size": { "value": 3, "random": true, "anim": { "enable": true, "speed": 2, "size_min": 0.1, "sync": false } },
        "line_linked": { "enable": true, "distance": 150, "color": "#00ffff", "opacity": 0.2, "width": 1 },
        "move": { "enable": true, "speed": 2, "direction": "none", "random": true, "straight": false, "out_mode": "out", "bounce": false }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": { "enable": true, "mode": "grab" },
            "onclick": { "enable": true, "mode": "push" }
        },
        "modes": {
            "grab": { "distance": 140, "line_linked": { "opacity": 0.8 } },
            "push": { "particles_nb": 4 }
        }
    },
    "retina_detect": true
});

// --- ИНИЦИАЛИЗАЦИЯ АНИМАЦИЙ СКРОЛЛА (AOS) ---
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// --- ЛОГИКА ОТПРАВКИ ФОРМЫ В DISCORD ---
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('clan-form');
    const submitBtn = document.getElementById('submit-btn');
    const statusDiv = document.getElementById('form-status');

    // ⚠️ ВСТАВЬТЕ ССЫЛКУ НА ВАШ ВЕБХУК DISCORD НИЖЕ
    const WEBHOOK_URL = 'https://discord.com/api/webhooks/1564231664337428501/C8abZ01ZEyzkOd4oxOva6bLqc6i1UUxDtIqstZH1vxOqKu78ykphM83ZWK48dRw38rMO';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'ОТПРАВКА...';
        statusDiv.textContent = '';

        const data = new FormData(form);

        const payload = {
            username: "Терминал Рейдеров [FSBP]",
            embeds: [{
                title: "📡 Новая заявка в клан!",
                color: 16711935,
                fields: [
                    { name: "1. Ник", value: data.get('nickname'), inline: true },
                    { name: "2. Возраст", value: data.get('age'), inline: true },
                    { name: "3. Время от МСК", value: data.get('timezone'), inline: true },
                    { name: "4. Занятость", value: data.get('occupation'), inline: true },
                    { name: "5. Опыт в кланах", value: data.get('experience'), inline: false },
                    { name: "6. Контакты", value: data.get('contact'), inline: false }
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

            if (response.ok) {
                statusDiv.textContent = '> ЗАЯВКА УСПЕШНО ОТПРАВЛЕНА В ШТАБ.';
                statusDiv.style.color = '#39ff14';
                form.reset();
            } else {
                throw new Error('Ошибка Discord');
            }
        } catch (error) {
            statusDiv.textContent = '> ОШИБКА СВЯЗИ. ПОПРОБУЙТЕ ПОЗЖЕ.';
            statusDiv.style.color = 'red';
            console.error(error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'ОТПРАВИТЬ ЗАЯВКУ';
        }
    });
});
