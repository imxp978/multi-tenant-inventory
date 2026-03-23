import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  OrderService,
  Order,
  OrderItem,
} from '../../core/services/order.service';
import { SaleItemDialogComponent } from './sale-item-dialog/sale-item-dialog.component';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
})
export class SalesComponent implements OnInit {
  dateControl = new FormControl(new Date());
  order: Order | null = null;
  displayedColumns = [
    'product',
    'color',
    'quantity',
    'unitPrice',
    'subtotal',
    'actions',
  ];

  constructor(
    private orderService: OrderService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loadOrder();
    this.dateControl.valueChanges.subscribe(() => this.loadOrder());
  }

  private formatDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  loadOrder() {
    const date = this.formatDate(this.dateControl.value!);
    this.orderService.getByDate(date).subscribe((o) => (this.order = o));
  }

  addItem() {
    const date = this.formatDate(this.dateControl.value!);
    this.orderService.ensure(date).subscribe((order) => {
      this.order = order;
      this.dialog
        .open(SaleItemDialogComponent, { width: '500px' })
        .afterClosed()
        .subscribe((result) => {
          if (!result) return;
          this.orderService.addItem(order.id, result).subscribe({
            next: () => this.loadOrder(),
            error: (e) =>
              this.snackBar.open(e.error?.message || '新增失敗', '關閉', {
                duration: 3000,
              }),
          });
        });
    });
  }

  removeItem(item: OrderItem) {
    if (!confirm('確定刪除此筆銷售？（庫存將補回）')) return;
    this.orderService
      .removeItem(this.order!.id, item.id)
      .subscribe(() => this.loadOrder());
  }
}
