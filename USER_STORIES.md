# Histórias de Usuário - Entrega 01

## US01 - Visualizar Dashboard
**Descrição:** Como projetista, quero visualizar meus projetos e seus status em um dashboard.
**Entrega de Valor:** Acompanhar rapidamente o andamento e o volume das demandas ativas.

### Cenário de Validação (BDD)
* **Dado** que o projetista está autenticado no sistema
* **Quando** ele acessa a página inicial
* **Então** o sistema exibe um painel de controle contendo a lista dos seus projetos e os respectivos status de cada um (ex: Rascunho, Em Análise, Submetido).

---

## US02 - Criar Projeto
**Descrição:** Como projetista, quero cadastrar um novo projeto informando cliente, tipo, potência e quantidade de unidades.
**Entrega de Valor:** Iniciar estruturadamente o processo de análise de uma nova demanda.

### Cenário de Validação (BDD)
* **Dado** que o projetista se encontra no dashboard
* **Quando** ele clica no botão de "Novo Projeto" e preenche os campos obrigatórios (cliente, tipo, potência e quantidade de unidades)
* **E** clica em "Salvar"
* **Então** o sistema cria o registro com sucesso e redireciona o usuário para a etapa inicial de cálculos do projeto criado.

---

## US03 - Calcular Demanda
**Descrição:** Como projetista, quero informar os dados de carga e os fatores de demanda e potência.
**Entrega de Valor:** Calcular automaticamente a demanda elétrica do projeto, reduzindo erros manuais e agilizando o trabalho técnico.

### Cenário de Validação (BDD)
* **Dado** que o projetista está na tela de cálculos de um projeto
* **Quando** ele insere as cargas elétricas e os respectivos fatores de demanda
* **E** aciona a função "Calcular"
* **Então** o sistema deve processar a matemática e exibir a demanda elétrica total calculada na tela.

---

## US04 - Validar Projeto
**Descrição:** Como projetista, quero que o sistema valide automaticamente os dados do projeto.
**Entrega de Valor:** Identificar possíveis erros, omissões ou problemas de norma antes da submissão oficial.

### Cenário de Validação (BDD)
* **Dado** que os dados de carga do projeto foram inseridos e calculados
* **Quando** o sistema executa a rotina de validação
* **Então** ele deve exibir indicativos visuais destacando os dados que estão inconsistentes ou liberar uma mensagem de "Projeto sem pendências técnicas".

---

## US05 - Acompanhar Resultado
**Descrição:** Como projetista, quero visualizar o resultado do cálculo e a situação de conformidade do projeto.
**Entrega de Valor:** Saber com clareza se o projeto está tecnicamente finalizado e pronto para ser submetido à concessionária.

### Cenário de Validação (BDD)
* **Dado** que a validação automática foi concluída
* **Quando** o projetista acessa a aba de resultados finais do projeto
* **Então** o sistema deve mostrar o demonstrativo do cálculo e um status claro indicando "Pronto para Submissão".

---

## US06 - Editar Projeto Existente
**Descrição:** Como projetista, quero poder editar os dados de um projeto já salvo.
**Entrega de Valor:** Corrigir informações incorretas ou atualizar rapidamente os dados de carga caso haja alteração de escopo solicitada pelo cliente.

### Cenário de Validação (BDD)
* **Dado** que existe um projeto salvo no sistema
* **Quando** o projetista altera qualquer informação de escopo (como adicionar uma nova carga)
* **E** clica em "Atualizar"
* **Então** o sistema salva as modificações e aciona um alerta indicando que o cálculo precisará ser refeito.

---

## US07 - Exportar Relatório Técnico
**Descrição:** Como projetista, quero exportar o resultado final do cálculo de demanda e o memorial descritivo em PDF.
**Entrega de Valor:** Facilitar o envio da documentação padronizada ao cliente e para anexo junto à concessionária de energia.

### Cenário de Validação (BDD)
* **Dado** que o projeto foi finalizado e os cálculos estão aprovados
* **Quando** o projetista clica em "Exportar PDF"
* **Então** o sistema gera um arquivo contendo os dados do cliente, memorial descritivo e tabelas de carga e inicia o download na máquina do usuário.

---

## US08 - Submeter Projeto
**Descrição:** Como projetista, quero acionar a submissão formal de um projeto que já foi validado e aprovado pelo sistema.
**Entrega de Valor:** Garantir o encaminhamento formal do projeto para a próxima etapa de análise ou protocolo na concessionária.

### Cenário de Validação (BDD)
* **Dado** que o projeto tem o status de "Pronto para Submissão"
* **Quando** o projetista clica no botão "Submeter Projeto" e confirma a ação
* **Então** o status do projeto é alterado para "Submetido" e ele é travado para novas edições.

---

## US09 - Arquivar / Excluir Projeto
**Descrição:** Como projetista, quero poder arquivar ou excluir projetos antigos ou cancelados.
**Entrega de Valor:** Manter o dashboard de trabalho limpo, organizado e focado estritamente nas demandas ativas.

### Cenário de Validação (BDD)
* **Dado** que há projetos cancelados ou desatualizados na listagem principal
* **Quando** o projetista clica na opção "Arquivar" em um projeto específico
* **Então** o projeto é removido do dashboard principal e movido para uma seção secundária chamada "Projetos Arquivados".

---

## US10 - Histórico de Alterações
**Descrição:** Como projetista, quero visualizar o histórico das versões de cálculo de um projeto.
**Entrega de Valor:** Permitir a comparação de resultados e memórias de cálculo antigos caso os parâmetros do cliente mudem diversas vezes durante a negociação.

### Cenário de Validação (BDD)
* **Dado** que um projeto sofreu recálculos em dias diferentes
* **Quando** o projetista acessa a aba "Histórico de Versões"
* **Então** o sistema exibe uma linha do tempo com as versões anteriores, mostrando data, hora e o valor de demanda calculado em cada iteração.
