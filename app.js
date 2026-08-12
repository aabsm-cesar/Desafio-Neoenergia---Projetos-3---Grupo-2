// NeoDemanda - Application Controller Module
// Developed for Neoenergia Pernambuco

// Chart.js object pointer
let distributionChart = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // 1. Session check and load layout profiles
    const userName = sessionStorage.getItem('neodemanda_user');
    const userRole = sessionStorage.getItem('neodemanda_role');
    
    if (!userName) {
        window.location.href = 'login.html';
        return;
    }
    
    document.getElementById('user-display-name').innerText = userName;
    document.getElementById('user-display-role').innerText = userRole || 'Projetista';

    // 2. Render Lucide icons
    lucide.createIcons();
    
    // 3. Load Projects from storage and select the first active project as the default
    loadProjectsFromStorage();
    if (projectsHistory.length > 0) {
        currentProject = JSON.parse(JSON.stringify(projectsHistory[0]));
        updateTopBar();
    }
    
    // 4. Load initial dashboard
    switchView('dashboard');
});

// View Routing Switcher
function switchView(viewId) {
    // Hide all views inside the shell
    document.getElementById('view-dashboard').style.display = 'none';
    document.getElementById('view-input-form').style.display = 'none';
    document.getElementById('view-results').style.display = 'none';
    document.getElementById('view-memorial').style.display = 'none';

    // Remove active class from desktop menu items
    document.getElementById('menu-dashboard').classList.remove('active');
    document.getElementById('menu-input-form').classList.remove('active');
    document.getElementById('menu-results').classList.remove('active');
    document.getElementById('menu-memorial').classList.remove('active');

    // Remove active class from mobile menu items
    document.getElementById('mob-menu-dashboard').classList.remove('active');
    document.getElementById('mob-menu-input-form').classList.remove('active');
    document.getElementById('mob-menu-results').classList.remove('active');
    document.getElementById('mob-menu-memorial').classList.remove('active');

    // Show selected view and activate desktop/mobile menu items
    document.getElementById(`view-${viewId}`).style.display = 'block';
    document.getElementById(`menu-${viewId}`).classList.add('active');
    document.getElementById(`mob-menu-${viewId}`).classList.add('active');

    // Trigger specific view setups
    if (viewId === 'dashboard') {
        renderDashboard();
    } else if (viewId === 'input-form') {
        renderInputForm();
    } else if (viewId === 'results') {
        renderResults();
    } else if (viewId === 'memorial') {
        renderMemorial();
    }
}

function handleLogout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}

