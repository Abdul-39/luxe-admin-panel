export interface CartItem {
  productId: number;
  productName: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  stockQuantity: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryCharges: number;
  discount: number;
  total: number;
  couponCode?: string;
}
