document.addEventListener('DOMContentLoaded', () => {
    // Smooth Scroll for Navigation Links
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    
    scrollLinks.forEach(link => {
        link.addEventListener('click', e => {
            const href = link.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Scroll Animation (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Target elements for animation
    const animateElements = document.querySelectorAll('.problem__item, .service__card, .feature-item, .benefit-card, .flow__step');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });

    // Handle is-visible class in CSS via JS for simplicity in this prototype
    const style = document.createElement('style');
    style.textContent = `
        .is-visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .contact-success {
            animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
    `;
    document.head.appendChild(style);

    // Header background change on scroll
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    });

    // Modal & Form Logic
    const GAS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbwV4WnpLy0vhwpqpN5fy_QOVg4c3rx8pYot4PXf-s_XtWhdHPIsR_LWgWldK-CASw6WaA/exec'; // Google Apps Script Web App URL
    const modal = document.getElementById('contact-modal');
    const modalClose = document.getElementById('modal-close');
    const contactLinks = document.querySelectorAll('a[href="#contact"]');
    const footerContactLink = document.getElementById('footer-contact');
    const form = modal ? modal.querySelector('form') : null;
    let successMessage = null;

    // Create success message element dynamically
    if (modal && form) {
        successMessage = document.createElement('div');
        successMessage.className = 'contact-success';
        successMessage.style.display = 'none';
        successMessage.style.textAlign = 'center';
        successMessage.style.padding = '40px 20px';
        successMessage.innerHTML = `
            <div style="margin-bottom: 20px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color, #2563eb)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle" style="display: inline-block;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 12px; color: var(--text-color, #1f2937);">送信が完了しました</h3>
            <p style="color: var(--text-light, #4b5563); line-height: 1.6; margin-bottom: 30px; font-size: 15px;">
                お問い合わせいただきありがとうございます。<br>
                内容を確認の上、担当者より1〜2営業日以内にご連絡いたします。
            </p>
            <button type="button" class="btn btn--primary" id="success-close-btn" style="min-width: 160px; padding: 12px 24px; cursor: pointer; display: inline-block;">閉じる</button>
        `;
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.appendChild(successMessage);
        }
    }

    const openModal = (e) => {
        if (e) e.preventDefault();
        modal.classList.add('is-active');
        document.body.classList.add('modal-open');
    };

    const resetModalState = () => {
        if (modal) {
            const modalTitle = modal.querySelector('.section-title');
            const formWrapper = modal.querySelector('.contact-form__wrapper');
            if (modalTitle) modalTitle.style.display = '';
            if (formWrapper) formWrapper.style.display = '';
            if (successMessage) successMessage.style.display = 'none';
        }
    };

    const closeModal = () => {
        modal.classList.remove('is-active');
        document.body.classList.remove('modal-open');
        // Reset the form view state after the modal transition finishes
        setTimeout(resetModalState, 300);
    };

    // Form Submission Handling
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('.btn--submit');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = '送信中...';

            const showSuccess = () => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;

                // Hide title and form, show success message
                const modalTitle = modal.querySelector('.section-title');
                const formWrapper = modal.querySelector('.contact-form__wrapper');
                if (modalTitle) modalTitle.style.display = 'none';
                if (formWrapper) formWrapper.style.display = 'none';
                if (successMessage) successMessage.style.display = 'block';

                // Reset form fields
                form.reset();
            };

            // Run mock submission if URL is not configured
            if (!GAS_WEBAPP_URL || GAS_WEBAPP_URL === 'YOUR_GAS_WEBAPP_URL_HERE') {
                setTimeout(showSuccess, 1200);
                return;
            }

            // Real submission to Google Apps Script (GAS)
            fetch(GAS_WEBAPP_URL, {
                method: 'POST',
                mode: 'no-cors', // Avoids CORS redirection issues in the browser console
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(new FormData(form)).toString()
            })
            .then(() => {
                showSuccess();
            })
            .catch((error) => {
                console.error('Submission error:', error);
                alert('送信中にエラーが発生しました。インターネット接続を確認の上、再度お試しください。');
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            });
        });
    }

    // Success Close Button Event
    if (successMessage) {
        const successCloseBtn = successMessage.querySelector('#success-close-btn');
        if (successCloseBtn) {
            successCloseBtn.addEventListener('click', closeModal);
        }
    }

    contactLinks.forEach(link => {
        link.addEventListener('click', openModal);
    });

    if (footerContactLink) {
        footerContactLink.addEventListener('click', openModal);
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-active')) {
            closeModal();
        }
    });
});
