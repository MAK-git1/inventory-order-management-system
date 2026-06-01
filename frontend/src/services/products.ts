import apiClient from './api-client';

export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  created_at: string;
}

export interface ProductCreate {
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
}

export interface ProductUpdate {
  name?: string;
  sku?: string;
  price?: number;
  stock_quantity?: number;
}

export const productsService = {
  /** Fetch all products from catalog */
  getAll: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/products/');
    return response.data;
  },
  
  /** Fetch a single product by ID */
  getById: async (id: number): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },
  
  /** Register a new product */
  create: async (data: ProductCreate): Promise<Product> => {
    const response = await apiClient.post<Product>('/products/', data);
    return response.data;
  },
  
  /** Update an existing product's fields */
  update: async (id: number, data: ProductUpdate): Promise<Product> => {
    const response = await apiClient.put<Product>(`/products/${id}`, data);
    return response.data;
  },
  
  /** Delete a product from catalog */
  delete: async (id: number): Promise<Product> => {
    const response = await apiClient.delete<Product>(`/products/${id}`);
    return response.data;
  }
};
