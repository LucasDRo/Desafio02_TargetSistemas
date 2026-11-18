import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MovimentacoesEstoquePostDTO } from './dtos/movimentacao_estoque_post.dto';
import { MovimentacoesEstoqueGetDTO } from './dtos/movimentacao_estoque_get.dto';

@Injectable()
export class EstoqueService {

    private estoque = [
        {
            codigoProduto: 101,
            descricaoProduto: 'Caneta Azul',
            estoque: 150
        },
        {
            codigoProduto: 102,
            descricaoProduto: 'Caderno Universitário',
            estoque: 75
        },
        {
            codigoProduto: 103,
            descricaoProduto: 'Borracha Branca',
            estoque: 200
        },
        {
            codigoProduto: 104,
            descricaoProduto: 'Lápis Preto HB',
            estoque: 320
        },
        {
            codigoProduto: 105,
            descricaoProduto: 'Marcador de Texto Amarelo',
            estoque: 90
        }
    ];

    private movimentacoes: MovimentacoesEstoqueGetDTO[] = [];

    novaMovimentacao(data: MovimentacoesEstoquePostDTO) {
        const produto = this.estoque.find(p => p.codigoProduto == data.codigoProduto)

        if (!produto) {
            throw new NotFoundException("Produto não encontrado")
        }

        if (data.quantidade <= 0) {
            throw new BadRequestException("Quantidade informada inválida")
        }

        if (!data.descricao?.trim()) {
            throw new BadRequestException('Descrição obrigatória');
        }

        if (data.tipo === 'SAIDA' && produto.estoque < data.quantidade) {
            throw new BadRequestException('Estoque insuficiente');
        }

        if (data.tipo === 'ENTRADA') {
            produto.estoque += data.quantidade;
        } else if (data.tipo === 'SAIDA') {
            produto.estoque -= data.quantidade;
        } else {
            throw new BadRequestException('Tipo de movimentação inválido');
        }

        const movimentacao = {
            id: crypto.randomUUID(),
            codigoProduto: produto.codigoProduto,
            descricaoProduto: produto.descricaoProduto,
            tipo: data.tipo,
            descricao: data.descricao,
            quantidade: data.quantidade,
            data: new Date()
        }

        this.movimentacoes.push(movimentacao);

        return {
            movimentacao,
            estoqueAtual: produto.estoque
        };
    }

    listarMovimentacoes(){
        return this.movimentacoes;
    }
}
