//Contrato de Erro genérico para a aplicaço

//Classe de erro genérica para a aplicação
//Usada para erros genéricos da aplicação, como erros de validação, erros de banco de dados, etc.

export class AppError extends Error {
  constructor(public message: string, public code?: string) {
    super(message);
    this.name = 'AppError';
  }
}

//Classe de erro genérica para autenticação
//Usada para erros de autenticação, como erros de login, erros de registro, etc.
export class AuthError extends AppError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'AuthError';
  }
}
