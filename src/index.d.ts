import { apiCaixa, apiCliente, apiConta, apiEstoque, apiVenda } from "./preload";

declare global {
  interface Window {
    apiCaixa: typeof apiCaixa
    apiVenda: typeof apiVenda
    apiConta: typeof apiConta
    apiCliente: typeof apiCliente
    apiEstoque: typeof apiEstoque
  }
}