import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import {
  ProductService,
  Product,
  ProductVariant,
} from '../../../core/services/product.service';
import {
  CategoryService,
  Category,
} from '../../../core/services/category.service';

@Component({
  selector: 'app-sale-item-dialog',
  templateUrl: './sale-item-dialog.component.html',
  styleUrl: './sale-item-dialog.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
})
export class SaleItemDialogComponent implements OnInit {
  categories: Category[] = [];
  products: Product[] = [];
  selectedProduct: Product | null = null;
  selectedVariant: ProductVariant | null = null;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<SaleItemDialogComponent>,
    private productService: ProductService,
    private categoryService: CategoryService,
  ) {
    this.form = this.fb.group({
      categoryId: new FormControl(null),
      productId: new FormControl(null, Validators.required),
      variantId: new FormControl(null, Validators.required),
      quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
      unitPrice: new FormControl(0, Validators.required),
    });
  }

  ngOnInit() {
    this.categoryService.getAll().subscribe((c) => (this.categories = c));
    this.loadProducts();

    this.form.get('categoryId')!.valueChanges.subscribe(() => this.loadProducts());
    this.form.get('productId')!.valueChanges.subscribe((productId) => {
      this.selectedProduct = this.products.find(p => p.id === productId) || null;
      this.selectedVariant = null;
      this.form.patchValue({
        variantId: null,
        unitPrice: this.selectedProduct?.sellingPrice || 0,
      });
    });
    this.form.get('variantId')!.valueChanges.subscribe((variantId) => {
      this.selectedVariant = this.selectedProduct?.variants.find(v => v.id === variantId) || null;
    });
  }

  loadProducts() {
    const categoryId = this.form.get('categoryId')!.value;
    this.productService
      .getAll(categoryId || undefined)
      .subscribe((p) => {
        this.products = p;
        this.selectedProduct = null;
        this.selectedVariant = null;
        this.form.patchValue({ productId: null, variantId: null });
      });
  }

  save() {
    if (this.form.invalid) return;
    const { variantId, quantity, unitPrice } = this.form.value;
    this.ref.close({ variantId, quantity, unitPrice });
  }
}
