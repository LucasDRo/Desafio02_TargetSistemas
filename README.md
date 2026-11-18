# Desafio técnico — API de movimentação de estoque

API desenvolvida em **TypeScript com NestJS** como solução para um desafio técnico de processo seletivo. A aplicação registra entradas e saídas de produtos, atualiza o saldo de estoque e permite consultar o histórico de movimentações.

## Nomenclaturas em português

**As nomenclaturas em português foram adotadas porque o enunciado do desafio forneceu um exemplo de JSON com os campos em português.** Essa referência foi mantida nos contratos da API e estendida às nomenclaturas do domínio no código, preservando a consistência entre o exemplo apresentado e a implementação.

Por isso, a aplicação utiliza nomes como `codigoProduto`, `descricaoProduto`, `quantidade` e `estoqueAtual`, além dos tipos de movimentação `ENTRADA` e `SAIDA`.

## Funcionalidades

- Registrar entradas e saídas de produtos previamente cadastrados.
- Atualizar o estoque após cada movimentação válida.
- Retornar a movimentação registrada e o saldo atualizado do produto.
- Consultar o histórico de movimentações na ordem de registro.
- Rejeitar produtos inexistentes, quantidades menores ou iguais a zero, descrições vazias, tipos inválidos e saídas acima do saldo disponível.

## Tecnologias

- Node.js
- TypeScript 6
- NestJS 12 com Express
- npm para gerenciamento de dependências
- Jest e Supertest disponíveis para testes

## Regras de negócio

- `ENTRADA` soma a quantidade informada ao estoque do produto.
- `SAIDA` subtrai a quantidade informada do estoque do produto.
- Uma saída não pode exceder o saldo disponível.
- A quantidade informada deve ser maior que zero.
- A descrição é obrigatória e não pode conter apenas espaços.
- O tipo deve ser exatamente `ENTRADA` ou `SAIDA`, em letras maiúsculas e sem acento.
- Cada movimentação recebe um identificador UUID e a data e hora de seu registro.

Os produtos e as movimentações são mantidos **em memória**. Ao reiniciar a aplicação, o histórico é apagado e os saldos retornam aos valores iniciais.

### Estoque inicial

| Código | Produto | Quantidade |
| --- | --- | --- |
| 101 | Caneta Azul | 150 |
| 102 | Caderno Universitário | 75 |
| 103 | Borracha Branca | 200 |
| 104 | Lápis Preto HB | 320 |
| 105 | Marcador de Texto Amarelo | 90 |

## Como executar

### Pré-requisitos

- Node.js 22 ou superior.
- npm instalado.

No diretório `desafio2`, que contém o arquivo `package.json`, instale as dependências:

```bash
npm ci
```

### Desenvolvimento

```bash
npm run dev
```

A API fica disponível em `http://localhost:3000`. Esse comando recompila a aplicação automaticamente quando os arquivos são alterados.

Para iniciar sem monitorar alterações:

```bash
npm start
```

### Build e execução do código compilado

```bash
npm run build
npm run start:prod
```

A porta padrão é `3000` e pode ser alterada pela variável de ambiente `PORT`. Não é necessário configurar banco de dados ou arquivo `.env`.

Exemplo no PowerShell:

```powershell
$env:PORT = '3001'
npm run dev
```

## Uso da API

### Registrar uma movimentação

```http
POST /estoque/movimentacao
Content-Type: application/json
```

**Corpo da requisição:**

```json
{
  "codigoProduto": 101,
  "tipo": "ENTRADA",
  "descricao": "Reposição de mercadoria",
  "quantidade": 50
}
```

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `codigoProduto` | Number | Código de um dos produtos do estoque inicial. |
| `tipo` | String | Tipo da movimentação: `ENTRADA` ou `SAIDA`. |
| `descricao` | String | Descrição da movimentação, preenchida com texto. |
| `quantidade` | Number | Quantidade a adicionar ou retirar, maior que zero. |

**Exemplo de resposta — HTTP `201 Created`:**

```json
{
  "movimentacao": {
    "id": "e46f56ae-345c-45c8-b971-6b52a05bef6e",
    "codigoProduto": 101,
    "descricaoProduto": "Caneta Azul",
    "tipo": "ENTRADA",
    "descricao": "Reposição de mercadoria",
    "quantidade": 50,
    "data": "2026-11-18T18:00:00.000Z"
  },
  "estoqueAtual": 200
}
```

