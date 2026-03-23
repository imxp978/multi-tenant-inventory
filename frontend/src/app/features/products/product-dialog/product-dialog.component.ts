import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  CategoryService,
  Category,
} from '../../../core/services/category.service';

@Component({
  selector: 'app-product-dialog',
  templateUrl: './product-dialog.component.html',
  styleUrl: './product-dialog.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class ProductDialogComponent implements OnInit {
  categories: Category[] = [];
  isEdit = false;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public ref: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private categoryService: CategoryService,
  ) {
    this.isEdit = !!data.id;

    this.form = this.fb.group({
      sku: new FormControl(data.sku || '', Validators.required),
      name: new FormControl(data.name || '', Validators.required),
      categoryId: new FormControl(data.categoryId || null),
      sellingPrice: new FormControl(data.sellingPrice || 0),
      supplierUrl: new FormControl(data.supplierUrl || ''),
      variants: this.fb.array([]),
    });

    if (this.isEdit) {
      this.form.get('sku')!.disable();
    }
  }

  ngOnInit() {
    this.categoryService.getAll().subscribe((c) => (this.categories = c));
  }

  get variantArray() {
    return this.form.get('variants') as FormArray;
  }

  addVariant() {
    const variantGroup = this.fb.group({
      color: new FormControl(''),
      variantSku: new FormControl(''),
      costPrice: new FormControl(0),
      stock: new FormControl(0),
      minStock: new FormControl(0),
    });

    this.variantArray.push(variantGroup);
  }

  removeVariant(index: number) {
    this.variantArray.removeAt(index);
  }

  save() {
    if (this.form.valid) {
      const value = this.form.getRawValue();
      if (this.isEdit) {
        value.id = this.data.id;
      }
      this.ref.close(value);
    }
  }
}
