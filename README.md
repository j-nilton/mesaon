# MesaOn - Gerenciador de Pedidos

<p align="center">
  <img src="assets/logoMesaOn.png" alt="Logo do MesaOn" width="350">
</p>

## Descrição

MesaOn é um sistema de gerenciamento de pedidos projetado para otimizar a operação em restaurantes, bares e estabelecimentos similares. Ele permite que os funcionários gerenciem mesas, registrem pedidos e acompanhem o total da conta em tempo real, tudo a partir de um dispositivo móvel.

## Principais funcionalidades

- **Gerenciamento de Mesas:** Crie, edite e visualize o status de todas as mesas do estabelecimento.
- **Registro de Pedidos:** Adicione produtos aos pedidos de cada mesa de forma rápida e intuitiva.
- **Controle de Contas:** Calcule automaticamente o valor total dos pedidos por mesa.
- **Colaboração em Tempo Real:** Compartilhe um código de acesso com sua equipe para que todos possam visualizar e gerenciar as mesas.
- **Autenticação Segura:** Sistema de login e registro para proteger o acesso aos dados.

## Arquitetura utilizada

O projeto adota uma arquitetura **MVVM (Model-View-ViewModel)** com princípios de **Clean Architecture**. Essa abordagem garante uma separação clara de responsabilidades, alta testabilidade e escalabilidade. As camadas principais são:

- **`app` (View):** Interface do usuário, telas e navegação.
- **`viewmodel`:** Prepara os dados para a View e lida com a lógica de apresentação.
- **`usecase`:** Orquestra as regras de negócio da aplicação.
- **`model`:** Contém as entidades de domínio, serviços e regras de negócio principais.
- **`infra`:** Implementa os detalhes de infraestrutura, como acesso a banco de dados e serviços externos.
- **`di`:** Gerencia a injeção de dependências em toda a aplicação.

## Tecnologias utilizadas

- **React Native:** Framework para desenvolvimento de aplicativos móveis multiplataforma.
- **Expo:** Plataforma para facilitar o desenvolvimento e a publicação de aplicativos React Native.
- **TypeScript:** Superset do JavaScript que adiciona tipagem estática ao código.
- **Firebase:** Plataforma do Google utilizada para autenticação e banco de dados em tempo real (Firestore).
- **Vitest:** Framework de testes unitários para garantir a qualidade do código.

## Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou Yarn
- Expo CLI

## Como baixar o projeto

```bash
git clone https://github.com/seu-usuario/mesaon.git
cd mesaon
```

## Como instalar as dependências

```bash
npm install
```

ou

```bash
yarn install
```

## Como rodar o sistema

Para iniciar o ambiente de desenvolvimento, execute o seguinte comando:

```bash
npx expo start
```

Isso iniciará o Metro Bundler. Você pode então escanear o QR code com o aplicativo Expo Go em seu dispositivo móvel (Android ou iOS) ou rodar em um emulador.

## Estrutura do projeto (pastas)

```
.
├── src
│   ├── __tests__         # Testes unitários
│   ├── app               # Camada de apresentação (View)
│   ├── di                # Injeção de dependências
│   ├── infra             # Camada de infraestrutura
│   ├── model             # Camada de domínio
│   ├── usecase           # Casos de uso
│   └── viewmodel         # Camada de ViewModel
├── .env.example          # Exemplo de variáveis de ambiente
└── package.json          # Dependências e scripts do projeto
```
