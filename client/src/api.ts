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

  // Get auth headers with token
  // Checks both localStorage (normal login) and sessionStorage (remember me)
  private getAuthConfig() {
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

  // ─── Medicines ───────────────────────────────────────────────
  async getMedicines(search = '', page = 1, perPage = 12) {
    return this.get(`/api/medicines?search=${encodeURIComponent(search)}&page=${page}&per_page=${perPage}`);
  }

  // Get single medicine with pharmacy info (Oni)
  async getMedicineById(id: number) {
    return this.get(`/api/medicines/${id}`);
  }

  // ─── Cart ─────────────────────────────────────────────────────
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

  // ─── Auth ─────────────────────────────────────────────────────
  async forgotPassword(email: string) {
    return this.post('/api/forgot-password', { email });
  }

  async resetPassword(email: string, token: string, password: string) {
    return this.post('/api/reset-password', { email, token, password });
  }

  // Change password from profile page (Sabikun)
  async changePassword(currentPassword: string, newPassword: string) {
    return this.post('/api/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    });
  }

  // ─── Orders ───────────────────────────────────────────────────
  // Get logged-in customer's orders (Oni)
  async getMyOrders() {
    return this.get('/api/my-orders');
  }

  // ─── Pharmacy ─────────────────────────────────────────────────
  // Get pharmacy profile (Oni)
  async getPharmacyProfile() {
    return this.get('/api/pharmacy/profile');
  }

  // Setup pharmacy details (Oni)
  async setupPharmacy(data: object) {
    return this.post('/api/pharmacy/setup', data);
  }

  // Get medicines belonging to this pharmacy (Oni)
  async getPharmacyMedicines() {
    return this.get('/api/pharmacy/medicines');
  }

  // Add a new medicine (Oni)
  async addMedicine(data: object) {
    return this.post('/api/medicines', data);
  }

  // Update a medicine (Oni)
  async updateMedicine(id: number, data: object) {
    return this.put(`/api/medicines/${id}`, data);
  }

  // Delete a medicine (Oni)
  async deleteMedicine(id: number) {
    return this.delete(`/api/medicines/${id}`);
  }

  // Get incoming orders for pharmacy (Oni)
  async getPharmacyOrders() {
    return this.get('/api/pharmacy/orders');
  }

  // ─── Error Handler ────────────────────────────────────────────
  handleError(error: any) {
    if (error.response) {
      console.error(`API Error: ${error.response.status}`, error.response.data);
      if (error.response.status === 404) return; // ← ADD THIS LINE — silent 404s
    } else if (error.request) {
      console.error('API Error: No response received');
    } else {
      console.error('API Error:', error.message);
    }
    toast.error(error.response?.data?.message || error.message || 'Something went wrong');
  }
}

export default ApiClient;