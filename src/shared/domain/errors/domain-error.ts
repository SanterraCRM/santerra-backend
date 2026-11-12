export class DomainError extends Error {
  // Sem código, a API responde VALIDATION_ERROR.
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
