import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
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
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-category-dialog',
  templateUrl: './category-dialog.component.html',
  styleUrl: './category-dialog.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
})
export class CategoryDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public ref: MatDialogRef<CategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { id?: number; name: string; sortOrder: number },
  ) {
    this.form = this.fb.group({
      name: new FormControl(data.name || '', Validators.required),
      sortOrder: new FormControl(data.sortOrder || 0),
    });
  }

  save() {
    if (this.form.invalid) return;
    this.ref.close({ ...this.data, ...this.form.value });
  }
}
