export interface Review {
  id: number;
  productId: number;
  customerId: number;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateReviewRequest {
  productId: number;
  rating: number;
  comment: string;
}
