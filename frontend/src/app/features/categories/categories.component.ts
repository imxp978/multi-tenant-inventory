import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  CategoryService,
  Category,
} from '../../core/services/category.service';
import { CategoryDialogComponent } from './category-dialog/category-dialog.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  displayedColumns = ['name', 'sortOrder', 'actions'];

  constructor(
    private service: CategoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.service.getAll().subscribe((data) => (this.categories = data));
  }

  openDialog(category?: Category) {
    const data = category ? { ...category } : { name: '', sortOrder: 0 };
    this.dialog
      .open(CategoryDialogComponent, { width: '400px', data })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;
        const obs = result.id
          ? this.service.update(result.id, result)
          : this.service.create(result);
        obs.subscribe({
          next: () => this.load(),
          error: (e) =>
            this.snackBar.open(e.error?.message || '操作失敗', '關閉', {
              duration: 3000,
            }),
        });
      });
  }

  delete(c: Category) {
    if (!confirm(`確定刪除「${c.name}」？`)) return;
    this.service.delete(c.id).subscribe({
      next: () => this.load(),
      error: (e) =>
        this.snackBar.open(e.error?.message || '刪除失敗', '關閉', {
          duration: 3000,
        }),
    });
  }
}
