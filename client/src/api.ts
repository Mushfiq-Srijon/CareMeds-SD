import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { secrets } from './secrets';
import toast from 'react-hot-toast';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: secrets.backendEndpoint,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private getAuthConfig() {
    //  6: check both localStorage and sessionStorage
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (!token) return {};
    return {
      headers: { Authorization: `Bearer ${token}` },
    };
  }

  async get(endpoint: string, config?: AxiosRequestConfig) {
    try {
      const res = await this.client.get(endpoint, { ...config, ...this.getAuthConfig() });
      return res.data;
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  async post(endpoint: string, data: any, config?: AxiosRequestConfig) {
    try {
      const res = await this.client.post(endpoint, data, { ...config, ...this.getAuthConfig() });
      return res.data;
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  async put(endpoint: string, data: any, config?: AxiosRequestConfig) {
    try {
      const res = await this.client.put(endpoint, data, { ...config, ...this.getAuthConfig() });
      return res.data;
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  async delete(endpoint: string, config?: AxiosRequestConfig) {
    try {
      const res = await this.client.delete(endpoint, { ...config, ...this.getAuthConfig() });
      return res.data;
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  // Medicines
  async getMedicines() {
    return this.get('/api/medicines');
  }

  // 5: Get single medicine with pharmacy info
  async getMedicineById(id: number) {
    return this.get(`/api/medicines/${id}`);
  }

  // Cart
  async addToCart(medicineId: number, quantity: number = 1) {
    return this.post('/api/cart/add', { medicine_id: medicineId, quantity });
  }

  async getCart() {
    return this.get('/api/cart/list');
  }

  async updateCart(cartId: number, quantity: number) {
    return this.client.put(
      '/api/cart/update',
      { cart_id: cartId, quantity },
      this.getAuthConfig()
    );
  }

  async removeCartItem(cartId: number) {
    return this.client.delete(
      `/api/cart/remove/${cartId}`,
      this.getAuthConfig()
    );
  }

  async clearCart() {
    return this.delete('/api/cart/clear');
  }

  async forgotPassword(email: string) {
    return this.post('/api/forgot-password', { email });
  }

  async resetPassword(email: string, token: string, password: string) {
    return this.post('/api/reset-password', { email, token, password });
  }

  // 3: My Orders
  async getMyOrders() {
    return this.get('/api/my-orders');
  }

  //  2: Pharmacy
  async getPharmacyProfile() {
    return this.get('/api/pharmacy/profile');
  }

  async setupPharmacy(data: object) {
    return this.post('/api/pharmacy/setup', data);
  }

  async getPharmacyMedicines() {
    return this.get('/api/pharmacy/medicines');
  }

  async addMedicine(data: object) {
    return this.post('/api/medicines', data);
  }

  async updateMedicine(id: number, data: object) {
    return this.put(`/api/medicines/${id}`, data);
  }

  async deleteMedicine(id: number) {
    return this.delete(`/api/medicines/${id}`);
  }

  //  4: Pharmacy incoming orders
  async getPharmacyOrders() {
    return this.get('/api/pharmacy/orders');
  }

  handleError(error: any) {
    if (error.response) {
      console.error(`API Error: ${error.response.status}`, error.response.data);
    } else if (error.request) {
      console.error('API Error: No response received');
    } else {
      console.error('API Error:', error.message);
    }
    toast.error(error.message || 'Something went wrong');
  }
}

export default ApiClient;