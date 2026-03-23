import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Category {
  id: number;
  name: string;
  sortOrder: number;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private url = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<Category[]>(this.url); }
  create(data: Partial<Category>) { return this.http.post<Category>(this.url, data); }
  update(id: number, data: Partial<Category>) { return this.http.put<Category>(`${this.url}/${id}`, data); }
  delete(id: number) { return this.http.delete(`${this.url}/${id}`); }
}
