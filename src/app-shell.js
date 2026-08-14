// NeoDemanda - App Shell: inicialização e roteamento entre as views (dashboard, input-form, results, memorial)

import { loadProjectsFromStorage, projectsHistory, setCurrentProject } from './state/project.js';
import { updateTopBar } from './components/topbar.js';
import { renderDashboard } from './pages/dashboard/dashboard.js';
import { renderInputForm } from './pages/input-form/input-form.js';
import { renderResults } from './pages/results/results.js';
import { renderMemorial } from './pages/memorial/memorial.js';

const VIEWS = ['dashboard', 'input-form', 'results', 'memorial'];

export function switchView(viewId) {
    // Esconde todas as views do shell
    VIEWS.forEach(v => {
        document.getElementById(`view-${v}`).style.display = 'none';
        document.getElementById(`menu-${v}`).classList.remove('active');
        document.getElementById(`mob-menu-${v}`).classList.remove('active');
    });

    // Mostra a view selecionada e ativa os itens de menu (desktop e mobile)
    document.getElementById(`view-${viewId}`).style.display = 'block';
    document.getElementById(`menu-${viewId}`).classList.add('active');
    document.getElementById(`mob-menu-${viewId}`).classList.add('active');

    // Dispara a renderização específica de cada view
    if (viewId === 'dashboard') renderDashboard();
    else if (viewId === 'input-form') renderInputForm();
    else if (viewId === 'results') renderResults();
    else if (viewId === 'memorial') renderMemorial();
}

export function handleLogout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}

function initApp() {
    // 1. Verifica sessão e carrega perfil do usuário
    const userName = sessionStorage.getItem('neodemanda_user');
    const userRole = sessionStorage.getItem('neodemanda_role');

    if (!userName) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('user-display-name').innerText = userName;
    document.getElementById('user-display-role').innerText = userRole || 'Projetista';

    // 2. Renderiza os ícones Lucide
    lucide.createIcons();

    // 3. Carrega projetos salvos e seleciona o primeiro como ativo
    loadProjectsFromStorage();
    if (projectsHistory.length > 0) {
        setCurrentProject(JSON.parse(JSON.stringify(projectsHistory[0])));
        updateTopBar();
    }

    // 4. Carrega o dashboard inicial
    switchView('dashboard');
}

document.addEventListener('DOMContentLoaded', initApp);
