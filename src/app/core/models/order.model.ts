export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'OutForDelivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned'
  | 'Refunded';

export type PaymentMethod = 'CashOnDelivery' | 'JazzCash' | 'Easypaisa' | 'Stripe' | 'PayPal' | 'BankTransfer';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId?: number | null;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  area?: string;
  postalCode?: string;
  deliveryInstructions?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharges: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  orderDate: string;
  cancellationDeadline: string;
  canCancel: boolean;
  estimatedDelivery?: string;
}

export interface CreateOrderRequest {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  area?: string;
  postalCode?: string;
  deliveryInstructions?: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  items: { productId: number; quantity: number }[];
}
