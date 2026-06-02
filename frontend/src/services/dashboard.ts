import apiClient from './api-client';
import { Product } from './products';
import { OrderResponse } from './orders';

export interface AdminDashboardData {
  total_products: number;
  total_customers: number;
  total_orders: number;
  total_revenue: number;
  low_stock_products: Product[];
  recent_orders: OrderResponse[];
}

export interface CustomerDashboardData {
  customer_name: string;
  total_orders: number;
  recent_orders: OrderResponse[];
  recent_products: Product[];
}

export const dashboardService = {
  /** Fetch Admin Dashboard aggregates */
  getAdminMetrics: async (): Promise<AdminDashboardData> => {
    const response = await apiClient.get<AdminDashboardData>('/dashboard/admin');
    return response.data;
  },

  /** Fetch Customer Dashboard aggregates */
  getCustomerMetrics: async (): Promise<CustomerDashboardData> => {
    const response = await apiClient.get<CustomerDashboardData>('/dashboard/customer');
    return response.data;
  },
};
