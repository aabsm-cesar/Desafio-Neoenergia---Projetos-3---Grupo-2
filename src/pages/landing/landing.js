// NeoDemanda - Página: Landing institucional

function initLandingPage() {
    lucide.createIcons();
    initScrollReveal();
}

/**
 * Ativa animações de aparição (fade + slide) conforme os elementos
 * marcados com a classe `.reveal` entram na viewport durante o scroll.
 */
function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal');

    // Fallback: se o navegador não suportar IntersectionObserver, mostra tudo direto
    if (!('IntersectionObserver' in window)) {
        revealEls.forEach(el => el.classList.add('reveal-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target); // anima apenas uma vez
            }
        });
    }, {
        threshold: 0.15,      // dispara quando ~15% do elemento estiver visível
        rootMargin: '0px 0px -60px 0px' // antecipa um pouco antes de chegar no fim da tela
    });

    revealEls.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', initLandingPage);
