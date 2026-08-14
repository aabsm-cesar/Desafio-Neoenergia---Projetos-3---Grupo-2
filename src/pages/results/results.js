// NeoDemanda - Página: Resultados do Cálculo

import { currentProject } from '../../state/project.js';
import { getSimultaneityFactor, getAcDemandFactor } from '../../services/calculations.js';

let distributionChart = null;

export function renderResults() {
    const calc = currentProject.calculations;

    document.getElementById('result-total-kva').innerHTML = `${calc.totalDemandKva.toFixed(1)} <span>kVA</span>`;
    document.getElementById('result-category-label').innerText = `Fornecimento: ${calc.category}`;

    if (calc.totalDemandKva <= 10) {
        document.getElementById('result-voltage-detail').innerText = 'Tensão: 220V - Monofásico';
    } else if (calc.totalDemandKva <= 22) {
        document.getElementById('result-voltage-detail').innerText = 'Tensão: 380/220V - Bifásico';
    } else {
        document.getElementById('result-voltage-detail').innerText = 'Tensão: 380/220V - Trifásico';
    }

    document.getElementById('result-res-total-val').innerText = `${calc.resDemand.toFixed(1)} kW`;
    document.getElementById('result-ac-total-val').innerText = `${calc.acDemand.toFixed(1)} kW`;
    document.getElementById('result-condo-total-val').innerText = `${calc.condoDemand.toFixed(1)} kW`;

    buildResidentialBreakdownTable();
    buildAcBreakdownDetails();
    buildCondoBreakdownDetails();
    buildConformityAlerts();

    setTimeout(() => {
        initDistributionChart();
    }, 100);
}

function buildResidentialBreakdownTable() {
    const tbody = document.getElementById('result-table-res-body');
    tbody.innerHTML = '';

    let totalQty = 0;
    currentProject.units.forEach(u => totalQty += u.qty);
    const fs = getSimultaneityFactor(totalQty);

    currentProject.units.forEach(u => {
        const rawAccumulated = u.qty * u.load;
        const reduced = rawAccumulated * fs;

        tbody.innerHTML += `
            <tr>
                <td><strong>${u.type}</strong></td>
                <td>${u.qty}</td>
                <td>${u.load.toFixed(1)} kW</td>
                <td>${rawAccumulated.toFixed(1)} kW</td>
                <td>${(fs * 100).toFixed(0)}%</td>
                <td>${reduced.toFixed(1)} kW</td>
            </tr>
        `;
    });
}

function buildAcBreakdownDetails() {
    const div = document.getElementById('result-ac-detail-content');
    const totalAc = currentProject.units.reduce((sum, u) => sum + (u.acQty * u.qty), 0);
    const rawKw = totalAc * 1.5;
    const factor = getAcDemandFactor(totalAc);

    div.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
            <div>Total de aparelhos de Ar Condicionado: <strong>${totalAc}</strong></div>
            <div>Carga instalada bruta de AC: <strong>${rawKw.toFixed(1)} kW</strong></div>
            <div>Fator de simultaneidade aplicada (AC): <strong>${(factor * 100).toFixed(0)}%</strong></div>
            <div style="color: var(--primary);">Demanda resultante ar condicionado: <strong>${currentProject.calculations.acDemand.toFixed(1)} kW</strong></div>
        </div>
    `;
}

function buildCondoBreakdownDetails() {
    const div = document.getElementById('result-condo-detail-content');

    if (currentProject.mode === 'completo') {
        const l = currentProject.condoLoads;
        const elevFactor = l.elevators >= 2 ? 0.85 : 1.0;
        const elevKw = l.elevators * l.elevatorPower * elevFactor;

        div.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                <div>Iluminação condomínio: <strong>${l.lighting.toFixed(1)} kW</strong></div>
                <div>Elevadores (Qtd: ${l.elevators}): <strong>${elevKw.toFixed(1)} kW (fator: ${(elevFactor * 100).toFixed(0)}%)</strong></div>
                <div>Bombas d'água: <strong>${l.pumps.toFixed(1)} kW</strong></div>
                <div style="color: var(--primary);">Demanda total de serviço condomínio: <strong>${currentProject.calculations.condoDemand.toFixed(1)} kW</strong></div>
            </div>
        `;
    } else {
        div.innerHTML = `
            <p><strong>Cálculo Simplificado Ativo:</strong> Carga de serviço atribuída por taxa de ocupação (1.2 kW por grupo).</p>
            <p style="color: var(--primary); margin-top: 8px;">Demanda estimada de serviço: <strong>${currentProject.calculations.condoDemand.toFixed(1)} kW</strong></p>
        `;
    }
}

function buildConformityAlerts() {
    const container = document.getElementById('conformity-alerts-container');
    container.innerHTML = '';

    const kva = currentProject.calculations.totalDemandKva;

    if (kva > 75) {
        container.innerHTML += `
            <div class="custom-alert danger">
                <i data-lucide="x-circle"></i>
                <div class="custom-alert-content">
                    <h4>Exige Subestação Própria (Critério Técnico 5.1)</h4>
                    <p>A demanda calculada ultrapassou o limite máximo de 75 kVA para ligação em baixa tensão. De acordo com a norma SM04.2-PE, será exigido projeto de subestação aérea ou abrigada (Posto de Transformação) própria.</p>
                </div>
            </div>
        `;
    } else if (kva > 60) {
        container.innerHTML += `
            <div class="custom-alert warning">
                <i data-lucide="alert-triangle"></i>
                <div class="custom-alert-content">
                    <h4>Alerta de Proximidade de Limite Técnico</h4>
                    <p>A demanda está muito próxima de 75 kVA. Verifique se as previsões de cargas especiais do condomínio estão corretas para evitar custos extras com a necessidade de uma subestação privada.</p>
                </div>
            </div>
        `;
    } else {
        container.innerHTML += `
            <div class="custom-alert success">
                <i data-lucide="check-circle"></i>
                <div class="custom-alert-content">
                    <h4>Conforme com as Regras de Submissão</h4>
                    <p>A demanda calculada está dentro dos limites de fornecimento de baixa tensão. O projeto está apto para submissão direta no portal Neoenergia.</p>
                </div>
            </div>
        `;
    }

    if (currentProject.mode === 'simplificado' && kva > 50) {
        container.innerHTML += `
            <div class="custom-alert warning">
                <i data-lucide="alert-circle"></i>
                <div class="custom-alert-content">
                    <h4>Recomendado: Alterar para Modo Completo</h4>
                    <p>O Modo Simplificado é recomendado apenas para demandas menores que 50 kVA. Para evitar o indeferimento técnico do analista da Neoenergia, mude o tipo de cálculo para "Modo Completo" e declare as potências de elevadores e bombas detalhadamente.</p>
                </div>
            </div>
        `;
    }

    lucide.createIcons();
}

export function toggleAccordion(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.toggle('open');
    }
}

function initDistributionChart() {
    const canvas = document.getElementById('loadsDistributionChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const calc = currentProject.calculations;
    const data = [
        parseFloat(calc.resDemand.toFixed(1)),
        parseFloat(calc.acDemand.toFixed(1)),
        parseFloat(calc.condoDemand.toFixed(1))
    ];

    if (distributionChart) {
        distributionChart.destroy();
    }

    distributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Unid. Residenciais (kW)', 'Ar Condicionado (kW)', 'Condomínio/Serviços (kW)'],
            datasets: [{
                data: data,
                backgroundColor: [
                    '#00A757', // Verde Neoenergia
                    '#009EE2', // Azul Neoenergia
                    '#FF8F1C'  // Laranja Neoenergia
                ],
                borderWidth: 2,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}
