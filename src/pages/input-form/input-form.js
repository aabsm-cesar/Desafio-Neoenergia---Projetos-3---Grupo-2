// NeoDemanda - Página: Entrada de Dados do Projeto

import { currentProject } from '../../state/project.js';
import { updateProjectProgress } from '../../components/topbar.js';
import { runCalculations } from '../../services/calculations.js';
import { switchView } from '../../app-shell.js';

export function renderInputForm() {
    document.getElementById('project-name-input').value = currentProject.name || '';
    document.getElementById('project-cep-input').value = currentProject.cep || '';
    document.getElementById('project-area-input').value = currentProject.area || '';
    document.getElementById('project-floors-input').value = currentProject.floors || '';
    document.getElementById('project-use-input').value = currentProject.use || 'residencial';

    setCalculationMode(currentProject.mode);
    rebuildUnitsTable();

    document.getElementById('condo-lighting').value = currentProject.condoLoads.lighting;
    document.getElementById('condo-elevators').value = currentProject.condoLoads.elevators;
    document.getElementById('condo-elevator-power').value = currentProject.condoLoads.elevatorPower;
    document.getElementById('condo-pumps').value = currentProject.condoLoads.pumps;
}

// Alterna entre Modo Simplificado e Modo Completo
export function setCalculationMode(mode) {
    currentProject.mode = mode;

    const toggleSimp = document.getElementById('toggle-simplificado');
    const toggleComp = document.getElementById('toggle-completo');
    const sectionCondo = document.getElementById('section-condo-loads');

    if (mode === 'simplificado') {
        toggleSimp.classList.add('active');
        toggleComp.classList.remove('active');
        sectionCondo.style.display = 'none';
    } else {
        toggleSimp.classList.remove('active');
        toggleComp.classList.add('active');
        sectionCondo.style.display = 'block';
    }
}

export function rebuildUnitsTable() {
    const tableBody = document.getElementById('units-table-body');
    tableBody.innerHTML = '';

    if (currentProject.units.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                    Nenhuma unidade cadastrada. Adicione uma linha para começar.
                </td>
            </tr>
        `;
        return;
    }

    currentProject.units.forEach((unit) => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>
                <select class="table-input" onchange="updateUnitField(${unit.id}, 'type', this.value)">
                    <option value="Apto Padrão A (< 80m²)" ${unit.type.includes('Padrão A') ? 'selected' : ''}>Apto Padrão A (< 80m²)</option>
                    <option value="Apto Padrão B (80m² - 120m²)" ${unit.type.includes('Padrão B') ? 'selected' : ''}>Apto Padrão B (80m² - 120m²)</option>
                    <option value="Cobertura / Duplex (> 120m²)" ${unit.type.includes('Cobertura') ? 'selected' : ''}>Cobertura / Duplex (> 120m²)</option>
                    <option value="Sala Comercial Padrão" ${unit.type.includes('Sala Comercial') ? 'selected' : ''}>Sala Comercial Padrão</option>
                    <option value="Loja / Pavimento Único" ${unit.type.includes('Loja') ? 'selected' : ''}>Loja / Pavimento Único</option>
                </select>
            </td>
            <td>
                <input type="number" class="table-input" value="${unit.qty}" min="1" oninput="updateUnitField(${unit.id}, 'qty', this.value)">
            </td>
            <td>
                <input type="number" class="table-input" value="${unit.load}" step="0.1" oninput="updateUnitField(${unit.id}, 'load', this.value)">
            </td>
            <td>
                <input type="number" class="table-input" value="${unit.acQty}" min="0" oninput="updateUnitField(${unit.id}, 'acQty', this.value)">
            </td>
            <td style="text-align: center;">
                <button class="btn-table-action" onclick="deleteUnitRow(${unit.id})" title="Remover linha">
                    <i data-lucide="trash-2"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    lucide.createIcons();
}

export function addUnitRow() {
    const newId = currentProject.units.length > 0 ? Math.max(...currentProject.units.map(u => u.id)) + 1 : 1;
    currentProject.units.push({
        id: newId,
        type: 'Apto Padrão A (< 80m²)',
        qty: 4,
        load: 8.5,
        acQty: 1
    });
    rebuildUnitsTable();
    updateProjectProgress();
}

export function deleteUnitRow(id) {
    currentProject.units = currentProject.units.filter(u => u.id !== id);
    rebuildUnitsTable();
    updateProjectProgress();
}

export function updateUnitField(id, field, value) {
    const unit = currentProject.units.find(u => u.id === id);
    if (unit) {
        if (field === 'qty' || field === 'acQty') {
            unit[field] = parseInt(value || 0);
        } else if (field === 'load') {
            unit[field] = parseFloat(value || 0);
        } else {
            unit[field] = value;
        }
    }
}

// Dispara o cálculo, com animação de carregamento
export function triggerCalculation() {
    currentProject.name = document.getElementById('project-name-input').value;
    currentProject.cep = document.getElementById('project-cep-input').value;
    currentProject.area = parseFloat(document.getElementById('project-area-input').value || 0);
    currentProject.floors = parseInt(document.getElementById('project-floors-input').value || 0);
    currentProject.use = document.getElementById('project-use-input').value;

    currentProject.condoLoads.lighting = parseFloat(document.getElementById('condo-lighting').value || 0);
    currentProject.condoLoads.elevators = parseInt(document.getElementById('condo-elevators').value || 0);
    currentProject.condoLoads.elevatorPower = parseFloat(document.getElementById('condo-elevator-power').value || 0);
    currentProject.condoLoads.pumps = parseFloat(document.getElementById('condo-pumps').value || 0);

    if (!currentProject.name || !currentProject.cep || !currentProject.area || currentProject.units.length === 0) {
        alert("Por favor, preencha todos os campos obrigatórios (*) e adicione pelo menos uma unidade consumidora.");
        return;
    }

    document.getElementById('loading-overlay').style.display = 'flex';
    document.getElementById('loading-text').innerText = "Processando simultaneidade das unidades elétricas...";

    setTimeout(() => {
        document.getElementById('loading-text').innerText = "Carregando fatores de demanda do ar condicionado...";
        setTimeout(() => {
            document.getElementById('loading-text').innerText = "Analisando conformidade com a norma SM04.2-PE...";
            setTimeout(() => {
                runCalculations();
                document.getElementById('loading-overlay').style.display = 'none';
                switchView('results');

                if (currentProject.calculations.totalDemandKva <= 75) {
                    confetti({
                        particleCount: 80,
                        spread: 60,
                        origin: { y: 0.8 }
                    });
                }
            }, 600);
        }, 600);
    }, 600);
}
