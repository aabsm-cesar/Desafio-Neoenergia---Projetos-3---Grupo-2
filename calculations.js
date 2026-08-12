// NeoDemanda - Calculation Engine Module
// Developed for Neoenergia Pernambuco

// Lookup Table for Simultaneity Factors (f_s) according to Neoenergia NDU-001 Residential
function getSimultaneityFactor(n) {
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
    return 0.28; // 50+ units
}

// Lookup Table for Air Conditioning simultaneity factor
function getAcDemandFactor(qty) {
    if (qty <= 1) return 1.0;
    if (qty <= 4) return 0.85;
    if (qty <= 10) return 0.75;
    return 0.60;
}

// Core Math Calculations
function runCalculations() {
    // 1. Residential Units Demand (kW)
    let resUnitsQty = 0;
    let resRawLoad = 0;
    currentProject.units.forEach(u => {
        resUnitsQty += u.qty;
        resRawLoad += (u.qty * u.load);
    });
    
    let resSimultaneityFactor = getSimultaneityFactor(resUnitsQty);
    let resDemand = resRawLoad * resSimultaneityFactor;
    
    // 2. Air Conditioning Demand (kW)
    let totalAcDevices = currentProject.units.reduce((sum, u) => sum + (u.acQty * u.qty), 0);
    let acRawLoad = totalAcDevices * 1.5; // Average 1.5 kW per AC unit
    let acDemandFactor = getAcDemandFactor(totalAcDevices);
    let acDemand = acRawLoad * acDemandFactor;
    
    // 3. Condo/Service Demand (kW)
    let condoDemand = 0;
    if (currentProject.mode === 'completo') {
        let elevFactor = currentProject.condoLoads.elevators >= 2 ? 0.85 : 1.0;
        let elevatorLoad = currentProject.condoLoads.elevators * currentProject.condoLoads.elevatorPower * elevFactor;
        
        condoDemand = currentProject.condoLoads.lighting + elevatorLoad + currentProject.condoLoads.pumps;
    } else {
        // Mocked simple condo demand
        condoDemand = currentProject.units.length * 1.2;
    }
    
    // 4. Combined calculations
    let totalDemandKw = resDemand + acDemand + condoDemand;
    
    // Apply Standard Power Factor (FP = 0.92) to convert kW to kVA
    let totalDemandKva = totalDemandKw / 0.92;
    
    // Determine category
    let category = '';
    if (totalDemandKva <= 10) {
        category = 'Categoria T1 (Monofásico)';
    } else if (totalDemandKva <= 22) {
        category = 'Categoria T2 (Bifásico)';
    } else if (totalDemandKva <= 75) {
        category = 'Categoria T3 (Trifásico)';
    } else {
        category = 'Subestação Dedicada (> 75 kVA)';
    }
    
    // Update state
    currentProject.calculations = {
        totalDemandKw,
        totalDemandKva,
        category,
        resDemand,
        acDemand,
        condoDemand
    };
    
    currentProject.status = 'Em cálculo';
    
    // Update project in history list
    const existingIdx = projectsHistory.findIndex(p => p.id === currentProject.id);
    if (existingIdx !== -1) {
        projectsHistory[existingIdx] = JSON.parse(JSON.stringify(currentProject));
    } else {
        projectsHistory.push(JSON.parse(JSON.stringify(currentProject)));
    }
    
    saveProjectsToStorage();
    updateTopBar();
}
