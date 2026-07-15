export const PAYMENTS_REPOSITORY = Symbol('PAYMENTS_REPOSITORY');

export interface PaymentsRepository {
  count(): Promise<number>;
}
