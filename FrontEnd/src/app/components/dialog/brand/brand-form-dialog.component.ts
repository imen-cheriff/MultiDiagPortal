import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-brand-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './brand-form-dialog.component.html',
  styleUrls: ['./brand-form-dialog.component.scss'],
})
export class BrandFormDialogComponent implements OnInit {
  brandForm: FormGroup;
  dialogTitle: string;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<BrandFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dialogTitle = data.mode === 'add' ? 'Add Brand' : 'Edit Brand';

    this.brandForm = this.fb.group({
      name: ['', Validators.required],
      logoUrl: [''],
    });

    if (data.mode === 'edit' && data.brand) {
      this.brandForm.patchValue({
        name: data.brand.name,
        logoUrl: data.brand.logoUrl,
      });

      if (data.brand.logoUrl) {
        this.previewUrl = data.brand.logoUrl;
      }
    }
  }

  ngOnInit(): void {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);

      // In a real application, you would upload the file to a server and get a URL
      // For now, we'll just set a placeholder URL
      this.brandForm.patchValue({
        logoUrl: '/assets/images/brand-logos/' + this.selectedFile.name,
      });
    }
  }

  onSubmit(): void {
    if (this.brandForm.valid) {
      this.dialogRef.close(this.brandForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
