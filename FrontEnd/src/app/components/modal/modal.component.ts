import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-model',
  standalone: true,
  imports: [MatIconModule, MatDialogModule, CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModelComponent {
  title: string;
  message: string;
  type: 'confirm' | 'error'; // Distinguishes between confirmation and error modals

  constructor(
    public dialogRef: MatDialogRef<ModelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.title = data.title || 'Confirmation'; // Default title
    this.message = data.message || '';
    this.type = data.type || 'confirm'; // Default to 'confirm'
  }

  // Handle Confirm action
  onConfirm(): void {
    this.dialogRef.close('confirm'); // Emit 'confirm' for Confirm modals
  }

  // Handle Cancel action
  onCancel(): void {
    this.dialogRef.close('cancel'); // Emit 'cancel' for Confirm modals
  }

  // Handle Close action
  onClose(): void {
    this.dialogRef.close('close'); // Emit 'close' for Error modals
  }
}