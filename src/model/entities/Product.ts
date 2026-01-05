//Definindo tipos de Categorias de Produtos
export type ProductCategory = 'Bebidas' | 'Pizzas' | 'Pratos' | 'Petiscos' | 'Sobremesas';

//Contrato de Produto
export type Product = {
  id: string;
  accessCode: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: ProductCategory;
  createdAt: number;
  updatedAt?: number;
}
