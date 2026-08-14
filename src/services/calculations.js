// NeoDemanda - Serviço de Cálculo de Demanda Elétrica
// Regras normativas Neoenergia NDU-001 / SM04.2-PE

import { currentProject, saveProjectsToStorage, upsertProjectInHistory } from '../state/project.js';
import { updateTopBar } from '../components/topbar.js';

// Fator de simultaneidade residencial (f_s) conforme NDU-001
export function getSimultaneityFactor(n) {
    if (n <= 1) return 1.0;
    if (n === 2) return 0.82;
    if (n === 3) return 0.75;
    if (n === 4) return 0.70;
    if (n === 5) return 0.65;
    if (n <= 7) return 0.60;
    if (n <= 10) return 0.52;
    if (n <= 15) return 0.48;
    if (n <= 20) return 0.44;
    if (n <= 25) return 0.41;
    if (n <= 30) return 0.38;
    if (n <= 40) return 0.34;
    if (n <= 50) return 0.31;
    return 0.28; // 50+ unidades
}

// Fator de demanda para ar-condicionado
export function getAcDemandFactor(qty) {
    if (qty <= 1) return 1.0;
    if (qty <= 4) return 0.85;
    if (qty <= 10) return 0.75;
    return 0.60;
}

// Executa o cálculo completo de demanda para o projeto ativo
export function runCalculations() {
    // 1. Demanda das Unidades Residenciais (kW)
    let resUnitsQty = 0;
    let resRawLoad = 0;
    currentProject.units.forEach(u => {
        resUnitsQty += u.qty;
        resRawLoad += (u.qty * u.load);
    });

    const resSimultaneityFactor = getSimultaneityFactor(resUnitsQty);
    const resDemand = resRawLoad * resSimultaneityFactor;

    // 2. Demanda de Ar Condicionado (kW)
    const totalAcDevices = currentProject.units.reduce((sum, u) => sum + (u.acQty * u.qty), 0);
    const acRawLoad = totalAcDevices * 1.5; // Média de 1.5 kW por aparelho
    const acDemandFactor = getAcDemandFactor(totalAcDevices);
    const acDemand = acRawLoad * acDemandFactor;

    // 3. Demanda de Condomínio / Serviço (kW)
    let condoDemand = 0;
    if (currentProject.mode === 'completo') {
        const elevFactor = currentProject.condoLoads.elevators >= 2 ? 0.85 : 1.0;
        const elevatorLoad = currentProject.condoLoads.elevators * currentProject.condoLoads.elevatorPower * elevFactor;
        condoDemand = currentProject.condoLoads.lighting + elevatorLoad + currentProject.condoLoads.pumps;
    } else {
        // Estimativa simplificada de carga de condomínio
        condoDemand = currentProject.units.length * 1.2;
    }

    // 4. Totais combinados
    const totalDemandKw = resDemand + acDemand + condoDemand;

    // Fator de Potência padrão (FP = 0.92) para converter kW em kVA
    const totalDemandKva = totalDemandKw / 0.92;

    // Categoria de enquadramento
    let category;
    if (totalDemandKva <= 10) {
        category = 'Categoria T1 (Monofásico)';
    } else if (totalDemandKva <= 22) {
        category = 'Categoria T2 (Bifásico)';
    } else if (totalDemandKva <= 75) {
        category = 'Categoria T3 (Trifásico)';
    } else {
        category = 'Subestação Dedicada (> 75 kVA)';
    }

    currentProject.calculations = {
        totalDemandKw,
        totalDemandKva,
        category,
        resDemand,
        acDemand,
        condoDemand
    };

    currentProject.status = 'Em cálculo';

    upsertProjectInHistory(currentProject);
    saveProjectsToStorage();
    updateTopBar();
}
