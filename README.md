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

## 📋 Descrição

A **GamaTec.IA** é uma plataforma web experimental desenvolvida como parte de um **Trabalho de Conclusão de Curso em Engenharia de Computação**. O projeto investiga o impacto da Inteligência Artificial e de abordagens low-code/no-code no desenvolvimento de software, avaliando produtividade, usabilidade e viabilidade técnica.

> **Área de estudo:** Engenharia de Software e Inteligência Artificial aplicada ao desenvolvimento.

---

## 🔭 Visão Geral do Sistema

A GamaTec.IA funciona como um **laboratório digital** para experimentação de tecnologias web modernas, demonstrando como ferramentas de IA podem ser integradas ao ciclo de desenvolvimento de software.

### Público-alvo

- Estudantes de Engenharia de Computação e áreas correlatas
- Desenvolvedores interessados em ferramentas de produtividade com IA
- Pesquisadores em Engenharia de Software

---

## ⚙️ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| Interface responsiva | Layout adaptativo para desktop, tablet e dispositivos móveis |
| Sistema de temas | Alternância entre modo claro e escuro com persistência |
| Autenticação | Sistema completo de login, registro e perfis de usuário |
| Dashboard do Cliente | Painel com projetos, estatísticas, tickets e ações rápidas |
| Painel Administrativo | Gestão de projetos, usuários e visão geral do sistema |
| Sistema de Tickets | Abertura, acompanhamento e histórico de solicitações de suporte |
| Assistente Inteligente (IA) | Chatbot com IA para análise de dados do painel e insights estratégicos |
| Assistente de Solicitação (IA) | Fluxo guiado por IA para criação de projetos com integração WhatsApp |
| Text-to-Speech (TTS) | Vozes JARVIS (masculino) e FRIDAY (feminino) nos assistentes |
| Leitura por Hover (Global) | Módulo de acessibilidade que lê elementos da interface ao passar o mouse |
| Feedback sonoro | Sistema de sons interativos com controle de ativação |
| Acessibilidade | Painel de acessibilidade, VLibras, skip-to-content, data-voice global |
| Histórico de Conversas | Salvamento de conversas dos assistentes com conformidade LGPD |
| Efeitos visuais | Animações CSS, scroll reveal e transições suaves |

---

## 🤖 Assistentes de IA

A plataforma conta com **dois assistentes inteligentes** especializados:

### Assistente Inteligente (Smart Assistant)
- **Perfil:** Analista de negócios com comunicação adaptativa
- **Funções:** Análise de dados do painel, insights proativos, suporte à decisão
- **Modos:** Reativo (perguntas) e Proativo (insights automáticos)
- **Estilos:** Executivo, Analista, Amigável
- **Idiomas:** Português (pt-BR) e Inglês (en-US)

### Assistente de Solicitação (Request Assistant)
- **Perfil:** Guia interativo para criação de projetos
- **Funções:** Coleta guiada de requisitos, resumo automático, envio via WhatsApp
- **Fluxo:** 8 etapas com barra de progresso e seleção múltipla

### Sistema de Voz (TTS)
- **JARVIS** (♂): Voz firme, tecnológica e objetiva (pitch 0.75, rate 0.88)
- **FRIDAY** (♀): Voz suave, amigável e assistiva (pitch 1.15, rate 0.95)
- Indicador visual pulsante quando a IA está falando
- Alternância em tempo real entre vozes

---

## ♿ Acessibilidade

| Recurso | Descrição |
|---|---|
| Leitura por Hover | Sistema global via `data-voice` — qualquer elemento com esse atributo é lido automaticamente |
| VLibras | Widget de tradução para Libras integrado |
| Skip to Content | Link de navegação rápida para conteúdo principal |
| Painel de Acessibilidade | Controles de fonte, contraste e navegação |
| Vozes TTS | Seleção entre JARVIS e FRIDAY nos assistentes |

---

## 🏗️ Arquitetura do Projeto

```
┌─────────────────────────────────────────────┐
│                  App.tsx                     │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Providers │→ │  Router  │→ │   Pages   │  │
│  └──────────┘  └──────────┘  └───────────┘  │
│       ↓                           ↓         │
│  ┌──────────┐        ┌─────────────────┐    │
│  │  Voice   │        │  Components /   │    │
│  │  Sound   │        │  UI / Hooks     │    │
│  │ Provider │        └─────────────────┘    │
│  └──────────┘                               │
└─────────────────────────────────────────────┘
```

