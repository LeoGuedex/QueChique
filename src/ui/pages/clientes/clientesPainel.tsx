import { cn } from "@/ui/components/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/ui/components/ui/button";
import { Dialog, DialogTrigger } from "@/ui/components/ui/dialog";
import { Input } from "@/ui/components/ui/input";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createRoute } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { useRef, useState } from "react";
import { buscarClientes, removerClienteApi } from "../../api/clientesApi";
import { DataTable } from "../../components/ui/data-table";
import { escutarCliqueTeclado } from "../../hooks/escutarCliqueTeclado";
import { painelRoute } from "../../routes";
import {
  DialogAtualizarCliente,
  DialogCadastrarCliente,
} from "./clienteDialog";
import { pegarColunasCliente } from "./clientesColunas";

export const clientesRoute = createRoute({
  getParentRoute: () => painelRoute,
  path: "/clientes",
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(buscarClientes),
  component: ClientesComponent,
});

function ClientesComponent() {
  const refBotaoCadastro = useRef<HTMLButtonElement>();
  const refBotaoAtuailacao = useRef<HTMLButtonElement>();

  const [searchValue, setSearchValue] = useState("");
  const [idParaExcluir, setIdParaExcluir] = useState<number>(null);
  const [idParaEditar, setIdParaEditar] = useState<number>(null);
  const [dialogAberto, setDialogAberto] = useState(false);

  const { data: clientes } = useSuspenseQuery(buscarClientes);
  const queryClient = useQueryClient();
  const removerClienteMutation = useMutation({
    mutationFn: removerClienteApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      setIdParaExcluir(null);
    },
  });

  const abrirEdicaoCliente = (clienteId: number) => {
    setIdParaEditar(clienteId);
    refBotaoAtuailacao.current.click();
  };

  useSuspenseQuery(buscarClientes)

  const colunasCliente = pegarColunasCliente({
    setIdParaExcluir,
    abrirEdicaoCliente,
  });

  escutarCliqueTeclado(() => {
    refBotaoCadastro.current.click();
  }, ["F1"]);

  return (
    <main className="flex flex-1 flex-col p-4 md:p-6 max-w-[96rem] mx-auto">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl h-10">Clientes</h1>
      </div>
      <div className="flex items-center justify-between py-3 gap-2">
        <Input
          placeholder="Pesquisar clientes..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="max-w-lg"
        />
        <Dialog onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button ref={refBotaoCadastro} className="ml-auto h-10">
              <UserPlus className="mr-2" />
              Adicionar novo (F1)
            </Button>
          </DialogTrigger>
          <DialogCadastrarCliente isOpen={dialogAberto} />
        </Dialog>
      </div>
      <DataTable
        columns={colunasCliente}
        dados={clientes}
        colunaParaFiltrar="nome"
        filtro={searchValue}
      />

      <AlertDialog open={idParaExcluir !== null}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>O cliente será apagado</AlertDialogTitle>
            <AlertDialogDescription>
              Se essa ação for realizada, não será possível recuperar os dados
              do cliente, deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setIdParaExcluir(null)}
              className="destructive"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants({ variant: "destructive" }))}
              onClick={() => removerClienteMutation.mutate(idParaExcluir)}
            >
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog>
        <DialogTrigger ref={refBotaoAtuailacao} />
        <DialogAtualizarCliente clienteId={idParaEditar} />
      </Dialog>
    </main>
  );
}