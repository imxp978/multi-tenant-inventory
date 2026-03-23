import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductService, Product } from '../../core/services/product.service';
import {
  CategoryService,
  Category,
} from '../../core/services/category.service';
import { ProductDialogComponent } from './product-dialog/product-dialog.component';
import { VariantDialogComponent } from './variant-dialog/variant-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],

  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
      ),
    ]),
  ],
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  sortedProducts: Product[] = [];
  categories: Category[] = [];
  displayedColumns = [
    'sku',
    'name',
    'category',
    'sellingPrice',
    'totalStock',
    'supplier',
    'actions',
  ];
  expandedProduct: Product | null = null;
  filterCategoryControl = new FormControl<number | null>(null);
  searchControl = new FormControl('');
  currentSort: Sort = { active: '', direction: '' };
  private destroyRef = inject(DestroyRef);

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.categoryService.getAll().subscribe((c) => (this.categories = c));
    this.load();

    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.load());

    this.filterCategoryControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load());
  }

  clearSearch() {
    this.searchControl.setValue('');
  }

  load() {
    const search = this.searchControl.value || undefined;
    const categoryId = this.filterCategoryControl.value || undefined;
    this.productService
      .getAll(categoryId, search)
      .subscribe((data) => {
        this.products = data;
        this.applySorting();
      });
  }

  onSort(sort: Sort) {
    this.currentSort = sort;
    this.applySorting();
  }

  applySorting() {
    if (!this.currentSort.active || this.currentSort.direction === '') {
      this.sortedProducts = [...this.products];
      return;
    }

    this.sortedProducts = [...this.products].sort((a, b) => {
      const dir = this.currentSort.direction === 'asc' ? 1 : -1;
      switch (this.currentSort.active) {
        case 'name':
          return a.name.localeCompare(b.name) * dir;
        case 'sku':
          return a.sku.localeCompare(b.sku) * dir;
        case 'category':
          return (
            (a.category?.name || '').localeCompare(b.category?.name || '') * dir
          );
        case 'sellingPrice':
          return (a.sellingPrice - b.sellingPrice) * dir;
        case 'totalStock':
          return (a.totalStock - b.totalStock) * dir;
        default:
          return 0;
      }
    });
  }

  toggleExpand(p: Product) {
    this.expandedProduct = this.expandedProduct === p ? null : p;
  }

  openDialog(product?: Product) {
    const data = product
      ? {
          id: product.id,
          name: product.name,
          sku: product.sku,
          categoryId: product.categoryId,
          sellingPrice: product.sellingPrice,
          supplierUrl: product.supplierUrl,
        }
      : {
          name: '',
          sku: '',
          categoryId: null,
          sellingPrice: 0,
          supplierUrl: '',
          variants: [],
        };

    this.dialog
      .open(ProductDialogComponent, { width: '80vw', data })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;
        const obs = result.id
          ? this.productService.update(result.id, result)
          : this.productService.create(result);
        obs.subscribe({
          next: () => this.load(),
          error: (e) =>
            this.snackBar.open(e.error?.message || '操作失敗', '關閉', {
              duration: 3000,
            }),
        });
      });
  }

  deleteProduct(p: Product) {
    if (!confirm(`確定刪除「${p.name}」及其所有顏色變體？`)) return;
    this.productService.delete(p.id).subscribe({
      next: () => this.load(),
      error: (e) =>
        this.snackBar.open(e.error?.message || '刪除失敗', '關閉', {
          duration: 3000,
        }),
    });
  }

  addVariant(p: Product) {
    this.dialog
      .open(VariantDialogComponent, {
        width: '80vw',
        data: { color: '', costPrice: 0, stock: 0, minStock: 1 },
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;
        this.productService.addVariant(p.id, result).subscribe({
          next: () => this.load(),
          error: (e) =>
            this.snackBar.open(e.error?.message || '新增失敗', '關閉', {
              duration: 3000,
            }),
        });
      });
  }

  editVariant(p: Product, v: any) {
    this.dialog
      .open(VariantDialogComponent, {
        width: '80vw',
        data: { ...v },
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;
        this.productService.updateVariant(v.id, result).subscribe({
          next: () => this.load(),
          error: (e) =>
            this.snackBar.open(e.error?.message || '更新失敗', '關閉', {
              duration: 3000,
            }),
        });
      });
  }

  deleteVariant(p: Product, v: any) {
    if (!confirm(`確定刪除顏色「${v.color}」？`)) return;
    this.productService.deleteVariant(v.id).subscribe({
      next: () => this.load(),
      error: (e) =>
        this.snackBar.open(e.error?.message || '刪除失敗', '關閉', {
          duration: 3000,
        }),
    });
  }
}
