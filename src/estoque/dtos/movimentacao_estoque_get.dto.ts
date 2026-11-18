export interface MovimentacoesEstoqueGetDTO {
    id: string;
    codigoProduto: number;
    descricaoProduto: string;
    tipo: 'ENTRADA' | 'SAIDA';
    descricao: string;
    quantidade: number;
    data: Date;
}