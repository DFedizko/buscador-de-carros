import { useState } from "react";
import { FiSend } from "react-icons/fi";

const ChatForm = ({ type, placeholder, isLoading, handleSendMessage }) => {
    const [inputValue, setInputValue] = useState("");

    const handleOnSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim() === "" || isLoading ) return;

        handleSendMessage(inputValue);
        setInputValue("");
    }

    const handleKeyDowm = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleOnSubmit(e);
        }
    }

    return <form className="flex items-center mx-auto bg-secondary-bg w-1/2 py-3 px-4 rounded-3xl gap-4">
        <input
            className="w-full placeholder:text-sm placeholder:text-secondary outline-0"
            type={type}
            placeholder={placeholder}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDowm}
        />
        <button onClick={handleOnSubmit} type="submit">
            <FiSend color="white" />
        </button>
    </form>;
}

export default ChatForm;