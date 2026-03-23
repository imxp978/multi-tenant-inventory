import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ProductVariant {
  id: number;
  color: string;
  variantSku: string;
  costPrice: number;
  stock: number;
  isActive: boolean;
  minStock: number;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  categoryId: number;
  sellingPrice: number;
  supplierUrl: string;
  isActive: boolean;
  category: { id: number; name: string } | null;
  variants: ProductVariant[];
  totalStock: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private url = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getAll(categoryId?: number, search?: string) {
    let params = new HttpParams();
    if (categoryId) params = params.set('categoryId', categoryId.toString());
    if (search) params = params.set('search', search);
    return this.http.get<Product[]>(this.url, { params });
  }

  getOne(id: number) {
    return this.http.get<Product>(`${this.url}/${id}`);
  }
  create(data: any) {
    return this.http.post<Product>(this.url, data);
  }
  update(id: number, data: any) {
    return this.http.put<Product>(`${this.url}/${id}`, data);
  }
  delete(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  addVariant(productId: number, data: any) {
    return this.http.post<ProductVariant>(
      `${this.url}/${productId}/variants`,
      data,
    );
  }
  updateVariant(id: number, data: any) {
    return this.http.put<ProductVariant>(
      `${environment.apiUrl}/variants/${id}`,
      data,
    );
  }
  deleteVariant(id: number) {
    return this.http.delete(`${environment.apiUrl}/variants/${id}`);
  }
}
