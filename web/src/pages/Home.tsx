import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DownloadSimple, Link as LinkIcon, Spinner, WarningCircle } from "@phosphor-icons/react";
import { LinkItem } from "../components/LinkItem";
import { api } from "../lib/api";
import { AxiosError } from "axios";
import { toast } from "sonner";
import Logo from "@/assets/Logo.svg";

// --- SCHEMA ---
const createLinkSchema = z.object({
  originalUrl: z.string().url("Digite uma URL válida (ex: https://...)"),
  code: z
    .string()
    .min(3, "O código deve ter pelo menos 3 caracteres")
    .regex(/^[a-z0-9-_]+$/, "Informe uma url minuscula e sem espaço/caracter especial"),
});

type CreateLinkData = z.infer<typeof createLinkSchema>;

interface LinkData {
  id: number;
  code: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
}

export function Home() {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateLinkData>({
    resolver: zodResolver(createLinkSchema),
  });

  // (GET) Busca link
  const { data: links, isLoading } = useQuery<LinkData[]>({
    queryKey: ['links'],
    queryFn: async () => {
      const response = await api.get('/links');
      return response.data;
    }
  });

  // (POST) Cria link
  const { mutateAsync: createLink } = useMutation({
    mutationFn: async (data: CreateLinkData) => {
      await api.post('/links', {
        code: data.code,
        url: data.originalUrl,
      });
    },
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast.success("Link criado com sucesso!");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message;
        const isDuplicate = error.response?.status === 400 || error.response?.status === 409;

        if (isDuplicate && errorMessage) {
          setError("code", { type: "manual", message: errorMessage });

          toast.error(
            <div className="flex flex-col">
              <span className="font-bold text-base">Erro no cadastro</span>
              <span className="text-sm font-normal">{errorMessage}</span>
            </div>,
            {
              icon: <WarningCircle size={24} weight="fill" className="text-red-500" />,
            }
          );
          return;
        }
      }
      toast.error("Erro ao criar link. Tente novamente.");
    }
  });

  // (DELETE) Deleta link
  const { mutateAsync: deleteLink } = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/links/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast.success("Link removido da lista!");
    },
    onError: () => {
      toast.error("Não foi possível deletar o link.");
    }
  });

  // Baixa CSV
  const { mutateAsync: downloadCSV, isPending: isDownloading } = useMutation({
    mutationFn: async () => {
      const response = await api.get('/metrics');
      return response.data;
    },
    onSuccess: (data) => {
      if (data.fileUrl) {
        window.open(data.fileUrl, '_blank');
        toast.success("Relatório gerado via AWS S3!");
      } else {
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'relatorio-links.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Relatório baixado localmente!");
      }
    },
    onError: () => {
      toast.error("Erro ao gerar relatório. Tente novamente.");
    }
  });

  async function handleSave(data: CreateLinkData) {
    try {
      await createLink(data);
    } catch {
    }
  }

  async function handleDelete(id: number) {
    const confirm = window.confirm("Tem certeza que deseja deletar este link?");
    if (confirm) {
      await deleteLink(id);
    }
  }

  const isEmpty = !links || links.length === 0;

  return (
    <div className="h-screen w-full flex justify-center bg-gray-200 overflow-hidden">
      <div className="flex flex-col gap-5 w-full max-w-5xl px-4 lg:px-0 h-full py-10">
        <div className="w-full flex justify-center lg:justify-start shrink-0">
          <img src={Logo} alt="Brev" className="w-24" />
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-6 flex-1 min-h-0">

          {/* Formulario novo Link -*/}
          <form
            onSubmit={handleSubmit(handleSave)}
            className="flex flex-col p-8 gap-4 bg-white rounded-xl shadow-sm w-full lg:w-5/12 overflow-y-auto max-h-full"
          >
            <p className="typography-lg text-gray-600">Novo link</p>

            <div>
              <label htmlFor="originalUrl" className="block typography-xs text-gray-500 mb-2">
                Link Original
              </label>
              <input
                id="originalUrl"
                type="url"
                placeholder="www.exemplo.com.br"
                className={`w-full h-12 px-4 rounded-lg border bg-gray-100 
                   focus:bg-white focus:ring-1 outline-none transition-all placeholder:text-gray-400 text-gray-600 typography-md-regular
                   ${errors.originalUrl ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-200 focus:border-brand-blue focus:ring-brand-blue"}
                `}
                {...register("originalUrl")}
              />
              {errors.originalUrl && (
                <span className="text-xs text-red-500 mt-1 block">
                  {errors.originalUrl.message}
                </span>
              )}
            </div>

            <div>
              <label htmlFor="code" className="block typography-xs text-gray-500 mb-2">
                Link Encurtado
              </label>

              <div
                className={`flex items-center h-12 px-4 rounded-lg border bg-gray-100 
                              focus-within:bg-white focus-within:ring-1 outline-none transition-all
                              ${errors.code ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-500" : "border-gray-200 focus-within:border-brand-blue focus-within:ring-brand-blue"}
                           `}
              >
                <span className="text-gray-500 mr-1 typography-md-regular select-none">
                  brev.ly/
                </span>
                <input
                  id="code"
                  type="text"
                  placeholder="personalizado"
                  className="flex-1 bg-transparent outline-none text-gray-600 placeholder:text-gray-400 typography-md-regular"
                  {...register("code")}
                />
              </div>
              {errors.code && (
                <span className="text-xs text-red-500 mt-1 block">
                  {errors.code.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-brand-blue hover:bg-brand-dark text-white rounded-lg transition-colors mt-2 typography-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isSubmitting ? "Salvando..." : "Salvar link"}
            </button>
          </form>

          {/* Lista de links */}
          <div className="relative flex flex-col bg-white rounded-xl shadow-sm w-full lg:flex-1 max-h-full min-h-0 overflow-hidden">

            {/* barra animada ao carregar */}
            {isLoading && (
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-100 z-10">
                <div className="h-full w-full bg-brand-blue animate-loading-bar origin-left" />
              </div>
            )}

            <div className="flex justify-between items-center gap-4 px-8 py-6 border-b border-gray-200 shrink-0 bg-white z-0">
              <p className="typography-lg text-gray-600">Meus links</p>

              <button
                type="button"
                onClick={() => downloadCSV()}
                disabled={isDownloading || isEmpty}
                className="h-8 px-4 flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-md typography-sm-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DownloadSimple size={16} />
                {isDownloading ? "Gerando..." : "Baixar CSV"}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 flex flex-col custom-scrollbar">
              {isLoading && (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 ">
                  <Spinner className="size-8 text-gray-400 animate-spin" />
                  <span className="text-gray-500 uppercase text-sm font-medium tracking-wider">
                    Carregando Links...
                  </span>
                </div>
              )}

              {!isLoading && isEmpty && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 ">
                  <div className="bg-gray-100 p-4 rounded-full">
                    <LinkIcon size={32} className="text-gray-400" />
                  </div>
                  <p className="typography-xs text-gray-500 text-center max-w-[200px]">
                    Ainda não existem links cadastrados
                  </p>
                </div>
              )}

              {!isLoading && !isEmpty && (
                <div className="flex flex-col gap-4">
                  {links?.map((link) => (
                    <LinkItem
                      key={link.id}
                      code={link.code}
                      originalUrl={link.originalUrl}
                      clicks={link.clicks}
                      onDelete={() => handleDelete(link.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}