import ChatForm from "./components/ChatForm";
import PageTitle from "./components/PageTitle";

const Home = () => {
    return (
        <main className="text-center flex flex-col justify-center items-center gap-28">
            <PageTitle />
            <ChatForm
                type="text"
                placeholder="Procure o carro que está pensando..."
            />
        </main>
    );
}

export default Home;