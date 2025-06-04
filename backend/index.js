const fs = require('fs');
const path = require('path');
require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Importa LLM do google
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());

const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:1337"];
if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:1337');
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

let todosOsCarros = [];
try {
  const filePath = path.join(__dirname, 'cars.json');
  const jsonData = fs.readFileSync(filePath, 'utf8');
  todosOsCarros = JSON.parse(jsonData);
  console.log(`${todosOsCarros.length} carros carregados do JSON.`);
} catch (e) {
  console.error('Erro ao carregar o arquivo carros.json:', e);
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) console.error("Chave API não encontrada! Verifique o arquivo backend/.env");

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

app.get('/api/test', (req, res) => {
  res.json({ message: 'Olá do backend do DirigIA! Tudo funcionando!' });
});

app.post('/api/search', async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) return res.status(400).json({ error: 'Nenhuma mensagem recebida no corpo da requisição.' });
  console.log('Mensagem recebida do usuário:', userMessage);

  let extractedData;
  // Esta lista será para os carros que correspondem EXATAMENTE (ou quase) ao pedido completo.
  let carrosFiltradosParaExibicaoExata = [];
  // Esta lista conterá todos os carros do modelo/marca principal que o usuário pediu, antes de aplicar preço/local exatos.
  let veiculosAlvoEncontradosNoEstoque = [];
  let aiFinalResponseText = "";

  try {
    // --- ETAPA 1: EXTRAIR ENTIDADES (sem mudanças aqui) ---
    const extrationPrompt = `
      Você é o "DirigIA", um assistente virtual especializado em ajudar usuários a encontrar carros.
      Seu objetivo é extrair as seguintes informações da mensagem do usuário:
      - "vehicle_brand_or_name": A marca ou o nome do carro (ex: "BYD", "Volkswagen", "Dolphin").
      - "vehicle_model": O modelo específico do carro, se mencionado e diferente do nome/marca (ex: "Polo", "HB20"). Se o nome já for o modelo (como "Dolphin"), pode repetir ou deixar null. 
      - "location": A cidade ou estado onde o usuário procura o carro (ex: "São Paulo", "Curitiba").
      - "price_approx": O valor aproximado que o usuário mencionou, como um número (ex: 100000).

      Se alguma informação não for claramente mencionada, retorne null para o campo correspondente.
      Responda APENAS com um objeto JSON contendo esses campos. Não adicione nenhuma explicação ou texto adicional fora do JSON.
      Mensagem do usuário: "${userMessage}"
      JSON extraído:
    `;
    const extractionResult = await model.generateContent(extrationPrompt);
    const extrationResponse = await extractionResult.response;
    const rawTextFromAIForExtration = extrationResponse.text();
    const cleanedTextForExtration = rawTextFromAIForExtration.replace(/^```json\s*|```\s*$/g, '').trim();
    extractedData = JSON.parse(cleanedTextForExtration);
    console.log('Dados extraidos pela IA:', extractedData);

    let baseCarList = [...todosOsCarros];

    if (extractedData.vehicle_brand_or_name) {
      const searchTerm = extractedData.vehicle_brand_or_name.toLowerCase();
      baseCarList = baseCarList.filter(carro =>
        carro.Name.toLowerCase().includes(searchTerm) || (carro.Model && carro.Model.toLowerCase().includes(searchTerm))
      );
    }
    if (extractedData.vehicle_model) {
      const modelSearchTerm = extractedData.vehicle_model.toLowerCase();
      if (!extractedData.vehicle_brand_or_name || extractedData.vehicle_brand_or_name.toLowerCase() !== modelSearchTerm) {
        baseCarList = baseCarList.filter(carro =>
          (carro.Model && carro.Model.toLowerCase().includes(modelSearchTerm)) || carro.Name.toLowerCase().includes(modelSearchTerm)
        );
      }
    }
    veiculosAlvoEncontradosNoEstoque = [...baseCarList]; 
    console.log(`${veiculosAlvoEncontradosNoEstoque.length} VEÍCULOS ALVO encontrados (ex: todos os Civics).`);

    carrosFiltradosParaExibicaoExata = [...veiculosAlvoEncontradosNoEstoque];

    if (extractedData.location) {
      const locationSearchTerm = extractedData.location.toLowerCase();
      carrosFiltradosParaExibicaoExata = carrosFiltradosParaExibicaoExata.filter(carro =>
        carro.Location.toLowerCase().includes(locationSearchTerm)
      );
    }

    let isUnrealisticPrice = false;
    let minActualPriceOfTargetVehicle = 0;

    if (extractedData.price_approx !== null && typeof extractedData.price_approx === 'number' && veiculosAlvoEncontradosNoEstoque.length > 0) {
      minActualPriceOfTargetVehicle = Math.min(...veiculosAlvoEncontradosNoEstoque.map(car => car.Price));

      const unrealisticThreshold = 0.4

      if (extractedData.price_approx < (minActualPriceOfTargetVehicle * unrealisticThreshold)) {
        isUnrealisticPrice = true;
        console.log(`Preço IRREAL detectado: Usuário pediu R$${extractedData.price_approx}, mas o ${extractedData.vehicle_brand_or_name || ''} ${extractedData.vehicle_model || ''} mais barato custa R$${minActualPriceOfTargetVehicle}.`);
      }
    } 

    const carrosParaContextoDaIA = veiculosAlvoEncontradosNoEstoque.slice(0, 5).map(c => ({ // Aumentei para 5, se houver
      Name: c.Name,
      Model: c.Model,
      Price: c.Price,
      Location: c.Location
    }));

    let personaInstruction = "";

    if (isUnrealisticPrice) {
      const requestedPriceFormatted = extractedData.price_approx ? extractedData.price_approx.toLocaleString('pt-BR') : 'um valor muito baixo';
      const vehicleName = `${extractedData.vehicle_brand_or_name || ''} ${extractedData.vehicle_model || ''}`.trim();
      const minActualPriceFormatted = minActualPriceOfTargetVehicle > 0 ? minActualPriceOfTargetVehicle.toLocaleString('pt-BR') : 'um valor mais realista';

      personaInstruction = `
        INSTRUÇÃO ESPECIAL ADICIONAL PARA ESTA RESPOSTA: O usuário pediu um ${vehicleName} por aproximadamente R$ ${requestedPriceFormatted}. No entanto, o veículo ${vehicleName} que encontramos custa a partir de R$ ${minActualPriceFormatted}, o que torna o pedido do usuário BEM abaixo do valor de mercado.
        Ao iniciar sua resposta, você PODE fazer um comentário levemente bem-humorado ou espirituoso sobre essa grande diferença de preço, ANTES de apresentar a opção real de forma profissional.
        Por exemplo, um tom como: "Um ${vehicleName} por R$ ${requestedPriceFormatted}? Adoraria encontrar um para mim nesse preço também! 😉 Mas, falando sério, o que tenho aqui..." ou "R$ ${requestedPriceFormatted} por um ${vehicleName}? Essa seria a pechincha do século! 😄 Bom, no mundo real, o ${vehicleName} que temos está disponível por...".
        O objetivo é um gracejo leve sobre o preço ser um sonho, sem zombar ou ofender o usuário. Após este comentário inicial sobre o preço, siga as instruções normais abaixo para apresentar o carro e ser persuasivo. Se o preço pedido não fosse irreal, você ignoraria completamente esta instrução especial.
      `;  
    }

    const responseGenerationPrompt = `
      Você é o "DirigIA", um assistente de vendas de carros virtual amigável, proativo e MUITO persuasivo. Seu objetivo principal é ajudar o usuário a encontrar um carro e convencê-lo a considerar as opções disponíveis, mesmo que não sejam um match perfeito.
      ${personaInstruction} {/* A instrução de persona será inserida aqui se aplicável */}
      O usuário fez a seguinte busca: "${userMessage}"
      Com base nisso, entendemos que ele procura por: Marca/Nome: ${extractedData.vehicle_brand_or_name || 'Não especificado'}, Modelo: ${extractedData.vehicle_model || 'Não especificado'}, Localização: ${extractedData.location || 'Não especificada'}, Preço Aproximado: R$ ${extractedData.price_approx ? extractedData.price_approx.toLocaleString('pt-BR') : 'Não especificado'}.

      Após buscar em nosso estoque, estes foram os veículos da marca/modelo principal que encontramos (se houver):
      ${carrosParaContextoDaIA.length > 0 ? JSON.stringify(carrosParaContextoDaIA) : "Nenhum veículo da marca/modelo principal solicitado foi encontrado em nosso estoque."}

      Sua tarefa é gerar uma resposta para o usuário. Analise o pedido do usuário e compare com os veículos encontrados. Seja um excelente vendedor!

      Instruções para a resposta (IGNORE a instrução de ironia acima se o preço pedido NÃO for irreal):

      1.  SE VEÍCULOS DA MARCA/MODELO PRINCIPAL FORAM ENCONTRADOS (${carrosParaContextoDaIA.length > 0}):
          a.  Primeiro, verifique se algum deles é uma BOA CORRESPONDÊNCIA para a LOCALIZAÇÃO e PREÇO (+/- 20%) pedidos pelo usuário.
              - Se SIM (boa correspondência): Ótimo! Apresente o(s) carro(s) entusiasticamente, destacando seus pontos positivos. Ex: "Boas notícias! Encontrei o ${carrosParaContextoDaIA.length > 0 ? carrosParaContextoDaIA[0].Name + ' ' + carrosParaContextoDaIA[0].Model : 'carro'} que você procura em ${carrosParaContextoDaIA.length > 0 ? carrosParaContextoDaIA[0].Location : ''} por R$${carrosParaContextoDaIA.length > 0 ? carrosParaContextoDaIA[0].Price.toLocaleString('pt-BR') : ''}! É uma excelente opção, super completo..."
          b.  Se NÃO (os carros encontrados da marca/modelo principal diferem significativamente no preço ou estão em outra localidade):
              - Apresente o(s) veículo(s) encontrado(s) da marca/modelo principal, reconhecendo a diferença. Ex: "Encontrei o ${carrosParaContextoDaIA.length > 0 ? carrosParaContextoDaIA[0].Name + ' ' + carrosParaContextoDaIA[0].Model : 'carro'} que você quer! Ele está em ${carrosParaContextoDaIA.length > 0 ? carrosParaContextoDaIA[0].Location : ''} e o preço é R$${carrosParaContextoDaIA.length > 0 ? carrosParaContextoDaIA[0].Price.toLocaleString('pt-BR') : ''}."
              - IMEDIATAMENTE APÓS, tente convencer o usuário sobre esses carros. Justifique o preço (se mais alto, destaque valor, condição, ítens de série, etc.). Se for outra localidade, minimize a distância ou sugira a visita como uma oportunidade. Ex: "Sei que você mencionou R$${extractedData.price_approx ? extractedData.price_approx.toLocaleString('pt-BR') : 'X'}, mas esta unidade está impecável, é super completa e é um ótimo investimento pela qualidade e baixa quilometragem. Ou, sobre a localização, ${carrosParaContextoDaIA.length > 0 ? carrosParaContextoDaIA[0].Location : ''} não é tão longe e pode valer a viagem pela qualidade do carro que encontrei para você!"
              - SE a diferença for muito grande ou o usuário parecer hesitante, SEJA PROATIVO E OFEREÇA AJUDA ADICIONAL: Ofereça buscar alternativas mais alinhadas. Ex: "Mas entendo que talvez este não seja exatamente o que você tinha em mente. Se este não te agradar 100%, me diga! Podemos refinar a busca: quer que eu procure outros modelos na sua faixa de preço de R$${extractedData.price_approx ? extractedData.price_approx.toLocaleString('pt-BR') : 'X'}, ou talvez que eu ajuste os filtros para outras localidades? O que acha de explorarmos outras opções juntos?"

      2.  SE NENHUM VEÍCULO DA MARCA/MODELO PRINCIPAL FOI ENCONTRADO NO ESTOQUE (${carrosParaContextoDaIA.length === 0}):
          - Seja empático, mas IMEDIATAMENTE PROATIVO E PERSUASIVO: "Poxa, infelizmente não tenho nenhum ${extractedData.vehicle_brand_or_name || ''} ${extractedData.vehicle_model || ''} como você pediu no estoque neste exato momento. Mas não se preocupe, minha especialidade é justamente encontrar o carro certo para cada pessoa!"
          - Sugira ativamente ajustar os filtros do pedido original: "Para te ajudar a encontrar uma joia, que tal explorarmos algumas alternativas? Se você tiver um pouco de flexibilidade no seu orçamento de R$${extractedData.price_approx ? extractedData.price_approx.toLocaleString('pt-BR') : 'que você mencionou'}, ou se pudermos considerar cidades vizinhas à ${extractedData.location || 'região desejada'}, um novo leque de opções pode se abrir! Muitas vezes, um pequeno ajuste na busca revela carros incríveis."
          - Ofereça buscar outros tipos de carro, tentando entender a necessidade: "Além disso, posso procurar outros modelos ou marcas que são excelentes e podem se encaixar perfeitamente no seu orçamento e na localidade que você prefere. Você estaria aberto a conhecer outras opções que têm agradado muito nossos clientes e que podem te surpreender? Qual o principal uso que você fará do carro?"
          - Faça perguntas para entender melhor a necessidade e manter o diálogo: "O que é mais importante para você neste momento: é manter-se estritamente neste modelo, ou você prioriza mais a faixa de preço, o tipo de carro (SUV, sedan, hatch), ou algum item específico? Com mais alguns detalhes, posso refinar a busca e te apresentar algo que você vai amar!"

      Lembre-se: sua tarefa é gerar uma MENSAGEM DE TEXTO para o usuário. Sua resposta final DEVE ser em linguagem natural e conversacional. NUNCA retorne um objeto JSON ou qualquer estrutura de código como resposta final para o usuário.
      A resposta deve ser apenas o texto para o usuário, sem saudações repetitivas como "Olá!". Seja conciso, mas completo e, acima de tudo, CONVINCENTE e PRESTATIVO.
    `;

    const responseGenerationResult = await model.generateContent(responseGenerationPrompt);
    const responseGenerationResponse = await responseGenerationResult.response;
    aiFinalResponseText = responseGenerationResponse.text().trim();
    console.log('Resposta final gerada pela IA:', aiFinalResponseText);

    let foundCars = carrosFiltradosParaExibicaoExata.length > 0 ? carrosFiltradosParaExibicaoExata : veiculosAlvoEncontradosNoEstoque.slice(0,3);

    res.json({
      ai_interpretation: extractedData,
      original_message: userMessage,
      ai_response_text: aiFinalResponseText,
      found_cars: foundCars
    });

  } catch (e) {
    console.error('Erro no endpoint /api/search:', e);
    let errorMessage = 'Ocorreu um erro interno no servidor ao processar sua solicitação.';
    if (e.message.includes("JSON.parse")) {
      errorMessage = 'Erro ao processar a interpretação inicial da sua mensagem. Por favor, tente reformular.';
    } else if (e.response && e.response.status === 503) {
      errorMessage = 'Desculpe, estou com um pouco de dificuldade para me conectar com minha inteligência. Tente novamente em alguns instantes.';
    }
    res.status(500).json({ error: errorMessage, details: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor DirigIA rodando na porta ${PORT}`);
});