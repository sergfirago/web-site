document.addEventListener('DOMContentLoaded', () => {
    const registrationSection = document.getElementById('registration');
    const form = document.getElementById('registration-form');
    const message = document.getElementById('form-message');
    const registerButtons = document.querySelectorAll('.btn-register');

    registerButtons.forEach((button) => {
        button.addEventListener('click', () => {
            if (!registrationSection) {
                return;
            }

            registrationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    if (!form) {
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const submitButton = form.querySelector('button[type="submit"]');
        const formData = new FormData(form);

        if (submitButton instanceof HTMLButtonElement) {
            submitButton.disabled = true;
        }

        if (message) {
            message.textContent = '';
            message.className = 'form-message';
        }

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok || !data.ok) {
                throw new Error(data.error || 'Не удалось отправить заявку.');
            }

            if (message) {
                message.textContent = 'Заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.';
                message.className = 'form-message success';
            }

            // Измерение конверсии: GA4 + Яндекс.Метрика (fetch-отправка не даёт событий автоматически)
            if (typeof gtag === 'function') {
                gtag('event', 'form_submit');
            }
            if (typeof ym === 'function') {
                ym(113501155, 'reachGoal', 'ORDER');
            }

            form.reset();
        } catch (error) {
            if (message) {
                message.textContent = error instanceof Error ? error.message : 'Не удалось отправить заявку.';
                message.className = 'form-message error';
            }
        } finally {
            if (submitButton instanceof HTMLButtonElement) {
                submitButton.disabled = false;
            }
        }
    });
});

// Плавающая кнопка «Записаться»: появляется, когда первый экран ушёл из вида,
// и скрывается, когда виден блок регистрации (кнопка не дублируется).
const stickyCta = document.getElementById('sticky-cta');
if (stickyCta && 'IntersectionObserver' in window) {
    const hero = document.querySelector('.hero');
    const registration = document.getElementById('registration');
    let heroVisible = true;
    let registrationVisible = false;

    const updateVisibility = () => {
        stickyCta.hidden = heroVisible || registrationVisible;
    };

    if (hero) {
        new IntersectionObserver((entries) => {
            heroVisible = entries[0].isIntersecting;
            updateVisibility();
        }, { threshold: 0.1 }).observe(hero);
    }

    if (registration) {
        new IntersectionObserver((entries) => {
            registrationVisible = entries[0].isIntersecting;
            updateVisibility();
        }, { threshold: 0.1 }).observe(registration);
    }
}

// Аккордеон программы: длинные описания модулей свернуты до 3 строк,
// раскрываются по кнопке «Подробнее». Классы .program-list/.program-module не меняются.
document.querySelectorAll('.program-module').forEach((module) => {
    const paragraph = module.querySelector('p');
    if (!paragraph) {
        return;
    }

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'module-toggle';
    toggle.textContent = 'Подробнее';
    toggle.setAttribute('aria-expanded', 'false');
    module.appendChild(toggle);

    toggle.addEventListener('click', () => {
        const expanded = module.classList.toggle('module-open');
        toggle.textContent = expanded ? 'Свернуть' : 'Подробнее';
        toggle.setAttribute('aria-expanded', String(expanded));
    });
});
