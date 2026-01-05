import { Product, ProductCategory } from '../entities/Product';

//Contrato de Serviço para Produtos
//Definição do contrato de serviço para operações relacionadas a produtos, como listar, criar, atualizar e excluir produtos.
export interface ProductService {
  //Método para listar produtos por código de acesso
  listByAccessCode(accessCode: string, query?: string, category?: ProductCategory): Promise<Product[]>;

  //Método para criar um novo produto
  create(accessCode: string, input: Omit<Product, 'id' | 'accessCode' | 'createdAt' | 'updatedAt'>): Promise<Product>;

  //Método para atualizar um produto existente
  update(id: string, changes: Partial<Omit<Product, 'id' | 'accessCode' | 'createdAt'>>): Promise<Product>;

  //Método para excluir um produto existente
  delete(id: string): Promise<void>;
}