// Render Dashboard
function renderDashboard() {
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

    // Populate dashboard summaries with current active project if available, else blank
    if (currentProject.id) {
        document.getElementById('dash-demand-val').innerHTML = `${currentProject.calculations.totalDemandKva.toFixed(1)} <span style="font-size: 1rem; color: var(--text-secondary);">kVA</span>`;
        document.getElementById('dash-demand-desc').innerText = `Cálculo realizado: ${currentProject.calculations.totalDemandKw.toFixed(1)} kW`;
        document.getElementById('dash-supply-val').innerText = currentProject.calculations.category;
        
        let totalUnits = currentProject.units.reduce((sum, u) => sum + parseInt(u.qty || 0), 0);
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

    // Populate history list
    let historyHtml = '';
    projectsHistory.forEach(proj => {
        let statusBadge = 'badge-draft';
        if (proj.status === 'Em cálculo') statusBadge = 'badge-calculating';
        if (proj.status === 'Pronto') statusBadge = 'badge-ready';
        
        let demandInfo = proj.calculations.totalDemandKva > 0 ? `${proj.calculations.totalDemandKva.toFixed(1)} kVA` : 'Não Calculado';
        
        // Highlight active item
        let activeClass = (proj.id === currentProject.id) ? 'style="border-color: var(--primary); background-color: rgba(0, 167, 87, 0.02);"' : '';
        
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

// Create New Project Action
function createNewProject() {
    currentProject = {
        id: 'proj-' + Date.now(),
        name: 'Novo Empreendimento',
        cep: '',
        area: '',
        floors: '',
        use: 'residencial',
        mode: 'simplificado',
        status: 'Rascunho',
        units: [
            { id: 1, type: 'Apto Padrão A (< 80m²)', qty: 4, load: 8.5, acQty: 1 }
        ],
        condoLoads: {
            lighting: 3,
            elevators: 0,
            elevatorPower: 0,
            pumps: 1.5
        },
        calculations: {
            totalDemandKw: 0,
            totalDemandKva: 0,
            category: '--',
            resDemand: 0,
            acDemand: 0,
            condoDemand: 0
        }
    };
    
    updateTopBar();
    switchView('input-form');
}

// Load a project from history
function loadProject(id) {
    const found = projectsHistory.find(p => p.id === id);
    if (found) {
        currentProject = JSON.parse(JSON.stringify(found));
        updateTopBar();
        switchView('dashboard');
    }
}

// Update Shell Topbar Info
function updateTopBar() {
    document.getElementById('top-project-name').innerText = currentProject.name || 'Sem Nome';
    
    const statusBadge = document.getElementById('top-project-status');
    statusBadge.innerText = currentProject.status;
    statusBadge.className = 'badge';
    if (currentProject.status === 'Rascunho') statusBadge.classList.add('badge-draft');
    if (currentProject.status === 'Em cálculo') statusBadge.classList.add('badge-calculating');
    if (currentProject.status === 'Pronto') statusBadge.classList.add('badge-ready');
    
    updateProjectProgress();
}

// Project Progress Percentage
function updateProjectProgress() {
    let fields = 0;
    let totalFields = 5;
    
    if (currentProject.name) fields++;
    if (currentProject.cep) fields++;
    if (currentProject.area && currentProject.area > 0) fields++;
    if (currentProject.floors && currentProject.floors > 0) fields++;
    if (currentProject.units.length > 0) fields++;
    
    const percentage = Math.round((fields / totalFields) * 100);
    
    document.getElementById('project-progress-bar').style.width = percentage + '%';
    document.getElementById('project-progress-label').innerText = `Preenchimento: ${percentage}%`;
}

// Render Input Form Fields
function renderInputForm() {
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

// Switch Calculation Mode (Simplificado vs Completo)
function setCalculationMode(mode) {
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

// Rebuild Dynamic units table
function rebuildUnitsTable() {
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
    
    currentProject.units.forEach((unit, idx) => {
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

function addUnitRow() {
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

function deleteUnitRow(id) {
    currentProject.units = currentProject.units.filter(u => u.id !== id);
    rebuildUnitsTable();
    updateProjectProgress();
}

function updateUnitField(id, field, value) {
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

// Trigger calculation with loader animation
function triggerCalculation() {
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

// Render Results View
function renderResults() {
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
    let fs = getSimultaneityFactor(totalQty);
    
    currentProject.units.forEach(u => {
        let rawAccumulated = u.qty * u.load;
        let reduced = rawAccumulated * fs;
        
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
    let totalAc = currentProject.units.reduce((sum, u) => sum + (u.acQty * u.qty), 0);
    let rawKw = totalAc * 1.5;
    let factor = getAcDemandFactor(totalAc);
    
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
        let l = currentProject.condoLoads;
        let elevFactor = l.elevators >= 2 ? 0.85 : 1.0;
        let elevKw = l.elevators * l.elevatorPower * elevFactor;
        
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

function toggleAccordion(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.toggle('open');
    }
}

// Chart.js Setup
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
                    '#00A757', // Neoenergia Green
                    '#009EE2', // Neoenergia Blue
                    '#FF8F1C'  // Neoenergia Orange
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

// Render A4 Printable Memorial
function renderMemorial() {
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
        let total = u.qty * u.load;
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
    let totalResQty = currentProject.units.reduce((sum, u) => sum + u.qty, 0);
    let resFs = getSimultaneityFactor(totalResQty);
    let rawResSum = currentProject.units.reduce((sum, u) => sum + (u.qty * u.load), 0);
    
    let totalAc = currentProject.units.reduce((sum, u) => sum + (u.acQty * u.qty), 0);
    let acFactor = getAcDemandFactor(totalAc);
    let rawAcSum = totalAc * 1.5;
    
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

// Finalize project to "Pronto" status
function finalizeSubmission() {
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
