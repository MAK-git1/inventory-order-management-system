import apiClient from './api-client';

export interface OrderItemCreate {
  product_id: number;
  quantity: number;
}

export interface OrderCreate {
  customer_id: number;
  items: OrderItemCreate[];
}

export interface OrderItemResponse {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: {
    id: number;
    name: string;
    sku: string;
    price: number;
  };
}

export interface OrderResponse {
  id: number;
  customer_id: number;
  total_amount: number;
  created_at: string;
  items: OrderItemResponse[];
}

export const ordersService = {
  /** Fetch all placed orders from system history */
  getAll: async (): Promise<OrderResponse[]> => {
    const response = await apiClient.get<OrderResponse[]>('/orders/');
    return response.data;
  },
  
  /** Fetch details of a single order by ID */
  getById: async (id: number): Promise<OrderResponse> => {
    const response = await apiClient.get<OrderResponse>(`/orders/${id}`);
    return response.data;
  },
  
  /** Place a new order transaction */
  create: async (data: OrderCreate): Promise<OrderResponse> => {
    const response = await apiClient.post<OrderResponse>('/orders/', data);
    return response.data;
  }
};
