import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Purchase {
  id: number;
  variant: {
    id: number;
    color: string;
    variantSku: string;
    product: { id: number; name: string };
  };
  quantity: number;
  unitCost: number;
  purchaseDate: string;
  note: string;
}

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private url = `${environment.apiUrl}/purchases`;

  constructor(private http: HttpClient) {}

  getByDate(date: string) {
    return this.http.get<Purchase[]>(this.url, { params: { date } });
  }

  create(data: {
    variantId: number;
    quantity: number;
    unitCost: number;
    purchaseDate: string;
    note?: string;
  }) {
    return this.http.post<Purchase>(this.url, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }
}
