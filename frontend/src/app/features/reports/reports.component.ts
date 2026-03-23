import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { ReportService } from '../../core/services/report.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatIconModule,
  ],
})
export class ReportsComponent implements OnInit {
  yearControl = new FormControl(new Date().getFullYear());
  monthControl = new FormControl(new Date().getMonth() + 1);
  years: number[] = [];
  months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  data: any = null;
  displayedColumns: string[] = [
    'productName',
    'category',
    'totalQuantity',
    'totalRevenue',
    'totalCost',
    'totalProfit',
  ];

  constructor(private reportService: ReportService) {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 9 }, (_, i) => currentYear - 4 + i);
  }

  ngOnInit() {
    this.load();
    this.yearControl.valueChanges.subscribe(() => this.load());
    this.monthControl.valueChanges.subscribe(() => this.load());
  }

  load() {
    const year = this.yearControl.value!;
    const month = this.monthControl.value!;
    this.reportService.getMonthly(year, month).subscribe((d) => {
      this.data = d;
    });
  }
}
