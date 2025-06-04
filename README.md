# 🚗 DirigIA - Buscador de Carros Inteligente

Resolução do desafio proposto pela Klubi, que consiste em uma aplicação para buscar carros para compra, usando um JSON `cars.json` fornecido como base de dados.

## Sobre o Projeto

DirigIA é uma aplicação full-stack desenvolvida como parte de um desafio de estágio proposto pela Klubi, com o objetivo de criar um buscador de carros intuitivo e inteligente. Utilizando uma base de dados JSON, o DirigIA permite aos usuários encontrar veículos perguntando por eles no chat. A ideia foi trazer a melhor experiência de usuário com um agente que responde de maneira persoasiva e descontraída com uma interface limpa e moderna.

![Imagem do DirigIA](https://i.imgur.com/CHxJNNn.png)

🔗 **Acesse a Aplicação Através Deste Link:** [https://dirigia-buscador-de-carros.vercel.app/](https://dirigia-buscador-de-carros.vercel.app/)

*(**Observação Importante:** O backend desta aplicação está hospedado no plano gratuito da Render. Instâncias gratuitas na Render "hibernam" (spin down) após um período de inatividade, geralmente 15 minutos. Isso significa que a **primeira requisição** à API após este período pode levar de 30 a 60 segundos (ou mais) para ser respondida, enquanto a instância é reativada - o chamado "cold start". Após esta primeira ativação, as respostas subsequentes serão rápidas. Por favor, aguarde caso a primeira interação com o chat demore um pouco.)*

## Índice

* [Sobre o Projeto](#sobre-o-projeto)
* [Funcionalidades](#funcionalidades)
* [:hammer_and_wrench: Tecnologias Utilizadas](#tecnologias-utilizadas)
* [Como Executar o Projeto Localmente](#como-executar-o-projeto-localmente)
* [Decisões Técnicas e Experiência do Usuário](#decisões-técnicas-e-experiência-do-usuário)
* [:briefcase: Plano de Negócios](#plano-de-negócios)
* [Desenvolvedor](#desenvolvedor)

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

<div>
  <img src="https://img.shields.io/badge/react-239120?&style=for-the-badge&logo=react&logoColor=white">
  <img src="https://img.shields.io/badge/node-239120?&style=for-the-badge&logo=node&logoColor=white">
  <img src="https://img.shields.io/badge/tailwindcss-239120?&style=for-the-badge&logo=tailwindcss&logoColor=white">
</div>

**Frontend:**
* React (v19)
* Vite (como tooling de frontend)
* Tailwind CSS (v4)
* React Icons

**Backend:**
* Node.js
* Express (v5)
* Google Generative AI API (Gemini - modelo `gemini-2.0-flash` ou similar)
* `cors` (para Cross-Origin Resource Sharing)
* `dotenv` (para gerenciamento de variáveis de ambiente em desenvolvimento)

**Plataformas de Deploy:**
* Frontend: Vercel
* Backend: Render

## Como Executar o Projeto Localmente

O projeto está hospedado na vercel e no render, mas caso deseje aqui está uma passo a passo para executar localmente.
Siga os passos abaixo para configurar e executar o projeto em sua máquina local.

### Pré-requisitos

* Node.js (versão 18.x ou superior é recomendada)
* npm (geralmente vem com o Node.js) ou yarn

### 1. Clone o Repositório

Primeiro, clone este repositório para a sua máquina local. Se você ainda não o fez, substitua `[URL_DO_SEU_REPOSITORIO_GIT]` pela URL correta:
```bash
git clone https://github.com/DFedizko/dirigia-buscador-de-carros.git
```

### 2. Configuração do Backend

1. Navegue até a pasta do backend

   ```bash
   cd backend 
   ```

2. Instale as dependências do backend

   ```bash
   npm install
   # ou, se usar yarn:
   # yarn install
   ```

3. Crie um arquivo chamado `.env` na raiz da pasta `backend/`. Adicione sua chave da API do Google Gemini e defina a porta:
  
   ```backend/.env
   GEMINI_API_KEY="SUA_CHAVE_SECRETA_DA_API_DO_GEMINI_AQUI"
   PORT=3001
   FRONTEND_URL="http://localhost:1337"
   NODE_ENV="development"
   ```

4. Inicie o servidor backend:

   ```bash
   npm start
   ```

  O backend deverá estar rodando em `http://localhost:3001` (ou na porta que você definiu).

### 3. Configuração do Frontend

1. Em um novo terminal, navegue até a pasta do frontend (a partir da raiz do projeto clonado):
   
    ```bash
    cd frontend
    ```

2. Instale as dependências do frontend:
   
    ```bash
    npm install
    # ou, se usar yarn:
    # yarn install
    ```

3. Crie um arquivo chamado `.env` na raiz da pasta `frontend/`. Adicione a URL base da sua API de backend local:

    ```frontend/.env
    VITE_API_BASE_URL=http://localhost:3001
    ```

4. Inicie o servidor de desenvolvimento do frontend:

    ```bash
    npm run dev
    # ou, se usar yarn:
    # yarn dev
    ```

   O frontend deverá estar acessível em `http://localhost:1337` (ou a porta indicada pelo Vite no seu terminal).

## Decisões Técnicas e Experiência do Usuário

O desenvolvimento do DirigIA foi pensado para ser uma solução rápida para resolver um desafio que foi proposto, e ainda buscando uma boa experiência para o usuário, de forma simples e inteligente para atender função, que é a busca de carros.

### Escolha das tecnologias

Para desenvolver o agente com uma interface amigável de forma rápida, funcional e divertida eu escolhi a seguinte stack: 

- `React.js com TailwindCSS`: Para o frontend, essas tecnologias me possibilitaram construir a interface de forma rápida, componentizando os elementos e aplicando estilos por siglas através do tailwind, o que além de me trazer produtividade, o tailwind ainda permite configurar estilos padrões que traz uma maior robustez e boas práticas para a aplicação.
- `Node.js com Express`: A escolha do Node com express foi devido a dois principais fatores, o primeiro é porque o ambiente react já utiliza node, eu consigo ter uma familiaridade maior com o código uma vez que ambos os lados estão em javascript. E o segundo fator, é que o javascript é a linguagem que mais domino e tenho praticado atualmente, o que me possiblitou desenvolver a aplicação com mais agilidade e maestria.
- `Google Gemini`: Escolhi o LLM da google, pois teria o maior custo x benefício para a aplicação, como eu tenho o plano pro do gemini, tenho acesso a chave API do gemini, que traz respostas bem decentes para o propósito do desafio.

### Experiência do Usuário (UX)

Pensando na UX os seguintes pontos foram abrangidos:

-  **Interface de Chat:** A escolha por uma interface de chat visa tornar a busca mais natural e menos intimidante do que formulários com múltiplos campos. O usuário pode expressar sua necessidade em linguagem coloquial.
-  **Feedback ao Usuário:**
      * Um indicador de "DirigIA está pensando..." informa ao usuário que a busca está em andamento.
      * Mensagens de erro são exibidas de forma clara no chat caso ocorram problemas na comunicação com a API ou na interpretação da IA.
- **Design e Estilo:**: Com o tailwind foi desenvolvido uma interface limpa e moderna, e **responsiva**. 
- **Tom de Voz da IA:** Foi dada atenção especial aos prompts para que a IA do DirigIA seja não apenas funcional, mas também amigável, prestativa e persuasiva.

## 💼 Plano de Negócios

Segue a resposta para algumas perguntas relacionadas ao plano de negócios que foram levantadas no desafio:

1. **Se você fosse lançar esse buscador no mercado, qual seria seu modelo de negócios?**
   
  - O modelo de negócios seria o "freemium", eu pretenderia aprimorar a lógica do código, migrar a base de dados para um banco com muito mais carros, ou consumir alguma api, e migraria o modelo do agente para um mais forte, o que deixaria a aplicação mais cara. Porém com o "freemium" o usuário teria algumas mensagens grátis para usar o buscador, e o cliente vendo a qualidade das respostas (que serão muito aprimoradas), assinaria uma mensalidade para poder usar o DirigIA sem limitações de uso.

2. **Como você atrairia seus primeiros usuários? (Estratégia de aquisição, canais, etc)**

  - Seria através de duas formas, com tráfego orgâncio e tráfego pago. Seria criado uma página para o DirigIA nas principais redes socias (instagram e tiktok), e a partir dessa página seria iniciado o processo de criação de conteúdo, mostrando o produto, mostrando como as pessoas podem encontrar melhores oportunidades para comprar carros baratos. E a segunda forma seria através do tráfego pago, seria contratado serviços do facebook e google ads, para anunciar o DirigIA em marketplaces e sites de carros.
  
3. **Qual seria sua estimativa de CAC (Custo de Aquisição de Cliente)?**

  - O Custo de Aquisição de Cliente (CAC) será determinado e continuamente otimizado com base no desempenho de campanhas de marketing digital (Google/Social Ads) e no engajamento das mídias sociais, focando na relação entre investimento e a geração de usuários ativos ou leads qualificados. Uma projeção de CAC inicial seria entre R$7 a R$20 por usuário ativo que realize buscas, isso **desconsiderando** o engajamento orgânico que pode baratear bastante esse custo.

4. **Qual seria sua proposta de LTV (Lifetime Value) e como você maximizaria isso?**

  - O LTV seria a receita total gerada por cada assinante ao longo do seu tempo conosco. Esse valor será maximizado garantindo que a assinatura mensal do DirigIA sempre represente um excelente investimento para o usuário, através da entrega contínua de resultados de busca superiores e das melhores ofertas de veículos.

5. **Que tipo de monetização você considera viável para essa aplicação?**

  - A assinatura dos usuário, seria cobrado um valor mensal para os usuário utilizarem o buscador.

6. **Há alguma estratégia de retenção de usuários que você aplicaria?**

  - A retenção será cultivada através de uma experiência de usuário superior e personalizada, como no futuro o modelo de AI seria mais forte; será criado um banco de dados com todos os carros, ou uma api que retorna todos os carros para alimentar a AI; a lógica do código e os prompts serão evoluidos, a experiência do usuário seria excelente, o DirigIA seria capaz de sempre trazer os melhores preços para os carros. E como as pessoas costumam comprar carros sempre, a retenção dos usuários ocorreria pela excelência do buscador em sempre trazer as melhores ofertas para os usuários, mostrando boas oportunidades, o que satisfaria o cliente. E claro, os anúncios constantes e as páginas nas mídias sociais sempre com conteúdos, renteria os usuários deixando-os curiosos por novidades e etc.

## Desenvolvedor

| [<img loading="lazy" src="https://avatars.githubusercontent.com/u/74017914?v=4" width=115><br><sub>Pedro Fedizko de Castro</sub>](https://github.com/DFedizko) |
| :---: |
