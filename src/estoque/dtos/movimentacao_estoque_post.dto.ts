export class MovimentacoesEstoquePostDTO {
    codigoProduto: number;
    tipo: 'ENTRADA' | 'SAIDA';
    descricao: string;
    quantidade: number;
}