import { describe, it, expect } from 'vitest'
import { Product, ProductCategory } from '../../../model/entities/Product'
import { createMockProduct } from '../../mocks/factories'

describe('Unitário: Entidade Produto', () => {
  it('deve criar produto com todas as propriedades', () => {
    const product = createMockProduct()

    expect(product).toBeDefined()
    expect(product.id).toBeDefined()
    expect(product.accessCode).toBeDefined()
    expect(product.name).toBeDefined()
    expect(product.price).toBeDefined()
    expect(product.category).toBeDefined()
    expect(product.createdAt).toBeDefined()
  })

  it('deve possuir propriedades obrigatórias corretas', () => {
    const product = createMockProduct()

    expect(product.id).toBe('prod-123')
    expect(product.accessCode).toBe('123456789')
    expect(product.name).toBe('Pizza Margherita')
    expect(product.price).toBe(45.99)
    expect(product.category).toBe('Pizzas')
    expect(product.createdAt).toBeGreaterThan(0)
  })

  it('deve aceitar categorias de produto válidas', () => {
    const categories: ProductCategory[] = ['Bebidas', 'Pizzas', 'Pratos', 'Petiscos', 'Sobremesas']

    categories.forEach((category) => {
      const product = createMockProduct({ category })
      expect(product.category).toBe(category)
    })
  })

  it('deve possuir propriedades opcionais: description, imageUrl, updatedAt', () => {
    const product = createMockProduct({
      description: 'Custom description',
      imageUrl: 'https://example.com/image.jpg',
      updatedAt: Date.now(),
    })

    expect(product.description).toBe('Custom description')
    expect(product.imageUrl).toBe('https://example.com/image.jpg')
    expect(product.updatedAt).toBeDefined()
  })

  it('deve criar produto com propriedades mínimas', () => {
    const minimalProduct: Product = {
      id: 'prod-001',
      accessCode: 'ABC123',
      name: 'Refrigerante',
      price: 5.0,
      category: 'Bebidas',
      createdAt: Date.now(),
    }

    expect(minimalProduct.id).toBe('prod-001')
    expect(minimalProduct.name).toBe('Refrigerante')
    expect(minimalProduct.description).toBeUndefined()
    expect(minimalProduct.imageUrl).toBeUndefined()
    expect(minimalProduct.updatedAt).toBeUndefined()
  })

  it('deve tratar preço como número decimal', () => {
    const product = createMockProduct({ price: 99.99 })

    expect(product.price).toBe(99.99)
    expect(typeof product.price).toBe('number')
  })

  it('deve atualizar propriedades do produto', () => {
    const originalProduct = createMockProduct()
    const updatedProduct: Product = {
      ...originalProduct,
      name: 'Updated Product Name',
      price: 55.99,
      updatedAt: Date.now(),
    }

    expect(updatedProduct.name).toBe('Updated Product Name')
    expect(updatedProduct.price).toBe(55.99)
    expect(updatedProduct.updatedAt).toBeGreaterThanOrEqual(originalProduct.createdAt)
    expect(updatedProduct.id).toBe(originalProduct.id)
  })

  it('deve criar produto com sobrescritas parciais', () => {
    const product = createMockProduct({
      name: 'Coca Cola',
      category: 'Bebidas',
      price: 8.5,
    })

    expect(product.name).toBe('Coca Cola')
    expect(product.category).toBe('Bebidas')
    expect(product.price).toBe(8.5)
    expect(product.id).toBe('prod-123')
  })

  it('deve preservar consistência de accessCode', () => {
    const product = createMockProduct({ accessCode: 'CODE123' })

    expect(product.accessCode).toBe('CODE123')
    expect(product.accessCode.length).toBeGreaterThan(0)
  })
})
