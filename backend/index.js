require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Importa LLM do google

const app = express();

const PORT = process.env.PORT || 3001;

app.use(express.json());

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

  try {
    const prompt = `
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textFromAI = response.text();

    console.log('Resposta crua da IA:', textFromAI);
    
    let extractedData;
    try {
      const cleanedText = textFromAI.replace(/^```json\s*|```\s*$/g, '').trim(); // limpa possível resposta em markdown da IA
      extractedData = JSON.parse(cleanedText);
      console.log('Dados extraidos pela IA:', extractedData);
    } catch (e) {
      console.error('Erro ao fazer parse da resposta JSON da IA:', e);
      console.error('Resposta original da IA que causou o erro:', textFromAI);
      return res.status(500).json({ error: 'Erro ao processar a resposta da IA. A IA não retornou um JSON válido.' });
    }

    res.json({
      ai_interpretation: extractedData, // O que a IA entendeu
      original_message: userMessage,
      ai_response_text: "DirigIA está processando sua solicitação com os dados extraídos!",
      found_cars: []
    });

  } catch (error) {
    console.error('Erro ao chamar a API:', error);
    res.status(500).json({ error: 'Ocorreu um erro ao tentar contatar o serviço de IA.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor DirigIA rodando na porta ${PORT}`);
});