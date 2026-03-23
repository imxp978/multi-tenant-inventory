import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface OrderItem {
  id: number;
  variant: {
    id: number;
    color: string;
    variantSku: string;
    product: { id: number; name: string; sku: string };
  };
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderDate: string;
  totalAmount: number;
  note: string;
  items: OrderItem[];
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private url = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getByDate(date: string) {
    return this.http.get<Order | null>(this.url, { params: { date } });
  }

  ensure(date: string) {
    return this.http.post<Order>(`${this.url}/ensure`, { date });
  }

  addItem(orderId: number, data: { variantId: number; quantity: number; unitPrice: number }) {
    return this.http.post<OrderItem>(`${this.url}/${orderId}/items`, data);
  }

  removeItem(orderId: number, itemId: number) {
    return this.http.delete(`${this.url}/${orderId}/items/${itemId}`);
  }
}
