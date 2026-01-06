export class AppError extends Error {
  constructor(public message: string, public code?: string) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthError extends AppError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'AuthError';
  }
}
