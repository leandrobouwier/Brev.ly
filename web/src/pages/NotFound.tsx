import NotFoundIcon from "../assets/404.svg";

export function NotFound() {
    return (
        <div className="h-dvh flex justify-center items-center">
            <div className="flex flex-col gap-4 items-center bg-gray-100 rounded-lg mx-4 p-8 lg:p-16 lg:mx-0 text-center max-w-lg">
                <img src={NotFoundIcon} alt="Brev" className="w-[12.125rem] h-[5.313rem]" />
                <p className="typography-xl text-gray-600">Link não encontrado</p>
                <span className="typography-md text-gray-500">O link que você está tentando acessar não existe, foi removido ou é uma URL inválida. Saiba mais em <a href="#" className="typography-md text-brand-blue">abrev.ly</a></span>
            </div>
        </div>
    )

}