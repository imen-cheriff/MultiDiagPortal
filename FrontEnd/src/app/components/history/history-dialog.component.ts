import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { HistoryAction, HistoryService } from '../../history.service';


@Component({
  selector: 'app-history-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule
  ],
  templateUrl: './history-dialog.component.html',
  styleUrls: ['./history-dialog.component.scss']
})
export class HistoryDialogComponent implements OnInit {
  historyActions: HistoryAction[] = [];
  filteredActions: HistoryAction[] = [];
  
  // Filter properties
  startDate: Date | null = null;
  endDate: Date | null = null;
  selectedUser: string | null = null;
  selectedActionType: 'add' | 'modify' | 'delete' | null = null;
  selectedEntityType: 'carto' | 'family' | 'ecu' | null = null;
  
  // Unique users for filter dropdown
  uniqueUsers: string[] = [];

  constructor(
    private historyService: HistoryService,
    public dialogRef: MatDialogRef<HistoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { cartoId: number }
  ) { }

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.historyService.getHistoryByCartoId(this.data.cartoId).subscribe(
      (actions) => {
        this.historyActions = actions;
        this.filteredActions = [...actions];
        this.extractUniqueUsers();
        this.applyFilters();
      },
      (error) => {
        console.error('Error loading history:', error);
      }
    );
  }

  extractUniqueUsers(): void {
    this.uniqueUsers = [...new Set(this.historyActions.map(action => action.userName))];
  }

  applyFilters(): void {
    this.filteredActions = this.historyActions.filter(action => {
      // Filter by date range
      if (this.startDate && new Date(action.timestamp) < this.startDate) {
        return false;
      }
      if (this.endDate) {
        const endDateWithTime = new Date(this.endDate);
        endDateWithTime.setHours(23, 59, 59, 999);
        if (new Date(action.timestamp) > endDateWithTime) {
          return false;
        }
      }

      // Filter by user
      if (this.selectedUser && action.userName !== this.selectedUser) {
        return false;
      }

      // Filter by action type
      if (this.selectedActionType && action.actionType !== this.selectedActionType) {
        return false;
      }

      // Filter by entity type
      if (this.selectedEntityType && action.entityType !== this.selectedEntityType) {
        return false;
      }

      return true;
    });
  }

  resetFilters(): void {
    this.startDate = null;
    this.endDate = null;
    this.selectedUser = null;
    this.selectedActionType = null;
    this.selectedEntityType = null;
    this.filteredActions = [...this.historyActions];
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  getActionTypeLabel(type: string): string {
    switch (type) {
      case 'add': return 'Added';
      case 'modify': return 'Modified';
      case 'delete': return 'Deleted';
      default: return type;
    }
  }

  getEntityTypeLabel(type: string): string {
    switch (type) {
      case 'carto': return 'Cartography';
      case 'family': return 'Family';
      case 'ecu': return 'ECU';
      default: return type;
    }
  }

  getActionIcon(type: string): string {
    switch (type) {
      case 'add': return 'add_circle';
      case 'modify': return 'edit';
      case 'delete': return 'delete';
      default: return 'info';
    }
  }

  getActionColor(type: string): string {
    switch (type) {
      case 'add': return 'green-icon';
      case 'modify': return 'blue-icon';
      case 'delete': return 'red-icon';
      default: return '';
    }
  }
}