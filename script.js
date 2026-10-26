document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('clan-form');
    const submitBtn = document.getElementById('submit-btn');
    const statusDiv = document.getElementById('form-status');

    // ВСТАВЬТЕ ССЫЛКУ ВНУТРЬ КАВЫЧЕК НИЖЕ:
    const DISCORD_WEBHOOK_URL = 'ВАША_ССЫЛКА_НА_ВЕБХУК';

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Отменяем стандартную отправку формы

        // Блокируем кнопку от повторных нажатий
        submitBtn.disabled = true;
        submitBtn.textContent = 'ОТПРАВКА ДАННЫХ...';
        statusDiv.textContent = '';
        statusDiv.style.color = 'var(--neon-blue)';

        // Получаем данные из формы
        const formData = new FormData(form);
        const nickname = formData.get('nickname');
        const age = formData.get('age');
        const timezone = formData.get('timezone');
        const occupation = formData.get('occupation');
        const experience = formData.get('experience');
        const contact = formData.get('contact');

        // Формируем красивое сообщение (Embed) для Discord
        const payload = {
            username: "Терминал Рейдеров [FSBP]",
            avatar_url: "https://i.imgur.com/your_avatar_url_here.png", // Ссылка на аватарку бота
            embeds: [
                {
                    title: "📡 Новая заявка в клан!",
                    color: 16711935, // Розовый неон
                    fields: [
                        { name: "1. Ник", value: nickname, inline: true },
                        { name: "2. Возраст", value: age, inline: true },
                        { name: "3. Время от МСК", value: timezone, inline: true },
                        { name: "4. Занятость", value: occupation, inline: true },
                        { name: "5. Опыт в кланах", value: experience, inline: false },
                        { name: "6. Контакты", value: contact, inline: false }
                    ],
                    footer: {
                        text: "Stalzone | Cyber-Stalker System"
                    },
                    timestamp: new Date().toISOString()
                }
            ]
        };

        try {
            // Обратите внимание на запятую после DISCORD_WEBHOOK_URL!
            const response = await fetch(https://discord.com/api/webhooks/1564231664337428501/C8abZ01ZEyzkOd4oxOva6bLqc6i1UUxDtIqstZH1vxOqKu78ykphM83ZWK48dRw38rMO, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                statusDiv.textContent = '> ЗАЯВКА УСПЕШНО ОТПРАВЛЕНА В ШТАБ.';
                statusDiv.style.color = 'var(--stalker-green)';
                form.reset(); // Очищаем форму
            } else {
                throw new Error('Ошибка отправки');
            }
        } catch (error) {
            statusDiv.textContent = '> ОШИБКА СВЯЗИ. ПОПРОБУЙТЕ ПОЗЖЕ.';
            statusDiv.style.color = 'red';
            console.error('Ошибка:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'ОТПРАВИТЬ ЗАЯВКУ';
        }
    });
});