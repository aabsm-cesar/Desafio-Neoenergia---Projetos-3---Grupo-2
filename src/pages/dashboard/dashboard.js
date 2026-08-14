// NeoDemanda - Página: Dashboard Inicial

import { currentProject, projectsHistory, setCurrentProject, createEmptyProject, findProjectById } from '../../state/project.js';
import { updateTopBar } from '../../components/topbar.js';
import { switchView } from '../../app-shell.js';

export function renderDashboard() {
    const historyContainer = document.getElementById('projects-history-list');

    if (projectsHistory.length === 0) {
        historyContainer.innerHTML = `
            <div class="empty-state">
                <i data-lucide="folder-open"></i>
                <h3>Nenhum projeto ativo</h3>
                <p>Clique em "Novo Projeto" no menu superior para iniciar seu primeiro dimensionamento.</p>
                <button class="btn btn-secondary" onclick="createNewProject()" style="margin-top: 8px;">
                    <i data-lucide="plus"></i> Iniciar Novo Projeto
                </button>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    // Preenche os cartões-resumo com o projeto ativo (se houver)
    if (currentProject.id) {
        document.getElementById('dash-demand-val').innerHTML = `${currentProject.calculations.totalDemandKva.toFixed(1)} <span style="font-size: 1rem; color: var(--text-secondary);">kVA</span>`;
        document.getElementById('dash-demand-desc').innerText = `Cálculo realizado: ${currentProject.calculations.totalDemandKw.toFixed(1)} kW`;
        document.getElementById('dash-supply-val').innerText = currentProject.calculations.category;

        const totalUnits = currentProject.units.reduce((sum, u) => sum + parseInt(u.qty || 0), 0);
        document.getElementById('dash-units-val').innerText = totalUnits;

        const conformityCard = document.getElementById('dash-conformity-card');
        const statusVal = document.getElementById('dash-status-val');

        statusVal.innerText = currentProject.status;
        conformityCard.className = 'dashboard-card';
        if (currentProject.status === 'Pronto') {
            conformityCard.classList.add('success');
        } else if (currentProject.status === 'Em cálculo') {
            conformityCard.classList.add('warning');
        } else {
            conformityCard.classList.add('primary');
        }
    } else {
        document.getElementById('dash-demand-val').innerHTML = `-- <span style="font-size: 1rem; color: var(--text-secondary);">kVA</span>`;
        document.getElementById('dash-demand-desc').innerText = 'Selecione ou crie um projeto';
        document.getElementById('dash-supply-val').innerText = 'N/A';
        document.getElementById('dash-units-val').innerText = '0';
        document.getElementById('dash-status-val').innerText = 'Nenhum Projeto';
        document.getElementById('dash-conformity-card').className = 'dashboard-card primary';
    }

    // Preenche a lista de histórico de projetos
    let historyHtml = '';
    projectsHistory.forEach(proj => {
        let statusBadge = 'badge-draft';
        if (proj.status === 'Em cálculo') statusBadge = 'badge-calculating';
        if (proj.status === 'Pronto') statusBadge = 'badge-ready';

        const demandInfo = proj.calculations.totalDemandKva > 0 ? `${proj.calculations.totalDemandKva.toFixed(1)} kVA` : 'Não Calculado';
        const activeClass = (proj.id === currentProject.id) ? 'style="border-color: var(--primary); background-color: rgba(0, 167, 87, 0.02);"' : '';

        historyHtml += `
            <div class="history-item" ${activeClass} onclick="loadProject('${proj.id}')">
                <div class="history-item-left">
                    <span class="history-item-title">${proj.name}</span>
                    <span class="history-item-meta">CEP: ${proj.cep} | Demanda: ${demandInfo}</span>
                </div>
                <span class="badge ${statusBadge}">${proj.status}</span>
            </div>
        `;
    });

    historyContainer.innerHTML = historyHtml;
    lucide.createIcons();
}

export function createNewProject() {
    const project = createEmptyProject();
    project.id = 'proj-' + Date.now();
    project.name = 'Novo Empreendimento';
    project.units = [
        { id: 1, type: 'Apto Padrão A (< 80m²)', qty: 4, load: 8.5, acQty: 1 }
    ];
    project.condoLoads = { lighting: 3, elevators: 0, elevatorPower: 0, pumps: 1.5 };

    setCurrentProject(project);
    updateTopBar();
    switchView('input-form');
}

export function loadProject(id) {
    const found = findProjectById(id);
    if (found) {
        setCurrentProject(JSON.parse(JSON.stringify(found)));
        updateTopBar();
        switchView('dashboard');
    }
}
