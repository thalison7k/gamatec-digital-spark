# GamaTec.IA — Plataforma Web Experimental Acadêmica

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-blue?style=for-the-badge)
![Licença](https://img.shields.io/badge/licen%C3%A7a-educacional-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Lovable Cloud](https://img.shields.io/badge/Backend-Lovable_Cloud-FF6B6B?style=for-the-badge)
![Deploy](https://img.shields.io/badge/deploy-online-brightgreen?style=for-the-badge&logo=vercel&logoColor=white)
![Último Commit](https://img.shields.io/github/last-commit/gamatec/gamatec-ia?style=for-the-badge&label=%C3%BAltimo%20commit)
![Tamanho do Repo](https://img.shields.io/github/repo-size/gamatec/gamatec-ia?style=for-the-badge&label=tamanho)

## 📋 Descrição

A **GamaTec.IA** é uma plataforma web experimental desenvolvida como parte de um **Trabalho de Conclusão de Curso em Engenharia de Computação**. O projeto investiga o impacto da Inteligência Artificial e de abordagens low-code/no-code no desenvolvimento de software, avaliando produtividade, usabilidade e viabilidade técnica.

A plataforma não é um produto comercial. Trata-se de um **ambiente acadêmico-tecnológico** voltado ao estudo, validação de conceitos e demonstração prática de engenharia de software moderna.

> **Área de estudo:** Engenharia de Software e Inteligência Artificial aplicada ao desenvolvimento.

---

## 🔭 Visão Geral do Sistema

### O que a plataforma faz

A GamaTec.IA funciona como um **laboratório digital** para experimentação de tecnologias web modernas. Ela demonstra, de forma prática, como ferramentas de IA podem ser integradas ao ciclo de desenvolvimento de software, desde o levantamento de requisitos até a publicação funcional.

### Problema investigado

O projeto busca responder: **qual o impacto real do uso de IA generativa no processo de desenvolvimento web?** A plataforma serve como objeto de estudo para mensurar ganhos de produtividade, identificar limitações e avaliar a qualidade do código produzido com assistência de modelos de linguagem.

### Público-alvo

- Estudantes de Engenharia de Computação e áreas correlatas
- Desenvolvedores interessados em ferramentas de produtividade com IA
- Pesquisadores em Engenharia de Software

### Conceito

A plataforma opera como um **ambiente experimental controlado**, onde cada funcionalidade implementada serve simultaneamente como feature do sistema e como caso de estudo para análise acadêmica.

---

## ⚙️ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| Interface responsiva | Layout adaptativo para desktop, tablet e dispositivos móveis |
| Sistema de temas | Alternância entre modo claro e escuro com persistência em `localStorage` |
| Páginas institucionais | Seções de apresentação, portfólio, diferenciais e documentação técnica |
| Estrutura modular | Componentes React reutilizáveis com separação clara de responsabilidades |
| Efeitos visuais | Animações CSS, scroll reveal e transições suaves |
| Feedback sonoro | Sistema de sons interativos com controle de ativação |
| Documentação interna | Página acadêmica `/como-funciona` com explicação técnica da plataforma |
| Autenticação | Sistema de login e registro de usuários |

---

## 🏗️ Arquitetura do Projeto

### Modelo arquitetural

A aplicação segue o modelo **cliente-servidor**:

- **Cliente (Front-end):** Aplicação SPA (Single Page Application) construída em React, servida estaticamente via navegador web.
- **Servidor (Back-end):** Serviços de backend gerenciados (autenticação, banco de dados, edge functions) provisionados via plataforma cloud.

### Estrutura de componentes

O front-end adota uma **arquitetura baseada em componentes**, onde cada unidade de interface é encapsulada com sua lógica, estilos e estado. A comunicação entre componentes ocorre via props e contextos React.

```
┌─────────────────────────────────────────────┐
│                  App.tsx                     │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Providers │→ │  Router  │→ │   Pages   │  │
│  └──────────┘  └──────────┘  └───────────┘  │
│                                    ↓         │
│              ┌─────────────────────────┐     │
│              │  Components / UI / Hooks │     │
│              └─────────────────────────┘     │
└─────────────────────────────────────────────┘
```

### Separação de responsabilidades

| Camada | Responsabilidade |
|---|---|
| `pages/` | Composição de layout por rota |
| `components/` | Elementos visuais reutilizáveis |
| `components/ui/` | Primitivos de interface (design system) |
| `hooks/` | Lógica de estado e efeitos colaterais |
| `integrations/` | Comunicação com serviços externos |
| `lib/` | Utilitários e funções auxiliares |

---

## 🛠️ Tecnologias Utilizadas

### Front-end

| Tecnologia | Versão | Finalidade |
|---|---|---|
| React | 18.3.x | Biblioteca de construção de interfaces |
| TypeScript | — | Tipagem estática e segurança de código |
| Vite | — | Bundler e servidor de desenvolvimento |
| Tailwind CSS | — | Framework de estilização utilitária |
| shadcn/ui | — | Componentes de interface acessíveis |
| React Router DOM | 6.x | Roteamento client-side (SPA) |
| Framer Motion / CSS | — | Animações e transições |
| Lucide React | — | Biblioteca de ícones |

### Infraestrutura e Ferramentas

| Tecnologia | Finalidade |
|---|---|
| Git / GitHub | Versionamento de código-fonte |
| Lovable Cloud | Backend gerenciado (auth, database, edge functions) |
| Hospedagem web | Deploy e publicação da aplicação |
| ESLint | Análise estática e padronização de código |
| PostCSS | Processamento de estilos |

---

## 📁 Estrutura de Diretórios

```
gamatec-ia/
├── public/                    # Arquivos estáticos públicos
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── assets/                # Recursos estáticos (imagens, GIFs)
│   ├── components/            # Componentes React da aplicação
│   │   ├── ui/                # Primitivos do design system (shadcn/ui)
│   │   ├── Hero.tsx           # Seção principal da landing page
│   │   ├── Footer.tsx         # Rodapé global
│   │   ├── Portfolio.tsx      # Seção de portfólio
│   │   ├── Differentials.tsx  # Seção de diferenciais
│   │   ├── ThemeToggle.tsx    # Alternância de tema claro/escuro
│   │   ├── SoundProvider.tsx  # Contexto de sons interativos
│   │   └── ...
│   ├── hooks/                 # Custom hooks React
│   │   ├── useAuth.tsx        # Gerenciamento de autenticação
│   │   ├── useTheme.tsx       # Gerenciamento de tema
│   │   ├── useScrollReveal.ts # Animações de scroll
│   │   └── useSoundEffects.ts # Efeitos sonoros
│   ├── integrations/          # Integrações com serviços externos
│   │   └── supabase/          # Cliente e tipos do backend
│   ├── lib/                   # Funções utilitárias
│   ├── pages/                 # Páginas/rotas da aplicação
│   │   ├── Index.tsx          # Página principal
│   │   ├── Auth.tsx           # Página de autenticação
│   │   ├── ComoFunciona.tsx   # Documentação técnica acadêmica
│   │   └── NotFound.tsx       # Página 404
│   ├── App.tsx                # Componente raiz e configuração de rotas
│   ├── main.tsx               # Ponto de entrada da aplicação
│   └── index.css              # Variáveis CSS e estilos globais
├── supabase/
│   └── config.toml            # Configuração do backend
├── tailwind.config.ts         # Configuração do Tailwind CSS
├── vite.config.ts             # Configuração do Vite
├── tsconfig.json              # Configuração do TypeScript
└── README.md                  # Este documento
```

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- npm ou [bun](https://bun.sh/) como gerenciador de pacotes
- Git instalado

### Passo a passo

```bash
# 1. Clonar o repositório
git clone <URL_DO_REPOSITÓRIO>

# 2. Acessar o diretório do projeto
cd gamatec-ia

# 3. Instalar as dependências
npm install

# 4. Iniciar o servidor de desenvolvimento
npm run dev
```

O servidor de desenvolvimento será iniciado e a aplicação estará acessível em `http://localhost:5173`.

### Build de produção

```bash
# Gerar build otimizado
npm run build

# Pré-visualizar o build
npm run preview
```

---

## 📐 Metodologia de Desenvolvimento

O desenvolvimento da plataforma seguiu uma abordagem **incremental e iterativa**, combinando práticas de engenharia de software com experimentação assistida por IA:

1. **Levantamento de requisitos:** Definição das funcionalidades e seções necessárias com base nos objetivos acadêmicos do projeto.

2. **Prototipação:** Criação de protótipos visuais e estruturais para validação prévia do layout e da experiência do usuário.

3. **Engenharia de prompt:** Formulação de instruções estruturadas para geração de código assistida por modelos de linguagem, seguida de revisão técnica.

4. **Validação visual e funcional:** Testes manuais em múltiplos dispositivos e navegadores para verificação de responsividade, acessibilidade e integridade funcional.

5. **Evolução contínua:** Refinamento progressivo de componentes, estilos e funcionalidades com base em feedback e análise técnica.

> A metodologia combina práticas tradicionais de Engenharia de Software com técnicas emergentes de desenvolvimento assistido por IA, permitindo análise comparativa de produtividade.

---

## 🔮 Possíveis Evoluções Futuras

| Evolução | Descrição |
|---|---|
| API REST | Implementação de endpoints dedicados para comunicação estruturada entre cliente e servidor |
| Banco de dados relacional | Modelagem e persistência de dados com esquemas normalizados |
| Autenticação avançada | Integração com provedores OAuth (Google, GitHub) e autenticação multifator |
| Painel administrativo | Interface protegida para gestão de conteúdo e monitoramento do sistema |
| Testes automatizados | Cobertura com testes unitários (Vitest) e testes de integração (Playwright) |
| Internacionalização | Suporte a múltiplos idiomas (i18n) |
| PWA | Conversão para Progressive Web App com suporte offline |

---

## 👤 Autor e Licença

### Autor

Projeto desenvolvido como **Trabalho de Conclusão de Curso** no curso de **Engenharia de Computação**.

### Licença

Este projeto possui **fins exclusivamente educacionais e acadêmicos**.

- ✅ Uso para estudo e referência acadêmica
- ✅ Análise técnica e citação em trabalhos científicos
- ❌ Uso comercial
- ❌ Redistribuição sem autorização

---

<p align="center">
  <strong>GamaTec.IA</strong> — Plataforma Experimental Acadêmica<br>
  <em>Engenharia de Computação • Trabalho de Conclusão de Curso</em>
</p>
