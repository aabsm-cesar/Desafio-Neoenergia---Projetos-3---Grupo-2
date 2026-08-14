// NeoDemanda - Página: Memorial Técnico (impressão em A4)

import { currentProject, projectsHistory, saveProjectsToStorage } from '../../state/project.js';
import { getSimultaneityFactor, getAcDemandFactor } from '../../services/calculations.js';
import { updateTopBar } from '../../components/topbar.js';
import { switchView } from '../../app-shell.js';

export function renderMemorial() {
    const calc = currentProject.calculations;

    document.getElementById('print-proj-name').innerText = currentProject.name;
    document.getElementById('print-proj-city').innerText = currentProject.city || 'Recife - PE';
    document.getElementById('print-proj-cep').innerText = currentProject.cep;
    document.getElementById('print-proj-area').innerText = `${currentProject.area} m²`;
    document.getElementById('print-proj-floors').innerText = currentProject.floors;

    const now = new Date();
    document.getElementById('print-proj-date').innerText = now.toLocaleDateString('pt-BR');
    document.getElementById('print-total-demand-val').innerText = `${calc.totalDemandKva.toFixed(1)} kVA`;
    document.getElementById('print-category-val').innerText = calc.category;

    const tbodyUnits = document.getElementById('print-table-units-body');
    tbodyUnits.innerHTML = '';

    currentProject.units.forEach(u => {
        const total = u.qty * u.load;
        tbodyUnits.innerHTML += `
            <tr>
                <td>${u.type}</td>
                <td>${u.qty}</td>
                <td>${u.load.toFixed(1)} kW</td>
                <td>${u.qty * u.acQty}</td>
                <td>${total.toFixed(1)} kW</td>
            </tr>
        `;
    });

    const tbodyBreak = document.getElementById('print-table-breakdown-body');
    const totalResQty = currentProject.units.reduce((sum, u) => sum + u.qty, 0);
    const resFs = getSimultaneityFactor(totalResQty);
    const rawResSum = currentProject.units.reduce((sum, u) => sum + (u.qty * u.load), 0);

    const totalAc = currentProject.units.reduce((sum, u) => sum + (u.acQty * u.qty), 0);
    const acFactor = getAcDemandFactor(totalAc);
    const rawAcSum = totalAc * 1.5;

    tbodyBreak.innerHTML = `
        <tr>
            <td>Unidades Consumidoras Coletivas</td>
            <td>${rawResSum.toFixed(1)} kW</td>
            <td>${(resFs * 100).toFixed(0)}% (Fator de Simultaneidade)</td>
            <td>${calc.resDemand.toFixed(1)} kW</td>
        </tr>
        <tr>
            <td>Sistema de Condicionamento de Ar</td>
            <td>${rawAcSum.toFixed(1)} kW</td>
            <td>${(acFactor * 100).toFixed(0)}% (Fator de Demanda)</td>
            <td>${calc.acDemand.toFixed(1)} kW</td>
        </tr>
        <tr>
            <td>Carga de Condomínio e Áreas Comuns</td>
            <td>${calc.condoDemand.toFixed(1)} kW</td>
            <td>100% (Fator de Demanda Coletiva)</td>
            <td>${calc.condoDemand.toFixed(1)} kW</td>
        </tr>
        <tr class="total-row">
            <td>Demanda Elétrica Total Ativa</td>
            <td>${(rawResSum + rawAcSum + calc.condoDemand).toFixed(1)} kW</td>
            <td>FP = 0.92</td>
            <td>${calc.totalDemandKw.toFixed(1)} kW</td>
        </tr>
    `;

    const subBtn = document.getElementById('btn-finalize-sub');
    if (calc.totalDemandKva === 0) {
        subBtn.setAttribute('disabled', 'true');
        subBtn.style.opacity = '0.5';
    } else {
        subBtn.removeAttribute('disabled');
        subBtn.style.opacity = '1';
    }
}

// Marca o projeto ativo como "Pronto" para submissão
export function finalizeSubmission() {
    currentProject.status = 'Pronto';

    const idx = projectsHistory.findIndex(p => p.id === currentProject.id);
    if (idx !== -1) {
        projectsHistory[idx].status = 'Pronto';
    }

    saveProjectsToStorage();
    updateTopBar();

    confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
    });

    alert("Parabéns! O projeto foi marcado como 'Pronto para Submissão' e os arquivos XML normativos foram habilitados para submissão.");
    switchView('dashboard');
}
