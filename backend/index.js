const fs = require('fs');
const path = require('path');
require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Importa LLM do google

const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());

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

  if (!userMessage) return res.status(400).json({ error: 'Nenhuma mensagem recebida no corpo da requisição.' })

  console.log('Mensagem recebida do usuário:', userMessage);

  let extractedData;
  let carrosFiltrados = [...todosOsCarros];
  let aiFinalResponseText = "";

  try {
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

    // console.log('Enviando prompt de extração para IA:', extrationPrompt);
    const extractionResult = await model.generateContent(extrationPrompt);
    const extrationResponse = await extractionResult.response;
    const rawTextFromAIForExtration = extrationResponse.text();
    // console.log('Resposta crua da IA:', rawTextFromAIForExtration);

    const cleanedTextForExtration = rawTextFromAIForExtration.replace(/^```json\s*|```\s*$/g, '').trim(); // limpa possível resposta em markdown da IA
    extractedData = JSON.parse(cleanedTextForExtration);
    console.log('Dados extraidos pela IA:', extractedData);
        
    if (extractedData.vehicle_brand_or_name) {
      const searchTerm = extractedData.vehicle_brand_or_name.toLowerCase();
      carrosFiltrados = carrosFiltrados.filter(carro =>
        carro.Name.toLowerCase().includes(searchTerm) || (carro.Model && carro.Model.toLowerCase().includes(searchTerm)) // Filtra no array caso o nome do carro esteja no modelo
      );
    }

    if (extractedData.vehicle_model) {
      const modelSearchTerm = extractedData.vehicle_model.toLowerCase();

      if (!extractedData.vehicle_brand_or_name || extractedData.vehicle_brand_or_name.toLowerCase() !== modelSearchTerm) {
        carrosFiltrados = carrosFiltrados.filter(carro =>
          (carro.Model && carro.Model.toLowerCase().includes(modelSearchTerm) || carro.Name.toLowerCase().includes(modelSearchTerm))
        );
      }
    }

    if (extractedData.location) {
      const locationSearchTerm = extractedData.location.toLowerCase();
      carrosFiltrados = carrosFiltrados.filter(carro =>
        carro.Location.toLowerCase().includes(locationSearchTerm)
      );
    }

    if (extractedData.price_approx !== null && typeof extractedData.price_approx === 'number') {
      const targetPrice = extractedData.price_approx;
      const range = 0.20; // 20% de variação no preço
      const minPrice = targetPrice * (1 - range);
      const maxPrice = targetPrice * (1 + range);
      carrosFiltrados = carrosFiltrados.filter(carro =>
        carro.Price >= minPrice && carro.Price <= maxPrice
      );
    }

    console.log(`${carrosFiltrados.length} carros encontrados após o filtro.`);

    const carrosParaContexto = carrosFiltrados.slice(0, 3).map(c => ({ Name: c.Name, Model: c.Model, Price: c.Price, Location: c.Location }));

    const responseGenerationPrompt = `
      Você é o "DirigIA", um assistente de vendas de carros virtual amigável e persuasivo.
      O usuário fez a seguinte busca: "${userMessage}"
      Com base nisso, entendemos que ele procura por: Marca/Nome: ${extractedData.vehicle_brand_or_name || 'Não especificado'}, Modelo: ${extractedData.vehicle_model || 'Não especificado'}, Localização: ${extractedData.location || 'Não especificada'}, Preço Aproximado: ${extractedData.price_approx || 'Não especificado'}.

      Após buscar em nosso estoque, estes foram os resultados relevantes:
      ${carrosParaContexto.length > 0 ? JSON.stringify(carrosParaContexto) : "Nenhum carro encontrado que corresponda exatamente."}

      Sua tarefa é gerar uma resposta para o usuário. Seja direto, amigável e, se necessário, tente convencê-lo.

      Instruções para a resposta:
        - Se carros foram encontrados (${carrosParaContexto.length > 0}):
          - Se correspondem bem aos critérios: Apresente-os entusiasticamente. Ex: "Boas notícias! Encontrei algumas opções excelentes para você:"
          - Se os carros encontrados diferem um pouco (ex: outra localidade próxima, preço um pouco diferente mas dentro da faixa de 20%): Reconheça o pedido original, mencione o que foi encontrado e justifique por que ainda pode ser uma boa opção. Ex: "Olha, não encontrei exatamente em [Local Pedido], mas tenho este [Carro Encontrado] em [Local Encontrado], que é uma ótima oportunidade e fica pertinho! O preço também está muito bom."
          - Se o usuário pediu um preço e o carro encontrado está mais caro (mas dentro da faixa de 20%): Justifique o valor, ex: "Encontrei este [Carro] por R$${carrosParaContexto.length > 0 ? carrosParaContexto[0].Price : ''}, um pouco acima do que você mencionou, mas ele é super completo e uma ótima oportunidade!"
        - Se NENHUM carro foi encontrado (${carrosParaContexto.length === 0}):
          - Seja empático. Ex: "Poxa, não encontrei exatamente o que você procura com esses critérios."
          - Sugira alternativas: "Que tal tentarmos uma busca mais ampla? Posso procurar por [Marca/Nome similar, se aplicável] ou em outras localidades?" ou "Você gostaria de ver outros modelos na faixa de preço de R$${extractedData.price_approx || 'X'}?"
          - Se o usuário pediu algo muito específico (ex: modelo raro): "O [Modelo pedido] é um pouco mais difícil de encontrar, mas posso ficar de olho para você! Enquanto isso, que tal ver outros modelos [Marca]?"

      A resposta deve ser apenas o texto para o usuário, sem saudações repetitivas como "Olá!". Seja conciso, mas completo.
    `;

    // console.log('Enviando o prompt de geração de resposta para IA:', responseGenerationPrompt);
    const responseGenerationResult = await model.generateContent(responseGenerationPrompt);
    const responseGenerationResponse = await responseGenerationResult.response;
    aiFinalResponseText = responseGenerationResponse.text().trim();
    console.log('Resposta final gerada pela IA:', aiFinalResponseText);

    res.json({
      ai_interpretation: extractedData,
      original_message: userMessage,
      ai_response_text: aiFinalResponseText,
      found_cars: carrosFiltrados
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