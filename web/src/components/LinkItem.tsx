import { Copy, Trash, Info} from "@phosphor-icons/react";
import { toast } from "sonner";

interface LinkItemProps {
  code: string;
  originalUrl: string;
  clicks: number;
  onDelete: () => void; 
}

export function LinkItem({ code, originalUrl, clicks, onDelete }: LinkItemProps) {

  function handleCopy() {
    const fullUrl = `${window.location.origin}/${code}`;
    navigator.clipboard.writeText(fullUrl);
    
    toast.message(
      <div className="flex flex-col text-blue-500 gap-1">
        <span className="font-bold ">Link copiado com sucesso</span>
        <span className="text-sm">
          O link <span className="font-semibold text-blue-500">{originalUrl}</span> foi copiado para a área de transferência.
        </span>
      </div>,
      {
        className: "!bg-blue-50 !border-blue-200",
        icon: <Info size={24} weight="fill" className="text-blue-500" />,
      }
    );
  }

  return (
    <div className="flex  sm:flex-row items-center  sm:items-center 
    justify-between p-4 bg-white border-b border-gray-200 last:border-0 hover:bg-gray-50 
    transition-colors gap-4 animate-fade-in">

      <div className="flex flex-col gap-1 overflow-hidden flex-1 min-w-0 sm:w-auto">
        <a
          href={`/${code}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-blue font-semibold typography-md hover:underline truncate"
        >
          brev.ly/{code}
        </a>
        <span className="text-gray-400 typography-sm truncate max-w-[300px]">
          {originalUrl}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-6  sm:w-auto  sm:justify-end">
        <span className="text-gray-600 typography-sm font-medium whitespace-nowrap">
          {clicks} acessos
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="p-2 bg-gray-100 rounded-lg text-gray-500 hover:text-brand-blue hover:bg-gray-200 transition-colors"
            title="Copiar link"
          >
            <Copy size={18} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="p-2 bg-gray-100 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Deletar link"
          >
            <Trash size={18} />
          </button>
        </div>
      </div>

    </div>
  )
}