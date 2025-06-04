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
        <li className="p-4 rounded-2xl max-w-full lg:max-w-[48%] flex flex-col gap-4">
            <p className="text-start lg:text-base text-sm">{formatText(text)}</p>

            {!isUser && cars && cars.length > 0 &&
                cars.map((car, i) => (
                    <div key={i} className="flex flex-col gap-2 text-start">
                        <img 
                            src={car.Image || "https://via.placeholder.com/150?text=Sem+Imagem"} 
                            alt={`${car.Name} ${car.Model}`}
                            className="w-full object-cover rounded"
                        />
                        <p>- {car.Name} {car.Model}</p>
                        <p className="text-green-500">- R${car.Price ? car.Price.toLocaleString("pt-BR") : 'N/A'}</p>
                        <p>- {car.Location}</p>
                    </div>
                ))
            }
        </li>
    );
}

export default MessageCard;