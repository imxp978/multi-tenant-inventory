import { Component, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { OrderService } from '../../core/services/order.service';
import { ProductService, Product } from '../../core/services/product.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule],
})
export class DashboardComponent implements OnInit {
  todayTotal = 0;
  todayItemCount = 0;
  lowStockItems: any[] = [];
  displayedColumns: string[] = [
    'sku',
    'productName',
    'color',
    'stock',
    'supplierUrl',
  ];

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
  ) {}

  ngOnInit() {
    const today = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');

    this.orderService.getByDate(today).subscribe((order) => {
      this.todayTotal = order?.totalAmount || 0;
      this.todayItemCount =
        order?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
    });

    this.productService.getAll().subscribe((products) => {
      this.lowStockItems = [];
      for (const p of products) {
        for (const v of p.variants) {
          if (v.minStock > 0 && v.stock <= v.minStock) {
            this.lowStockItems.push({
              productName: p.name,
              color: v.color,
              stock: v.stock,
              minStock: v.minStock,
              supplierUrl: p.supplierUrl,
              sku: p.sku,
            });
          }
        }
      }
    });
  }
}