O saldo de `200` considera o estoque inicial de `150` unidades e a entrada de `50`. O identificador e a data são ilustrativos; esses valores são gerados a cada registro. A data é serializada como uma string no formato ISO 8601 em UTC.

Para registrar uma saída, utilize o mesmo endpoint com `"tipo": "SAIDA"` e uma quantidade que não exceda o saldo disponível.

### Consultar as movimentações

```http
GET /estoque/movimentacao
```

**Exemplo de resposta — HTTP `200 OK`:**

```json
[
  {
    "id": "e46f56ae-345c-45c8-b971-6b52a05bef6e",
    "codigoProduto": 101,
    "descricaoProduto": "Caneta Azul",
    "tipo": "ENTRADA",
    "descricao": "Reposição de mercadoria",
    "quantidade": 50,
    "data": "2026-11-18T18:00:00.000Z"
  }
]
```

Antes do primeiro registro, a resposta é `[]`. A consulta retorna todas as movimentações, sem filtros ou paginação.

### Exemplo no PowerShell

Com a aplicação em execução, abra outro terminal para registrar uma entrada e consultar o histórico:

```powershell
$body = @{
  codigoProduto = 101
  tipo = 'ENTRADA'
  descricao = 'Reposicao de mercadoria'
  quantidade = 50
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri 'http://localhost:3000/estoque/movimentacao' `
  -Method Post `
  -ContentType 'application/json' `
  -Body $body

Invoke-RestMethod `
  -Uri 'http://localhost:3000/estoque/movimentacao' `
  -Method Get
```

## Respostas de erro

| Situação | HTTP | Mensagem |
| --- | --- | --- |
| Produto não encontrado | `404` | `Produto não encontrado` |
| Quantidade menor ou igual a zero | `400` | `Quantidade informada inválida` |
| Descrição ausente, vazia ou apenas com espaços | `400` | `Descrição obrigatória` |
| Saída maior que o estoque disponível | `400` | `Estoque insuficiente` |
| Tipo diferente de `ENTRADA` ou `SAIDA` | `400` | `Tipo de movimentação inválido` |

Por exemplo, uma saída de `151` unidades do produto `101`, ainda com seu saldo inicial de `150`, retorna HTTP `400 Bad Request`:

```json
{
  "message": "Estoque insuficiente",
  "error": "Bad Request",
  "statusCode": 400
}
```

As verificações são executadas na seguinte ordem: existência do produto, quantidade, descrição, saldo para saída e tipo da movimentação. Quando mais de uma condição é inválida, a resposta corresponde à primeira verificação que falhar.

## Organização do projeto

```text
src/
├── main.ts                                  # Inicialização do servidor e definição da porta
├── app.module.ts                            # Módulo principal
└── estoque/
    ├── estoque.module.ts                    # Registro do controller e do service
    ├── estoque.controller.ts                # Endpoints de registro e consulta
    ├── estoque.service.ts                   # Regras de estoque e histórico em memória
    ├── produto.entity.ts                    # Interface de um produto
    └── dtos/
        ├── movimentacao_estoque_post.dto.ts  # Contrato de entrada
        └── movimentacao_estoque_get.dto.ts   # Contrato das movimentações registradas
```

O controller recebe as requisições e delega o processamento ao service, que localiza o produto, aplica as regras, atualiza o saldo e armazena a movimentação.

## Verificação e escopo atual

Para verificar a compilação e executar a análise estática:

```bash
npm run build
npm run lint
```

O projeto disponibiliza os scripts `npm test`, `npm run test:e2e` e `npm run test:cov`. O teste e2e existente ainda é o exemplo inicial do NestJS: espera `Hello World!` em `GET /`, rota que a aplicação não implementa. Portanto, esse teste precisa ser adaptado ao domínio de estoque. Não há testes específicos das regras de movimentação implementados.

A validação atual ocorre no service e não inclui uma validação completa dos tipos em tempo de execução. Os exemplos pressupõem campos numéricos enviados como números e descrição enviada como texto. Também não há restrição para quantidades fracionárias.

A API possui somente os dois endpoints documentados. O cadastro e a consulta direta de produtos e saldos, a persistência em banco de dados e a autenticação não fazem parte da implementação atual.

## Possíveis evoluções

- Adicionar testes para entradas, saídas, saldo insuficiente e demais condições inválidas.
- Validar os tipos e a obrigatoriedade dos campos com DTOs e um pipe de validação.
- Persistir produtos e movimentações em banco de dados.
- Implementar consulta de saldos e filtros para o histórico.
- Documentar o contrato da API com Swagger/OpenAPI.
