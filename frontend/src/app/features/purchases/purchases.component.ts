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
  PurchaseService,
  Purchase,
} from '../../core/services/purchase.service';
import { PurchaseDialogComponent } from './purchase-dialog/purchase-dialog.component';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrl: './purchases.component.scss',
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
export class PurchasesComponent implements OnInit {
  dateControl = new FormControl(new Date());
  purchases: Purchase[] = [];
  displayedColumns = [
    'product',
    'color',
    'quantity',
    'unitCost',
    'total',
    'note',
    'actions',
  ];

  constructor(
    private purchaseService: PurchaseService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loadPurchases();
    this.dateControl.valueChanges.subscribe(() => this.loadPurchases());
  }

  private formatDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  loadPurchases() {
    const date = this.formatDate(this.dateControl.value!);
    this.purchaseService.getByDate(date).subscribe((p) => (this.purchases = p));
  }

  addPurchase() {
    const date = this.formatDate(this.dateControl.value!);
    this.dialog
      .open(PurchaseDialogComponent, {
        width: '500px',
        data: { purchaseDate: date },
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;
        this.purchaseService.create(result).subscribe({
          next: () => {
            this.snackBar.open('已新增進貨', '關閉', { duration: 2000 });
            this.loadPurchases();
          },
          error: (e) =>
            this.snackBar.open(e.error?.message || '新增失敗', '關閉', {
              duration: 3000,
            }),
        });
      });
  }

  deletePurchase(purchase: Purchase) {
    if (!confirm('確定刪除此進貨紀錄？（庫存將扣回）')) return;
    this.purchaseService.delete(purchase.id).subscribe(() => {
      this.snackBar.open('已刪除進貨紀錄', '關閉', { duration: 2000 });
      this.loadPurchases();
    });
  }
}
