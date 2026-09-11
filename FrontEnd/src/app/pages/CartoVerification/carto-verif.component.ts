import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WorkspaceService } from '../../workspace.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { UsersService } from '../../users.service';
import { HistoryService } from '../../history.service';
import { Carto, Ecu, Family } from '../../models/car';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/dialog/confirm/confirm-form-dialog.component';

@Component({
  selector: 'app-carto-verif',
  standalone: true,
  templateUrl: './carto-verif.component.html',
  styleUrls: ['./carto-verif.component.scss'],
  imports: [
    MatCardModule,
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    FormsModule
  ]
})
export class VerifyCartoComponent implements OnInit {

  pendingCartos: Carto[] = [];
  loading = true;
  error: string | null = null;

  // Properties for carto details display
  selectedCarto: Carto | null = null;
  selectedCartoDetails: any = null;
  loadingDetails = false;
  detailsError: string | null = null;

  objectKeys = Object.keys;
  Array: any;
  expandedFamilies: boolean[] = []
  expandedEcus: boolean[][] = []
  selectedDateFilter: any;

  constructor(
    private workspaceService: WorkspaceService,
    private snackBar: MatSnackBar,
    private usersService: UsersService,
    private historyService: HistoryService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.fetchPendingCartos();
  }

  fetchPendingCartos(): void {
    this.loading = true;
    this.workspaceService.getPendingCartos().subscribe({
      next: (data) => {
        this.pendingCartos = data.sort((a, b) => new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime());
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load pending cartos';

        this.loading = false;
        console.error(err);
      }
    });
  }

  selectCarto(carto: Carto): void {
    this.selectedCarto = carto;
    this.fetchCartoDetails(carto.id);
    console.log('Selected carto:', carto);
  }

  fetchCartoDetails(cartoId: number): void {
    this.loadingDetails = true;
    this.detailsError = null;
    this.selectedCartoDetails = null;

    this.workspaceService.getCarto(cartoId).subscribe({
      next: (cartoDetails) => {
        this.selectedCartoDetails = cartoDetails;
        this.loadingDetails = false;
      },
      error: (err) => {
        this.detailsError = 'Failed to load carto details';
        this.loadingDetails = false;
        console.error(err);
      }
    });
  }

  getMainKeys(carto: Carto | null): string[] {
    if (!carto) return []
    return Object.keys(carto).filter((key) => key !== "families")
  }

  getFamilyKeys(family: Family): string[] {
    if (!family) return []
    return Object.keys(family).filter((key) => key !== "ecus")
  }

  getEcuKeys(ecu: Ecu): string[] {
    if (!ecu) return []
    return Object.keys(ecu)
  }

  formatKey(key: string): string {
    // Convert camelCase or snake_case to Title Case with spaces
    return key
      .replace(/([A-Z])/g, " $1") // Insert space before capital letters
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
  }

  toggleFamily(index: number): void {
    this.expandedFamilies[index] = !this.expandedFamilies[index]
  }

  toggleEcu(familyIndex: number, ecuIndex: number): void {
    if (!this.expandedEcus[familyIndex]) {
      this.expandedEcus[familyIndex] = []
    }
    this.expandedEcus[familyIndex][ecuIndex] = !this.expandedEcus[familyIndex][ecuIndex]
  }

  handleApprove(cartoId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation',
        message: 'Are you sure you want to approve this cartography?',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.workspaceService.approveCarto(cartoId).subscribe({
          next: () => {
            const approvedCarto = this.pendingCartos.find(carto => carto.id === cartoId);
            this.pendingCartos = this.pendingCartos.filter(carto => carto.id !== cartoId);
            this.snackBar.open('Carto approved successfully', 'Close', { duration: 3000 });

            // Clear selected carto if it was the one approved
            if (this.selectedCarto && this.selectedCarto.id === cartoId) {
              this.selectedCarto = null;
              this.selectedCartoDetails = null;
            }

            if (approvedCarto) {
              this.logHistoryAction(
                'approve',
                'carto',
                approvedCarto.id,
                approvedCarto.name || 'Unknown',
                'Carto approved successfully'
              );
            }
          },
          error: (err) => {
            this.snackBar.open('Failed to approve carto', 'Close', { duration: 3000 });
            console.error(err);
          }
        });
      }
    });
  }

  handleReject(cartoId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation',
        message: 'Are you sure you want to reject this cartography?',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.workspaceService.rejectCarto(cartoId).subscribe({
          next: () => {
            const rejectedCarto = this.pendingCartos.find(carto => carto.id === cartoId);
            this.pendingCartos = this.pendingCartos.filter(carto => carto.id !== cartoId);
            this.snackBar.open('Carto rejected successfully', 'Close', { duration: 3000 });

            // Clear selected carto if it was the one rejected
            if (this.selectedCarto && this.selectedCarto.id === cartoId) {
              this.selectedCarto = null;
              this.selectedCartoDetails = null;
            }

            if (rejectedCarto) {
              this.logHistoryAction(
                'reject',
                'carto',
                rejectedCarto.id,
                rejectedCarto.name || 'Unknown',
                'Carto rejected'
              );
            }
          },
          error: (err) => {
            this.snackBar.open('Failed to reject carto', 'Close', { duration: 3000 });
            console.error(err);
          }
        });
      }
    });
  }

  // Add methods to log history actions
  private logHistoryAction(
    actionType: 'add' | 'modify' | 'delete' | 'approve' | 'reject',
    entityType: 'carto' | 'family' | 'ecu',
    entityId: number,
    entityName: string,
    details?: string
  ): void {
    this.usersService.getCurrentUser().subscribe(
      (currentUser) => {
        if (!currentUser) return;

        this.historyService.logAction({
          actionType,
          entityType,
          entityId,
          entityName,
          userId: currentUser.id,
          userName: `${currentUser.firstname}`, //${currentUser.lastname}
          details,
        })
          .subscribe(
            () => console.log(`${actionType} action logged successfully`),
            (error) => console.error('Error logging action:', error)
          );
      },
      (error) => console.error('Error fetching current user:', error)
    );
  }
}



