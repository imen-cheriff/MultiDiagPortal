import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { HistoryDialogComponent } from './history-dialog.component';

@Component({
  selector: 'app-history-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <button 
      class="history-button" 
      mat-raised-button 
      color="primary" 
      (click)="openHistoryDialog()"
      [disabled]="!cartoId">
      <span class="material-icons">history</span>
      <span>History</span>
    </button>
  `,
  styles: [`
    .history-button {
      margin-left: 8px;
      background-color: #673ab7;
    }
    
    .material-icons {
      margin-right: 4px;
    }
  `]
})
export class HistoryButtonComponent {
  @Input() cartoId: number | null = null;
  
  constructor(private dialog: MatDialog) {}
  
  openHistoryDialog(): void {
    if (!this.cartoId) return;
    
    this.dialog.open(HistoryDialogComponent, {
      width: '800px',
      data: { cartoId: this.cartoId }
    });
  }
}
