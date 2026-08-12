// NeoDemanda - Exporter Module
// Developed for Neoenergia Pernambuco

function printMemorial() {
    window.print();
}

function exportXML() {
    const calc = currentProject.calculations;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<NeoDemanda versao="1.0">
    <Cabecalho>
        <Sistema>NeoDemanda</Sistema>
        <Concessionaria>Neoenergia Pernambuco</Concessionaria>
        <NormaReferencia>SM04.2-PE</NormaReferencia>
        <DataGeracao>${new Date().toISOString()}</DataGeracao>
    </Cabecalho>
    <Projeto id="${currentProject.id}">
        <Nome>${currentProject.name}</Nome>
        <Localizacao>
            <CEP>${currentProject.cep}</CEP>
            <Estado>PE</Estado>
        </Localizacao>
        <ParametrosFisicos>
            <AreaConstruidaM2>${currentProject.area}</AreaConstruidaM2>
            <Pavimentos>${currentProject.floors}</Pavimentos>
            <TipoOcupacao>${currentProject.use}</TipoOcupacao>
        </ParametrosFisicos>
        <Resultados>
            <DemandaTotalkW>${calc.totalDemandKw.toFixed(2)}</DemandaTotalkW>
            <DemandaTotalKVA>${calc.totalDemandKva.toFixed(2)}</DemandaTotalKVA>
            <CategoriaEnquadramento>${calc.category}</CategoriaEnquadramento>
            <DemandaUnidadesConsumidoras>${calc.resDemand.toFixed(2)}</DemandaUnidadesConsumidoras>
            <DemandaArCondicionado>${calc.acDemand.toFixed(2)}</DemandaArCondicionado>
            <DemandaCondominio>${calc.condoDemand.toFixed(2)}</DemandaCondominio>
        </Resultados>
    </Projeto>
</NeoDemanda>`;

    downloadBlob(xml, `neodemanda_${currentProject.id}.xml`, 'text/xml');
}

function exportCSV() {
    const calc = currentProject.calculations;
    let csv = "Categoria de Carga,Potencia Instalada (kW),Fator de Demanda,Demanda Calculada (kW)\n";
    
    let totalResQty = currentProject.units.reduce((sum, u) => sum + u.qty, 0);
    let resFs = getSimultaneityFactor(totalResQty);
    let rawResSum = currentProject.units.reduce((sum, u) => sum + (u.qty * u.load), 0);
    
    let totalAc = currentProject.units.reduce((sum, u) => sum + (u.acQty * u.qty), 0);
    let acFactor = getAcDemandFactor(totalAc);
    let rawAcSum = totalAc * 1.5;
    
    csv += `Unidades Consumidoras Residencial,${rawResSum.toFixed(1)},${(resFs * 100).toFixed(0)}%,${calc.resDemand.toFixed(1)}\n`;
    csv += `Sistemas de Climatizacao (Ar),${rawAcSum.toFixed(1)},${(acFactor * 100).toFixed(0)}%,${calc.acDemand.toFixed(1)}\n`;
    csv += `Servico Condominio,${calc.condoDemand.toFixed(1)},100%,${calc.condoDemand.toFixed(1)}\n\n`;
    
    csv += `Demanda Total Ativa (kW),,${calc.totalDemandKw.toFixed(2)}\n`;
    csv += `Fator de Potencia (FP),,0.92\n`;
    csv += `Demanda Total Aparente (kVA),,${calc.totalDemandKva.toFixed(2)}\n`;
    csv += `Enquadramento da Concessionaria,,${calc.category}\n`;

    downloadBlob(csv, `neodemanda_${currentProject.id}.csv`, 'text/csv');
}

function downloadBlob(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
