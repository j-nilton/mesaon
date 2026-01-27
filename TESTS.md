# 🧪 Documentação de Estratégia de Testes - Mesaon

Este documento detalha a filosofia, estratégia técnica e instruções operacionais para a suíte de testes automatizados do projeto Mesaon.

---

## 🎯 1. Estratégia de Testes Adotada

A estratégia de qualidade de código do Mesaon foi desenhada com foco em **ROI (Retorno sobre Investimento)** e **Velocidade de Desenvolvimento**. Adotamos uma abordagem pragmática que prioriza a estabilidade das regras de negócio e integridade dos dados, aceitando riscos calculados na camada de interface do usuário.

### 1.1 Foco no "Core Business" (Domain-Centric Testing)
A cobertura de testes concentra-se deliberadamente nas camadas de:
- **UseCases (Casos de Uso)**: Onde residem as regras de negócio da aplicação.
- **Models (Entidades)**: Onde residem as validações de integridade e lógica de domínio.
- **Infra (Services)**: Onde ocorre a tradução e validação de dados para serviços externos (Firebase).

**Justificativa Técnica:**
Em aplicações mobile com arquitetura limpa (Clean Architecture), a lógica complexa e propensa a erros críticos reside nas camadas de domínio e aplicação. Garantir que um cálculo de total de mesa ou um fluxo de permissão de acesso funcione corretamente é prioritário sobre verificar se um botão tem a cor correta. Erros de lógica de negócio podem corromper dados permanentemente; erros de UI são geralmente visuais e facilmente detectáveis em testes manuais ou correções rápidas (hotfixes).
---

## � 2. Testes de Integração de Fluxos

Os testes localizados em `src/__tests__/integration` não são testes de integração tradicionais (que conectam ao banco de dados real), mas sim **Testes de Integração de Fluxos de Negócio**.

### Abordagem Técnica
Eles validam a **orquestração entre múltiplos Casos de Uso** simulando uma sessão de usuário real. Em vez de testar um método isolado, testamos uma sequência de ações que dependem umas das outras.

**Exemplo Prático (`AuthenticationFlow.test.ts`):**
1.  O teste simula o **Login** (UseCase A).
2.  Utiliza o resultado para definir um **Papel/Role** (UseCase B).
3.  Verifica se o **Perfil** obtido reflete as mudanças (UseCase C).

**Por que isso é importante?**
Esses testes garantem que o sistema mantém a consistência de estado através de múltiplas operações. Eles capturam erros de "contrato" entre casos de uso que testes unitários isolados não pegariam (ex: o UseCase A retorna um dado que o UseCase B não sabe tratar). Como usam Mocks para a camada de I/O (Banco de Dados), eles rodam em milissegundos, mantendo o feedback loop rápido.

---

## �️ 3. Arquitetura de Mocks e Factories

A pasta `src/__tests__/mocks` é fundamental para a manutenibilidade e escalabilidade da suíte de testes.

### 3.1 Factories (`factories.ts`)
Utilizamos o padrão **Object Mother / Factory** para geração de dados de teste.
*   **Problema Resolvido**: Evita espalhar objetos literais complexos (`{ id: '1', name: '...' }`) por centenas de arquivos de teste.
*   **Benefício**: Se a entidade `User` ganhar um novo campo obrigatório amanhã, basta atualizar a função `createMockUser` em um único lugar, e todos os 130 testes continuarão funcionando. Isso reduz drasticamente a fragilidade dos testes a mudanças no modelo de dados.

### 3.2 Service Mocks (`index.ts`)
Centralizamos a criação de Mocks dos Serviços de Infraestrutura (ex: `createMockAuthService`).
*   **Prática**: Retornam objetos que respeitam estritamente as Interfaces do TypeScript (`implements AuthService`).
*   **Benefício**: Garante que estamos testando contra o contrato real da aplicação. Se a interface do serviço mudar, o TypeScript alertará que o Mock está desatualizado antes mesmo de rodar os testes.

---

## 🚀 4. Instruções de Execução

O projeto utiliza **Vitest** como runner, configurado para suportar TypeScript e simulação de ambiente (happy-dom/jsdom) quando necessário.

### Comandos Básicos

| Ação | Comando | Descrição |
|------|---------|-----------|
| **Rodar Todos** | `npm test` | Executa a suíte completa (~15s). |
| **Modo Watch** | `npm test -- --watch` | Reexecuta testes afetados ao salvar arquivos (Ideal para TDD). |
| **Coverage** | `npm run test:coverage` | Gera relatório de cobertura de código. |

### Executando Testes Específicos

Para focar em um contexto específico durante o desenvolvimento:

```bash
# Rodar apenas testes de Integração
npm test integration

# Rodar apenas testes de uma Feature (ex: Produto)
npm test Product

# Rodar um arquivo específico
npm test src/__tests__/TDD/ClearTablesButton.test.tsx
```

### Ciclo de Desenvolvimento Recomendado (TDD)
1.  Crie um arquivo de teste em `src/__tests__/TDD/`.
2.  Escreva o cenário de teste falhando (RED).
3.  Implemente a lógica mínima no `ViewModel` ou `UseCase`.
4.  Valide (GREEN).
5.  Refatore e mova o teste para a pasta `unit` ou `integration` definitiva.

---

**Resumo da Qualidade:**
> Nos esquema de testes feitso, não buscamos 100% de cobertura de linhas, mas sim 100% de confiança nos fluxos críticos que sustentam o negócio.
