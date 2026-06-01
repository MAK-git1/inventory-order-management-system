import apiClient from './api-client';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export interface CustomerCreate {
  name: string;
  email: string;
  phone?: string | null;
}

export interface CustomerUpdate {
  name?: string;
  email?: string;
  phone?: string | null;
}

export const customersService = {
  /** Fetch all customers from database */
  getAll: async (): Promise<Customer[]> => {
    const response = await apiClient.get<Customer[]>('/customers/');
    return response.data;
  },
  
  /** Fetch a single customer by ID */
  getById: async (id: number): Promise<Customer> => {
    const response = await apiClient.get<Customer>(`/customers/${id}`);
    return response.data;
  },
  
  /** Register a new customer */
  create: async (data: CustomerCreate): Promise<Customer> => {
    const response = await apiClient.post<Customer>('/customers/', data);
    return response.data;
  },
  
  /** Update details of an existing customer */
  update: async (id: number, data: CustomerUpdate): Promise<Customer> => {
    const response = await apiClient.put<Customer>(`/customers/${id}`, data);
    return response.data;
  },
  
  /** Delete a customer profile from registry */
  delete: async (id: number): Promise<Customer> => {
    const response = await apiClient.delete<Customer>(`/customers/${id}`);
    return response.data;
  }
};
