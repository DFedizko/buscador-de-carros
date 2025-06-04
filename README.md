# 🚗 DirigIA - Buscador de Carros Inteligente

## Sobre o Projeto

DirigIA é uma aplicação full-stack desenvolvida como parte de um desafio de estágio proposto pela Klubi, com o objetivo de criar um buscador de carros intuitivo e inteligente. Utilizando uma base de dados JSON, o DirigIA permite aos usuários encontrar veículos perguntando por eles no chat.

🔗 **Acesse a Aplicação Deployada:** [https://dirigia-buscador-de-carros.vercel.app/](https://dirigia-buscador-de-carros.vercel.app/)

*(**Observação Importante:** O backend desta aplicação está hospedado no plano gratuito da Render. Instâncias gratuitas na Render "hibernam" (spin down) após um período de inatividade, geralmente 15 minutos. Isso significa que a **primeira requisição** à API após este período pode levar de 30 a 60 segundos (ou mais) para ser respondida, enquanto a instância é reativada - o chamado "cold start". Após esta primeira ativação, as respostas subsequentes serão rápidas. Por favor, aguarde caso a primeira interação com o chat demore um pouco.)*

## Funcionalidades

* Busca de carros através de uma interface de chat interativa.
* Interpretação de linguagem natural para extrair intenções de busca (marca, modelo, local, preço).
* Respostas geradas por Inteligência Artificial (Google Gemini) para uma conversa fluida.
* Lógica de busca flexível que apresenta opções mesmo quando os critérios exatos não são atendidos.
* Feedback visual durante o carregamento das respostas da IA.
* Tratamento de erros de comunicação com a API.
* Tom de voz da IA personalizável, incluindo respostas contextuais e persuasivas (e até um toque de humor para pedidos de preço irreais!).
* Design responsivo e focado na usabilidade.
* Transições suaves na interface para uma melhor experiência visual.

## 🛠️ Tecnologias Utilizadas

**Frontend:**
* React (v19)
* Vite (como tooling de frontend)
* Tailwind CSS (v4)
* React Icons

**Backend:**
* Node.js
* Express (v5)
* Google Generative AI API (Gemini - modelo `gemini-1.5-flash-latest` ou similar)
* `cors` (para Cross-Origin Resource Sharing)
* `dotenv` (para gerenciamento de variáveis de ambiente em desenvolvimento)

**Plataformas de Deploy:**
* Frontend: Vercel
* Backend: Render

## 🚀 Configuração e Execução Local

Siga os passos abaixo para configurar e executar o projeto em sua máquina local.

### Pré-requisitos

* Node.js (versão 18.x ou superior é recomendada)
* npm (geralmente vem com o Node.js) ou yarn
