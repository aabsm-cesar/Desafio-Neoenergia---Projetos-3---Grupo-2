// NeoDemanda - Página: Login (acesso via conta de demonstração)

export function continueAsGuest() {
    sessionStorage.setItem('neodemanda_user', 'Projetista Visitante');
    sessionStorage.setItem('neodemanda_role', 'Modo Demonstração');
    window.location.href = 'app.html';
}

function initLoginPage() {
    lucide.createIcons();

    // Se já estiver logado, vai direto para o app
    if (sessionStorage.getItem('neodemanda_user')) {
        window.location.href = 'app.html';
    }
}

document.addEventListener('DOMContentLoaded', initLoginPage);