| Camada | Responsabilidade |
|---|---|
| `pages/` | Composição de layout por rota |
| `components/` | Elementos visuais reutilizáveis |
| `components/dashboard/` | Componentes do painel (assistentes, cards, timeline) |
| `components/ui/` | Primitivos de interface (design system — shadcn/ui) |
| `hooks/` | Lógica de estado, efeitos colaterais e custom hooks |
| `integrations/` | Comunicação com serviços externos (backend) |
| `lib/` | Utilitários e funções auxiliares |

---

## 🛠️ Tecnologias Utilizadas

### Front-end

| Tecnologia | Finalidade |
|---|---|
| React 18.3 | Biblioteca de construção de interfaces |
| TypeScript 5 | Tipagem estática e segurança de código |
| Vite 5 | Bundler e servidor de desenvolvimento |
| Tailwind CSS 3 | Framework de estilização utilitária |
| shadcn/ui | Componentes de interface acessíveis |
| React Router DOM 6 | Roteamento client-side (SPA) |
| react-markdown | Renderização de Markdown nos assistentes |
| Lucide React | Biblioteca de ícones |
| Web Speech API | Text-to-Speech nativo do navegador |

### Backend (Lovable Cloud)

| Recurso | Finalidade |
|---|---|
| Autenticação | Login, registro e gerenciamento de sessões |
| Banco de dados | Persistência de projetos, tickets, perfis e conversas |
| Edge Functions | Lógica serverless para assistentes de IA |
| Row Level Security | Proteção de dados por usuário |

---

## 📁 Estrutura de Diretórios

```
gamatec-ia/
├── public/                    # Arquivos estáticos públicos
├── src/
│   ├── components/            # Componentes React
│   │   ├── dashboard/         # SmartAssistant, AIAssistantChat, ProjectCard...
│   │   ├── ui/                # Primitivos do design system (shadcn/ui)
│   │   ├── VoiceProvider.tsx   # Provedor global de voz (data-voice)
│   │   ├── SoundProvider.tsx   # Provedor global de sons
│   │   └── ...
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.tsx        # Autenticação
│   │   ├── useUserRole.ts     # Verificação de roles (admin/client)
│   │   ├── useHoverSpeech.ts  # Leitura por hover
│   │   └── ...
│   ├── integrations/          # Cliente e tipos do backend
│   ├── pages/                 # Páginas/rotas
│   │   ├── Index.tsx          # Landing page
│   │   ├── Auth.tsx           # Autenticação
│   │   ├── Dashboard.tsx      # Painel do usuário
│   │   ├── AdminPanel.tsx     # Painel administrativo
│   │   ├── Tickets.tsx        # Sistema de tickets
│   │   ├── ProjectDetails.tsx # Detalhes do projeto
│   │   └── ComoFunciona.tsx   # Documentação técnica
│   ├── App.tsx                # Componente raiz + Providers
│   └── index.css              # Variáveis CSS e estilos globais
├── supabase/
│   ├── functions/             # Edge Functions (ai-assistant, notificações)
│   └── config.toml            # Configuração do backend
└── README.md
```

---

## 🚀 Como Executar

```bash
# Clonar o repositório
git clone <URL_DO_REPOSITÓRIO>
cd gamatec-ia

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:5173`.

---

## 📐 Metodologia

Desenvolvimento **incremental e iterativo**, combinando Engenharia de Software com experimentação assistida por IA:

1. Levantamento de requisitos baseado nos objetivos acadêmicos
2. Prototipação e validação de layout e UX
3. Engenharia de prompt para geração de código assistida por LLMs
4. Validação visual e funcional em múltiplos dispositivos
5. Refinamento contínuo com análise técnica

---

## 👤 Autor e Licença

Projeto desenvolvido como **Trabalho de Conclusão de Curso** em **Engenharia de Computação**.

- ✅ Uso para estudo e referência acadêmica
- ✅ Análise técnica e citação em trabalhos científicos
- ❌ Uso comercial
- ❌ Redistribuição sem autorização

---

<p align="center">
  <strong>GamaTec.IA</strong> — Plataforma Experimental Acadêmica<br>
  <em>Engenharia de Computação • Trabalho de Conclusão de Curso</em>
</p>
