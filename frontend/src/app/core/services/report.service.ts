import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private http: HttpClient) {}

  getMonthly(year: number, month: number) {
    return this.http.get<any>(`${environment.apiUrl}/reports/monthly`, {
      params: { year: year.toString(), month: month.toString() }
    });
  }
}
