import { useEffect } from "react";
import { useParams } from "react-router-dom";
import LogoIcon from "@/assets/Logo_Icon.svg";

export function Redirect() {
    const { code } = useParams(); 
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3333";

    const redirectUrl = `${backendUrl}/${code}`;

    useEffect(() => {
        if (code) {
            const timer = setTimeout(() => {
            
                window.location.href = redirectUrl;
            }, 800);

            return () => clearTimeout(timer);
        }
    }, [code, redirectUrl]);

    return (
        <div className="h-dvh flex justify-center items-center">
            <div className="flex flex-col gap-4 items-center bg-gray-100 rounded-lg mx-4 p-8 lg:p-16 lg:mx-0 text-center animate-fade-in">
                <img src={LogoIcon} alt="Brev" className="w-12 h-12 animate-pulse" />
                
                <p className="typography-xl text-gray-600">Redirecionando...</p>
                <span className="typography-md text-gray-500">O link será aberto automaticamente em alguns instantes.</span>
                
                <span className="typography-md text-gray-500">
                    Não foi redirecionado?{" "}
                    <a 
                        href={redirectUrl} 
                        className="typography-md text-brand-blue hover:underline cursor-pointer"
                    >
                        Acesse aqui
                    </a>
                </span>
            </div>
        </div>
    )
}