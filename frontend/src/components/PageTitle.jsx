const PageTitle = ({ conversationStarted }) => {
    return (
        <div className="flex flex-col items-center">
            <h1 className={`text-4xl ${conversationStarted === true ? "" : "mb-3"}`}>
                Dirig
                <span className="text-transparent bg-clip-text [background-image:linear-gradient(134deg,rgba(42,123,155,1)_0%,rgba(199,87,122,1)_99%)]">
                    IA
                </span>
            </h1>
            <p
                className={`
                    text-secondary w-2/3 text-center
                    overflow-hidden
                    transition-all ease-in-out duration-500
                    ${conversationStarted
                        ? 'opacity-0 max-h-0 py-0'
                        : 'opacity-100 max-h-40 py-2'
                    }
                `}
            >
                Bem-vindo ao DirigIA — aqui, sua busca por carros é mais rápida, fácil e inteligente.
            </p>
        </div>
    );
}

export default PageTitle;