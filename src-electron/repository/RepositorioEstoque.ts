import db from '../config/bancoDeDados'
import { Estoque } from '../models/Estoque'
import { Cor } from '../models/enums/Cor'
import { Tecido } from '../models/enums/Tecido'

export type EstoqueDb = {
  id: number
  nome: string
  descricao: string
  cor: string
  tamanho: string
  tecido: string
  fornecedor: string
  quantidade: number
  valor_compra: number
  valor_venda: number
  venda_id?: number
}

export const estoqueParaModelDb = (estoque: Estoque, vendaId: number = null): EstoqueDb => ({
  id: estoque.id,
  nome: estoque.nome,
  descricao: estoque.descricao,
  cor: estoque.cor,
  tamanho: estoque.tamanho,
  tecido: estoque.tecido,
  fornecedor: estoque.fornecedor,
  quantidade: estoque.quantidade,
  valor_compra: estoque.valorCompra,
  valor_venda: estoque.valorVenda,
  venda_id: vendaId,
})

export const modelDbParaEstoque = (estoqueDb: EstoqueDb): Estoque => ({
  id: estoqueDb.id,
  nome: estoqueDb.nome,
  descricao: estoqueDb.descricao,
  cor: estoqueDb.cor as Cor,
  tamanho: estoqueDb.tamanho,
  vendido: estoqueDb.venda_id !== null,
  tecido: estoqueDb.tecido as Tecido,
  fornecedor: estoqueDb.fornecedor,
  quantidade: estoqueDb.quantidade,
  valorCompra: estoqueDb.valor_compra,
  valorVenda: estoqueDb.valor_venda,
})

export const criarEstoque = (estoque: Estoque) => {
  const estoqueDb = estoqueParaModelDb(estoque)
  const insertQuery = `
    INSERT INTO estoques (nome, descricao, cor, tamanho, tecido, fornecedor, quantidade, valor_compra, valor_venda)
    VALUES (@nome, @descricao, @cor, @tamanho, @tecido, @fornecedor, @quantidade, @valor_compra, @valor_venda)
  `

  return db.prepare(insertQuery).run(estoqueDb)
}

export const buscarEstoquePorId = (estoqueId: number): Estoque => {
  const selectQuery = `
    SELECT * FROM estoques WHERE id = ?
  `

  const stmt = db.prepare(selectQuery)
  const estoqueDb = stmt.get(estoqueId) as EstoqueDb

  return modelDbParaEstoque(estoqueDb)
}

export const buscarTodosEstoques = () => {
  const selectAllQuery = `
    SELECT * FROM estoques
  `

  const estoquesDb = db.prepare(selectAllQuery).all() as EstoqueDb[]
  return estoquesDb.map((estoqueDb) => modelDbParaEstoque(estoqueDb))
}

export const buscarEstoquesNaoVendidos = () => {
  const selectAllQuery = `
    SELECT * FROM estoques e WHERE e.venda_id IS NULL
  `

  const estoquesDb = db.prepare(selectAllQuery).all() as EstoqueDb[]
  return estoquesDb.map((estoqueDb) => modelDbParaEstoque(estoqueDb))
}

export const editarEstoque = (estoque: Estoque) => {
  const estoqueDb = estoqueParaModelDb(estoque)
  const updateQuery = `
    UPDATE estoques
    SET nome = @nome, descricao = @descricao, cor = @cor, tamanho = @tamanho,
      tecido = @tecido, fornecedor = @fornecedor, quantidade = @quantidade,
      valor_compra = @valor_compra, valor_venda = @valor_venda
    WHERE id = @id
  `

  return db.prepare(updateQuery).run(estoqueDb)
}

export const removerEstoque = (id: number) => {
  const deleteQuery = `
    DELETE FROM estoques WHERE id = ?
  `

  return db.prepare(deleteQuery).run(id)
}

export const inserirIdVenda = (estoqueId: number, vendaId: number) => {
  const estoque = buscarEstoquePorId(estoqueId)
  const estoqueDb = estoqueParaModelDb(estoque, vendaId)
  const updateQuery = `
    UPDATE estoques
    SET venda_id = @venda_id
    WHERE id = @id
  `

  return db.prepare(updateQuery).run(estoqueDb)
}

export const removerIdVenda = (vendaId: number) => {
  const updateQuery = `
    UPDATE estoques
    SET venda_id = NULL
    WHERE venda_id = ?
  `

  return db.prepare(updateQuery).run(vendaId)
}

export const buscarEstoquesPorData = (dataInicio: string, dataFim: string) => {
  const selectQuery = `
    SELECT * FROM estoques
  `
  // WHERE data BETWEEN ? AND ?
  const stmt = db.prepare(selectQuery)
  const estoquesDb = stmt.all() //(dataInicio, dataFim) as EstoqueDb[]

  return estoquesDb.map((estoqueDb: EstoqueDb) => modelDbParaEstoque(estoqueDb))
}
