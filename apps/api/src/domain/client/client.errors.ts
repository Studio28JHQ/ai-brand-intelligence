export class ClientNotFoundError extends Error {
  constructor(id: string) {
    super(`Client not found: ${id}`);
    this.name = 'ClientNotFoundError';
  }
}

export class ClientAlreadyExistsError extends Error {
  constructor(primaryDomain: string) {
    super(`Client already exists for primary domain: ${primaryDomain}`);
    this.name = 'ClientAlreadyExistsError';
  }
}
