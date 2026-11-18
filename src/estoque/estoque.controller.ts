import { Body, Controller, Get, Post } from '@nestjs/common';
import { EstoqueService } from './estoque.service';
import { MovimentacoesEstoquePostDTO } from './dtos/movimentacao_estoque_post.dto';

@Controller('estoque')
export class EstoqueController {
    constructor(private readonly estoqueService: EstoqueService) { }

    @Post('/movimentacao')
    novaMovimentacao(@Body() requisicao: MovimentacoesEstoquePostDTO) {
        return this.estoqueService.novaMovimentacao(requisicao);
    }

    @Get("/movimentacao")
    movimentacoes() {
        return this.estoqueService.listarMovimentacoes();
    }

}
