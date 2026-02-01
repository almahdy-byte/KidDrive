
export interface IError {
  message: string;
  status: number;
  stack?: string;
  cause?: number;
}

export class AppError extends Error implements IError {
  status: number;
  cause?: number;

  constructor(message: string, status: number, cause?: number) {
    super(message);
    this.status = status;
    this.cause = cause ?? status; // Make cause optional and default to status if not provided
    this.stack = new Error().stack ?? "";
  }
}
