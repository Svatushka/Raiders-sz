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
