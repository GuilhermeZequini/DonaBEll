/** Resposta paginada do Laravel (paginate()). */
export interface Paginado<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}
