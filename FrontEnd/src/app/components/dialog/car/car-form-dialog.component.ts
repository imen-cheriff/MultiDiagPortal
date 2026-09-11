import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WorkspaceService } from '../../../workspace.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-car-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './car-form-dialog.component.html',
  styleUrls: ['./car-form-dialog.component.scss']
})
export class CarFormDialogComponent implements OnInit {
  carForm: FormGroup;
  dialogTitle: string;
  brands: any[] = [];
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private workspaceService: WorkspaceService,
    public dialogRef: MatDialogRef<CarFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dialogTitle = data.mode === 'add' ? 'Add Car' : 'Edit Car';
    
    this.carForm = this.fb.group({
      model: ['', Validators.required],
      year: ['', [Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
      registration: [''],
      brandId: [data.brandId || '', Validators.required]
    });
    
    if (data.mode === 'edit' && data.car) {
      this.carForm.patchValue({
        model: data.car.model,
        year: data.car.year,
        registration: data.car.registration,
        brandId: data.car.brandId || data.brandId
      });
    }
  }

  ngOnInit(): void {
    this.loadBrands();
  }

  loadBrands(): void {
    this.loading = true;
    this.workspaceService.getBrandsPaginated(0, 100).subscribe(
      (response: any) => {
        this.brands = response.content;
        this.loading = false;
      },
      error => {
        console.error('Error loading brands:', error);
        this.loading = false;
      }
    );
  }

  onSubmit(): void {
    if (this.carForm.valid) {
      this.dialogRef.close(this.carForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close('close');
  }
}