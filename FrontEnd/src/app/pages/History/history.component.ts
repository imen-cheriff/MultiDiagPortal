import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { HistoryAction, HistoryService } from '../../history.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/dialog/confirm/confirm-form-dialog.component';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
  ],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
  historyActions: HistoryAction[] = [];
  filteredActions: HistoryAction[] = [];
  displayedActions: HistoryAction[] = [];

  // Filter panel state - default to expanded on desktop, collapsed on mobile
  isFilterExpanded = window.innerWidth > 768;

  // Table configuration
  displayedColumns: string[] = [
    'delete',
    'timestamp',
    'userName',
    'actionType',
    'entityType',
    'entityName',
    'details',
  ];

  // Filter properties
  startDate: Date | null = null;
  endDate: Date | null = null;
  selectedUser: string | null = null;
  selectedActionType:
    | 'add'
    | 'modify'
    | 'delete'
    | 'approve'
    | 'reject'
    | null = null;
  selectedEntityType: 'carto' | 'family' | 'ecu' | null = null;
  searchTerm: string = '';

  // Unique users for filter dropdown
  uniqueUsers: string[] = [];

  // Selected cartography ID (optional)
  selectedCartoId: number | null = null;

  constructor(
    private historyService: HistoryService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    // Check if a specific cartography ID was passed in the route
    this.route.queryParams.subscribe((params) => {
      if (params['cartoId']) {
        this.selectedCartoId = +params['cartoId'];
        this.loadHistoryForCarto(this.selectedCartoId);
      } else {
        this.loadAllHistory();
      }
    });

    // Add window resize listener to handle responsive behavior
    window.addEventListener('resize', () => {
      // Only auto-collapse on smaller screens
      if (window.innerWidth <= 768) {
        this.isFilterExpanded = false;
      }
    });
  }

  loadAllHistory(): void {
    this.historyService.getAllHistory().subscribe(
      (actions) => {
        // Sort actions by timestamp (newest to oldest)
        this.historyActions = actions.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        this.extractUniqueUsers();
        this.applyFilters();
      },
      (error) => {
        console.error('Error loading history:', error);
      }
    );
  }

  loadHistoryForCarto(cartoId: number): void {
    this.historyService.getHistoryByCartoId(cartoId).subscribe(
      (actions) => {
        // Sort actions by timestamp (newest to oldest)
        this.historyActions = actions.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        this.extractUniqueUsers();
        this.applyFilters();
      },
      (error) => {
        console.error('Error loading history:', error);
      }
    );
  }

  extractUniqueUsers(): void {
    this.uniqueUsers = [
      ...new Set(this.historyActions.map((action) => action.userName)),
    ];
  }

  applyFilters(): void {
    this.filteredActions = this.historyActions.filter((action) => {
      // Filter by date range
      if (
        this.startDate &&
        new Date(action.timestamp).getTime() <
          new Date(this.startDate).getTime()
      ) {
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
      if (
        this.selectedActionType &&
        action.actionType !== this.selectedActionType
      ) {
        return false;
      }

      // Filter by entity type
      if (
        this.selectedEntityType &&
        action.entityType !== this.selectedEntityType
      ) {
        return false;
      }

      // Filter by search term (across multiple fields)
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        return (
          action.entityName.toLowerCase().includes(term) ||
          action.userName.toLowerCase().includes(term) ||
          (action.details && action.details.toLowerCase().includes(term))
        );
      }
      return true;
    });

    this.displayedActions = this.filteredActions;
  }

  resetFilters(): void {
    this.startDate = null;
    this.endDate = null;
    this.selectedUser = null;
    this.selectedActionType = null;
    this.selectedEntityType = null;
    this.searchTerm = '';
    this.applyFilters();
  }

  onSortChange(sort: Sort): void {
    const data = [...this.filteredActions];
    if (!sort.active || sort.direction === '') {
      this.filteredActions = data;
    } else {
      this.filteredActions = data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'timestamp':
            return this.compare(
              new Date(a.timestamp).getTime(),
              new Date(b.timestamp).getTime(),
              isAsc
            );
          case 'userName':
            return this.compare(a.userName, b.userName, isAsc);
          case 'actionType':
            return this.compare(a.actionType, b.actionType, isAsc);
          case 'entityType':
            return this.compare(a.entityType, b.entityType, isAsc);
          case 'entityName':
            return this.compare(a.entityName, b.entityName, isAsc);
          default:
            return 0;
        }
      });
    }
    this.displayedActions = this.filteredActions;
  }

  private compare(
    a: number | string,
    b: number | string,
    isAsc: boolean
  ): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  getActionTypeLabel(type: string): string {
    switch (type) {
      case 'add':
        return 'Added';
      case 'modify':
        return 'Modified';
      case 'delete':
        return 'Deleted';
      case 'approve':
        return 'Approved';
      case 'reject':
        return 'Rejected';
      default:
        return type;
    }
  }

  getEntityTypeLabel(type: string): string {
    switch (type) {
      case 'carto':
        return 'Cartography';
      case 'family':
        return 'Family';
      case 'ecu':
        return 'ECU';
      default:
        return type;
    }
  }

  getActionIcon(type: string): string {
    switch (type) {
      case 'add':
        return 'add_circle';
      case 'modify':
        return 'edit';
      case 'delete':
        return 'delete';
      case 'approve':
        return 'check_circle';
      case 'reject':
        return 'cancel';
      default:
        return 'info';
    }
  }

  getActionColor(type: string): string {
    switch (type) {
      case 'add':
        return 'green-icon';
      case 'modify':
        return 'blue-icon';
      case 'delete':
        return 'red-icon';
      case 'approve':
        return 'approved-icon';
      case 'reject':
        return 'rejected-icon';
      default:
        return '';
    }
  }

  deleteAction(action: any): void {
    const actionId = action.id; // Ensure it's just the ID

    if (!actionId || typeof actionId !== 'number') {
      console.error('Invalid actionId:', actionId);
      return;
    }

    console.log('Deleting action with ID:', actionId); // Debugging step

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation',
        message: 'Are you sure you want to delete this Action?',
      },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.historyService.deleteAction(actionId).subscribe({
          next: () => {
            this.filteredActions = this.filteredActions.filter(
              (a) => a.id !== actionId
            );
            this.displayedActions = this.filteredActions;
            this.refreshHistoryList();
          },
          error: (error) => console.error('Error deleting action', error),
        });
      }
    });
  }

  deleteAllhistory(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation',
        message: 'Are you sure you want to delete all the history?',
      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.historyService.deleteAllHistory().subscribe({
          next: () => {
            this.filteredActions = [];
            this.displayedActions = this.filteredActions;
            this.refreshHistoryList();
          },
          error: (error) => console.error('Error deleting all history', error),
        });
      }
    });
  }

  refreshHistoryList(): void {
    if (this.selectedCartoId) {
      this.loadHistoryForCarto(this.selectedCartoId);
    } else {
      this.loadAllHistory();
    }
  }

  navigateBack(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else {
      this.router.navigate(['/']); // Default fallback route
    }
  }
}
