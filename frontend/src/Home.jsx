import { useState, useEffect, useRef } from "react";
import ChatForm from "./components/ChatForm";
import PageTitle from "./components/PageTitle";
import MessageCard from "./components/MessageCard";

const Home = () => {
    const BASE_URL = "http://localhost:3001";
    const [conversationStarted, setConversationStarted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);


    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (userInput) => {
        setConversationStarted(true);

        const newUserMessage = {
            id: Date.now(),
            sender: "user",
            text: userInput,
            cars: []
        };
        setMessages(prevMessages => [...prevMessages, newUserMessage]);

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`${BASE_URL}/api/search`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userInput })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }

            const data = await res.json();
            const aiResponse = {
                id: Date.now() + Math.random(),
                sender: "ai",
                text: data.ai_response_text,
                cars: data.found_cars || []
            };
            setMessages(prevMessages => [...prevMessages, aiResponse]);

        } catch (e) {
            console.error("Erro ao buscar resposta da IA:", e);
            const errorMessageText = `Desculpe, tive um probleminha para processar sua busca: ${e.message}. Tente novamente!`;
            setError(errorMessageText);
            const errorMessage = {
                id: Date.now() + Math.random(),
                sender: "ai",
                text: errorMessageText,
                cars: []
            };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className={`text-center flex flex-col items-center px-6 pt-6 
            ${conversationStarted ? "justify-between" : "justify-center gap-10"}`}>
            <PageTitle conversationStarted={conversationStarted} />
            
            <div className={`
                w-[80%]
                transition-all ease-in-out duration-1000
                mb-18
                ${conversationStarted 
                    ? "opacity-100 flex-grow" 
                    : "opacity 0 max-h-0 border-none"
                }
            `}>
                <ul className="h-full w-full flex flex-col items-start p-6 gap-8 [&>*:nth-child(odd)]:self-end [&>*:nth-child(odd)]:bg-secondary-bg [&>*:nth-child(even)]:bg-tertiary-bg ">
                    {messages.map(msg =>
                        <MessageCard 
                            key={msg.id}
                            text={msg.text}
                            sender={msg.sender}
                            cars={msg.cars}
                        />
                    )}
                    {isLoading &&
                        <li className="self-center text-sm bg-none text-secondary animate-pulse p-2 rounded-2xl">DirigIA está procurando...</li>
                    }
      
                    {error && !isLoading &&
                        <li className="self-center text-sm text-red-400 p-2">{error}</li>
                    }
                    <li ref={messagesEndRef}></li>
                </ul>
            </div>
            <div className={`w-full p-4 bg-main-bg bottom-4 ${conversationStarted && "fixed"}`}>
                <ChatForm
                    type="text"
                    placeholder={conversationStarted ? "Converse com DirigIA..." : "Procure o carro que está pensando..."}
                    isLoading={isLoading}
                    handleSendMessage={handleSendMessage}
                />
            </div>
        </main>
    );
}

export default Home;