// NeoDemanda - Componente: Top Bar (nome do projeto, status, barra de progresso)

import { currentProject } from '../state/project.js';

export function updateTopBar() {
    document.getElementById('top-project-name').innerText = currentProject.name || 'Sem Nome';

    const statusBadge = document.getElementById('top-project-status');
    statusBadge.innerText = currentProject.status;
    statusBadge.className = 'badge';
    if (currentProject.status === 'Rascunho') statusBadge.classList.add('badge-draft');
    if (currentProject.status === 'Em cálculo') statusBadge.classList.add('badge-calculating');
    if (currentProject.status === 'Pronto') statusBadge.classList.add('badge-ready');

    updateProjectProgress();
}

export function updateProjectProgress() {
    let fields = 0;
    const totalFields = 5;

    if (currentProject.name) fields++;
    if (currentProject.cep) fields++;
    if (currentProject.area && currentProject.area > 0) fields++;
    if (currentProject.floors && currentProject.floors > 0) fields++;
    if (currentProject.units.length > 0) fields++;

    const percentage = Math.round((fields / totalFields) * 100);

    document.getElementById('project-progress-bar').style.width = percentage + '%';
    document.getElementById('project-progress-label').innerText = `Preenchimento: ${percentage}%`;
}
