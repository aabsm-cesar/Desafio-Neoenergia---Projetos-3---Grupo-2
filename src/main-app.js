// Entry point de app.html
// Expõe no `window` as funções chamadas pelos atributos onclick/oninput do HTML

import './styles/main.css';
import { switchView, handleLogout } from './app-shell.js';
import { createNewProject, loadProject } from './pages/dashboard/dashboard.js';
import {
    setCalculationMode,
    addUnitRow,
    deleteUnitRow,
    updateUnitField,
    triggerCalculation
} from './pages/input-form/input-form.js';
import { toggleAccordion } from './pages/results/results.js';
import { finalizeSubmission } from './pages/memorial/memorial.js';
import { exportXML, exportCSV, printMemorial } from './services/exporters.js';
import { updateProjectProgress } from './components/topbar.js';

Object.assign(window, {
    switchView,
    handleLogout,
    createNewProject,
    loadProject,
    setCalculationMode,
    addUnitRow,
    deleteUnitRow,
    updateUnitField,
    triggerCalculation,
    updateProjectProgress,
    toggleAccordion,
    finalizeSubmission,
    exportXML,
    exportCSV,
    printMemorial
});
