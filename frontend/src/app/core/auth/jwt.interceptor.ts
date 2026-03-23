import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  private getTenantId(): string {
    const hostname = window.location.hostname; // "inventory.tsaochun.com"
    return hostname.split('.')[0]; // "inventory"
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    const tenantId = this.getTenantId();

    const headers: Record<string, string> = {
      'x-tenant-id': tenantId,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    req = req.clone({ setHeaders: headers });

    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) this.auth.logout();
        return throwError(() => err);
      }),
    );
  }
}
