export type ProductCategory = 'Bebidas' | 'Pizzas' | 'Pratos' | 'Petiscos' | 'Sobremesas'

export type Product = {
  id: string
  accessCode: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  category: ProductCategory
  createdAt: number
  updatedAt?: number
}
