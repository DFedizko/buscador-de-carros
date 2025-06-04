const MessageCard = ({ text, sender, cars }) => {
    const isUser = sender === "user";
    
    const formatText = (txt) => {
        if (typeof txt !== 'string') {
            return "";
        }
        return txt.split('\n').map((line, i) => (
            <span key={i}>{line}<br /></span>
        ));
    };
    
    return (
        <li className="p-4 rounded-2xl max-w-full lg:max-w-[48%]">
            <p className="text-start lg:text-base text-sm">{formatText(text)}</p>

            {!isUser && cars && cars.length > 0 &&
                cars.map((car, i) => (
                    <div key={i} className="flex flex-col gap-2">
                        <img 
                            src={car.Image || "https://via.placeholder.com/150?text=Sem+Imagem"} 
                            alt={`${car.Name} ${car.Model}`}
                            className="w-full h-24 object-cover rounded"
                        />
                        <p>{car.Name} {car.Model}</p>
                        <p>R${car.Price.toLocaleDateString("pt-BR")}</p>
                        <p>{car.Location}</p>
                    </div>
                ))
            }
        </li>
    );
}

export default MessageCard;