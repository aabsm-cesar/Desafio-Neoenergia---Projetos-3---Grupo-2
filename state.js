// NeoDemanda - State Management Module
// Developed for Neoenergia Pernambuco

// Initial Global State
let currentProject = {
    id: null,
    name: '',
    cep: '',
    area: '',
    floors: '',
    use: 'residencial',
    mode: 'simplificado', // simplificado | completo
    status: 'Rascunho', // Rascunho | Em cálculo | Pronto
    units: [],
    condoLoads: {
        lighting: 5,
        elevators: 1,
        elevatorPower: 7.5,
        pumps: 3.7
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

let projectsHistory = [];

// Default Demo Projects to populate the system
const DEMO_PROJECTS = [
    {
        id: 'proj-1',
        name: 'Residencial Boa Vista',
        cep: '50050-230',
        area: 2800,
        floors: 12,
        use: 'residencial',
        mode: 'completo',
        status: 'Em cálculo',
        units: [
            { id: 1, type: 'Apto Padrão A (< 80m²)', qty: 24, load: 8.5, acQty: 1 },
            { id: 2, type: 'Apto Padrão B (80m² - 120m²)', qty: 12, load: 11.2, acQty: 2 }
        ],
        condoLoads: { lighting: 8.0, elevators: 2, elevatorPower: 9.2, pumps: 5.5 },
        calculations: {
            totalDemandKw: 82.4,
            totalDemandKva: 89.56,
            category: 'Cabine de Transformação (> 75 kVA)',
            resDemand: 52.8,
            acDemand: 12.6,
            condoDemand: 17.0
        }
    },
    {
        id: 'proj-2',
        name: 'Galeria Comercial Olinda',
        cep: '53020-040',
        area: 950,
        floors: 2,
        use: 'comercial',
        mode: 'simplificado',
        status: 'Pronto',
        units: [
            { id: 1, type: 'Sala Comercial Padrão', qty: 10, load: 4.5, acQty: 1 }
        ],
        condoLoads: { lighting: 3.0, elevators: 0, elevatorPower: 0, pumps: 1.5 },
        calculations: {
            totalDemandKw: 31.2,
            totalDemandKva: 33.91,
            category: 'Categoria T3 (Trifásico)',
            resDemand: 22.5,
            acDemand: 4.2,
            condoDemand: 4.5
        }
    },
    {
        id: 'proj-3',
        name: 'Edifício Monte Verde',
        cep: '52060-120',
        area: 1500,
        floors: 6,
        use: 'residencial',
        mode: 'simplificado',
        status: 'Rascunho',
        units: [
            { id: 1, type: 'Apartamento Simples', qty: 12, load: 6.0, acQty: 0 }
        ],
        condoLoads: { lighting: 4.0, elevators: 1, elevatorPower: 5.5, pumps: 2.2 },
        calculations: {
            totalDemandKw: 0,
            totalDemandKva: 0,
            category: '--',
            resDemand: 0,
            acDemand: 0,
            condoDemand: 0
        }
    }
];

// Load projects from localStorage or use defaults
function loadProjectsFromStorage() {
    const stored = localStorage.getItem('neodemanda_projects');
    if (stored) {
        projectsHistory = JSON.parse(stored);
    } else {
        projectsHistory = [...DEMO_PROJECTS];
        localStorage.setItem('neodemanda_projects', JSON.stringify(projectsHistory));
    }
}

// Save projects back to localStorage
function saveProjectsToStorage() {
    localStorage.setItem('neodemanda_projects', JSON.stringify(projectsHistory));
}
