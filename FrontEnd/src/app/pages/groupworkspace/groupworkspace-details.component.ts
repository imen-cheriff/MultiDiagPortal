import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../users.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Carto, Family } from '../../models/car';
import { WorkspaceService } from '../../workspace.service';
import { CartoEditBarComponent } from '../../components/carto-edit-bar/carto-edit-bar.component';
import { HistoryService } from '../../history.service';
import * as XLSX from 'xlsx';
import { ConfirmDialogComponent } from '../../components/dialog/confirm/confirm-form-dialog.component';

@Component({
  selector: 'app-group-car-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, CartoEditBarComponent],
  templateUrl: './groupworkspace-details.component.html',
  styleUrls: ['./groupworkspace-details.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GroupCarDetailComponent implements OnInit, OnChanges {
  errorMessage: string | undefined;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(
    private readonly usersService: UsersService,
    private readonly workspaceService: WorkspaceService,
    private readonly router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private changeDetectorRef: ChangeDetectorRef,
    private readonly historyService: HistoryService
  ) { }

  @Input() carto: any; // Current cartography
  @Input() allCartos: Carto[] = []; // All cartographies for the selected car
  @Input() selectedCarId: number | null = null; // Selected car ID

  @Output() newClicked: EventEmitter<void> = new EventEmitter();
  @Output() cartoUpdated: EventEmitter<void> = new EventEmitter<void>();
  @Output() cartoSelected: EventEmitter<number> = new EventEmitter<number>();
  @Output() dataImported = new EventEmitter<any[]>();

  userActionEvent: EventEmitter<void> = new EventEmitter<void>();

  families: any[] = [];
  ecus: any[] = [];

  currentDetail: any = null;
  selectedCarto: any;
  readonly: boolean = true;
  isCreatingCarto = false; // Initially not in "create carto" mode
  selectedFamilyIndex: number = 0; // Track which family is selected for adding ECUs

  isManager: boolean = false;
  isTL: boolean = false;
  isAdmin: boolean = false;
  isAuthenticated: boolean = false;

  // For tab navigation
  availableCartos: any[] = [];

  // Filter properties
  activeFilters: { [key: string]: boolean } = {};
  filters: { [key: string]: any } = {};
  filteredFamilies: any[] = [];

  trackByIndex(index: number, item: any): number {
    return index;
  }

  ngOnInit(): void {
    this.isManager = this.usersService.isManager();
    this.isTL = this.usersService.isTL();
    this.isAdmin = this.usersService.isAdmin();
    this.isAuthenticated = this.usersService.isAuthenticated();

    this.workspaceService.getFamilies().subscribe((data) => {
      this.families = data;
      console.log(this.families);
    });

    this.workspaceService.getEcus().subscribe((data) => {
      this.ecus = data;
      console.log(this.ecus);
    });

    console.log('car ID', this.selectedCarId);

    // Initialize available cartos
    this.updateAvailableCartos();

    // Initialize filters
    this.initializeFilters();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Details component received changes:', changes);

    // Check if carto input changed
    if (changes['carto']) {
      if (changes['carto'].currentValue) {
        console.log('Carto changed in details component:', this.carto);
        this.readonly = true;
        this.currentDetail = JSON.parse(JSON.stringify(this.carto));
        const savedColumns = localStorage.getItem(
          `carto_${this.carto.id}_columns`
        );
        if (savedColumns) {
          const selectedCols = JSON.parse(savedColumns);
          this.availableColumns.forEach((col) => {
            col.selected = col.required || selectedCols.includes(col.field);
          });
        }

        console.log('curent details', this.currentDetail);
        console.log('saved columns', savedColumns);

        // Reinitialize filters when current detail changes
        this.initializeFilters();
        console.log('Filtered after initialization:', this.filters);
      } else {
        //console.log('Carto cleared in details component');
        this.currentDetail = null;
        this.filteredFamilies = [];
      }
      this.cdr.detectChanges();
    }

    // Update available cartos when allCartos or selectedCarId changes
    if (changes['allCartos'] || changes['selectedCarId']) {
      this.updateAvailableCartos();
    }
  }

  // Initialize filters when data is loaded
  initializeFilters() {
    // Define filter properties for each column
    const filterColumns = [
      'famille',
      'ecu',
      'motorisation',
      'type',
      'reco',
      'perimetre',
      'mpm',
      'ident',
      'ta',
      'fa',
      'protocol',
      'respDev',
      'sa',
      'address',
      'objectifCible',
      'etatDev',
      'typeDev',
    ];

    // Initialize filter objects
    filterColumns.forEach((column) => {
      this.filters[column] = {
        searchTerm: '',
        options: [],
        selected: [],
      };
      this.activeFilters[column] = false;
    });

    // Populate filter options if data is available
    if (
      this.currentDetail?.families &&
      this.currentDetail.families.length > 0
    ) {
      this.extractFilterOptions();
    }

    // Start with all data visible
    this.filteredFamilies = [...(this.currentDetail?.families || [])];
  }

  // Extract unique values for each filter column from data
  extractFilterOptions() {
    if (!this.currentDetail?.families) return;

    // For family names
    const uniqueFamilies = [
      ...new Set(this.currentDetail.families.map((f: any) => f.name)),
    ];
    this.filters['famille'].options = uniqueFamilies.map((value) => ({
      value,
      selected: true,
    }));

    // For ECU and other properties
    const allEcus: any[] = [];
    const propertyMap = {
      ecu: 'name',
      motorisation: 'motorisation',
      type: 'type',
      reco: 'reco',
      perimetre: 'perimetre',
      mpm: 'mpm',
      ident: 'ident',
      ta: 'ta',
      fa: 'fa',
      protocol: 'protocol',
      respDev: 'respDev',
      sa: 'sa',
      address: 'address',
      objectifCible: 'objectifCible',
      etatDev: 'etatDev',
      typeDev: 'typeDev',
    };

    // Collect all ECUs
    this.currentDetail.families.forEach((family: { ecus: string | any[] }) => {
      if (family.ecus && family.ecus.length > 0) {
        allEcus.push(...family.ecus);
      }
    });

    // Extract unique values for each property
    Object.keys(propertyMap).forEach((key) => {
      const prop = propertyMap[key as keyof typeof propertyMap];
      const uniqueValues = [
        ...new Set(allEcus.map((ecu) => ecu[prop] || 'NA').filter(Boolean)),
      ];
      this.filters[key].options = uniqueValues.map((value) => ({
        value,
        selected: true,
      }));
    });

    // Initialize selected options for each filter
    Object.keys(this.filters).forEach((key) => {
      this.filters[key].selected = this.filters[key].options.map(
        (opt: { value: any }) => opt.value
      );
    });
  }

  // Toggle filter dropdown visibility
  toggleFilter(column: string, event: Event) {
    // Close all other filters
    Object.keys(this.activeFilters).forEach((key) => {
      if (key !== column) {
        this.activeFilters[key] = false;
      }
    });

    // Toggle current filter
    this.activeFilters[column] = !this.activeFilters[column];

    // Stop event propagation to prevent closing on click
    event.stopPropagation();
  }

  // Toggle specific filter option
  toggleFilterOption(column: string, option: any) {
    option.selected = !option.selected;
    // Update selected options array
    this.filters[column].selected = this.filters[column].options
      .filter((opt: { selected: any }) => opt.selected)
      .map((opt: { value: any }) => opt.value);

    // Apply filter after toggling
    this.applyFilter();
  }

  // Apply filter
  applyFilter(column?: string) {
    if (!this.currentDetail?.families) return;

    const families = JSON.parse(JSON.stringify(this.currentDetail.families));

    this.filteredFamilies = families.filter((family: any) => {
      // 1. Filter family by name ("famille" filter)
      if (
        this.filters['famille'].selected &&
        this.filters['famille'].selected.length > 0 &&
        !this.filters['famille'].selected.includes(family.name)
      ) {
        return false; // <<< exclude the family completely
      }

      // 2. Filter the ECUs inside the family
      if (family.ecus && family.ecus.length > 0) {
        family.ecus = family.ecus.filter((ecu: any) => {
          for (const filterKey of Object.keys(this.filters)) {
            if (filterKey === 'famille') continue; // Skip famille here

            const prop = filterKey === 'ecu' ? 'name' : filterKey;

            if (
              this.filters[filterKey].searchTerm &&
              !String(ecu[prop] || '')
                .toLowerCase()
                .includes(this.filters[filterKey].searchTerm.toLowerCase())
            ) {
              return false;
            }

            if (
              this.filters[filterKey].selected.length > 0 &&
              !this.filters[filterKey].selected.includes(ecu[prop] || 'NA')
            ) {
              return false;
            }
          }
          return true;
        });
      }

      // 3. After ECU filtering, remove family if no ECUs left
      return !family.ecus || family.ecus.length > 0;
    });

    this.cdr.detectChanges();
  }

  // Clear filter for a specific column
  clearFilter(column: string) {
    this.filters[column].searchTerm = '';
    this.filters[column].options.forEach(
      (option: { selected: boolean }) => (option.selected = true)
    );
    this.filters[column].selected = this.filters[column].options.map(
      (opt: { value: any }) => opt.value
    );
    this.applyFilter();
    this.activeFilters[column] = false;
  }

  // Close all filter dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  closeAllFilters(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;

    // Check if the click is inside any filter container
    if (!targetElement.closest('.filter-container')) {
      Object.keys(this.activeFilters).forEach((key) => {
        this.activeFilters[key] = false;
      });
    }
  }

  updateAvailableCartos(): void {
    console.log('Updating available cartos with:', this.allCartos);

    if (this.allCartos && this.allCartos.length > 0) {
      this.availableCartos = [...this.allCartos];
      console.log('Available cartos set from allCartos:', this.availableCartos);
    } else if (this.selectedCarId) {
      // If we only have the car ID but no cartos, fetch them
      console.log('Fetching cartos for car ID:', this.selectedCarId);
      this.workspaceService.getCartosByCar(this.selectedCarId).subscribe(
        (cartos: any[]) => {
          this.availableCartos = cartos;
          console.log('Fetched available cartos:', this.availableCartos);

          // If we have a carto selected but it's not in the list, auto-select the first one
          if (
            (!this.carto || !cartos.find((c) => c.id === this.carto?.id)) &&
            cartos.length > 0
          ) {
            this.selectCartoTab(cartos[0].id);
          }

          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Error fetching cartographies:', error);
          this.availableCartos = this.carto ? [this.carto] : [];
          this.cdr.detectChanges();
        }
      );
    } else {
      this.availableCartos = this.carto ? [this.carto] : [];
      console.log(
        'Available cartos set to current carto only:',
        this.availableCartos
      );
    }
  }

  // updateAvailableCartos(): void {
  //   console.log('Updating available cartos with:', this.allCartos);
  
  //   if (this.allCartos && this.allCartos.length > 0) {
  //     // Sort cartos by a date property (e.g., updatedAt or createdAt) in descending order
  //     this.availableCartos = [...this.allCartos].sort((a, b) => {
  //       const dateA = new Date(a.creationDate).getTime();
  //       const dateB = new Date(b.creationDate).getTime();
  //       return dateB - dateA;
  //     });
  
  //     console.log('Available cartos sorted by date:', this.availableCartos);
  //   } else if (this.selectedCarId) {
  //     console.log('Fetching cartos for car ID:', this.selectedCarId);
  //     this.workspaceService.getCartosByCar(this.selectedCarId).subscribe(
  //       (cartos: any[]) => {
  //         this.availableCartos = [...this.allCartos].sort((a, b) => {
  //           const dateA = new Date(a.creationDate).getTime();
  //           const dateB = new Date(b.creationDate).getTime();
  //           return dateB - dateA;
  //         });
  
  //         console.log('Fetched and sorted available cartos:', this.availableCartos);
  
  //       // Automatically select the most recent carto
  //       if (this.availableCartos.length > 0) {
  //         this.selectCartoTab(this.availableCartos[0].id); // Select the first (most recent) carto
  //       }
  
  //         this.cdr.detectChanges();
  //       },
  //       (error) => {
  //         console.error('Error fetching cartographies:', error);
  //         this.availableCartos = this.carto ? [this.carto] : [];
  //         this.cdr.detectChanges();
  //       }
  //     );
  //   } else {
  //     this.availableCartos = this.carto ? [this.carto] : [];
  //     console.log(
  //       'Available cartos set to current carto only:',
  //       this.availableCartos
  //     );
  //   }
  // }

  selectCartoTab(cartoId: number): void {
    console.log('Tab selected for carto ID:', cartoId);
    if (this.carto?.id !== cartoId) {
      this.cartoSelected.emit(cartoId);
    }
  }

  cancel() {
    this.selectedCarto = null;
    this.readonly = true;
    this.currentDetail = this.carto ? { ...this.carto } : null;
    this.isCreatingCarto = false;

    // Reset filters and filtered families
    this.initializeFilters();
    this.filteredFamilies = [...(this.currentDetail?.families || [])];
  }

  async newCarto(): Promise<void> {
    this.isCreatingCarto = true;
    this.readonly = false;
    this.currentDetail = {
      name: '',
      outil: '',
      version: '',
      families: [],
      carId: this.selectedCarId || null,
    };
    this.filteredFamilies = [];
    this.newClicked.emit();
  }

  getTotalECUs(): number {
    // Use filtered families for counting when filters are active
    const familiesToCount =
      this.filteredFamilies.length > 0
        ? this.filteredFamilies
        : this.currentDetail?.families || [];

    return (
      familiesToCount.reduce(
        (total: number, family: Family) => total + (family.ecus?.length || 0),
        0
      ) || 0
    );
  }

  updateName(event: any) {
    const inputValue = event.target.value;

    // Ensure "Carto-" stays at the start
    if (!inputValue.startsWith('Carto-')) {
      event.target.value = 'Carto-';
    } else {
      this.currentDetail.name = inputValue.replace(/^Carto-/, ''); // Stores only the user-entered name
    }
  }

  edit(): void {
    this.readonly = false;
  }

  async save(): Promise<void> {
    if (this.carto && !this.isCreatingCarto) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Confirmation',
          message: 'Are you sure you want to edit this cartography?',
        },
      });

      dialogRef.afterClosed().subscribe(async (result) => {
        if (!result) return;

        if (result) {
          try {
            await this.workspaceService
              .updateCarto(this.carto.id, this.currentDetail)
              .toPromise();

            const selectedColumns = this.availableColumns
              .filter((col) => col.selected)
              .map((col) => col.field);
            localStorage.setItem(
              `carto_${this.carto.id}_columns`,
              JSON.stringify(selectedColumns)
            );

            // Log history action
            this.logHistoryAction(
              'modify',
              'carto',
              this.currentDetail.id,
              this.currentDetail.name,
              `Updated cartography details`
            );

            this.snackBar.open('Cartography updated successfully', 'Close', {
              duration: 3000,
              panelClass: ['custom-snackbar'],
            });
            this.readonly = true;
            this.cartoUpdated.emit();

            // Refresh filters after update
            this.initializeFilters();
          } catch (error) {
            console.error('Error updating cartography:', error);
            this.showError('Failed to update cartography');
          }
        }
      });
    } else if (this.isCreatingCarto) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Confirmation',
          message: 'Are you sure you want to create this cartography?',
        },
      });

      dialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
          const carId = this.selectedCarId!;
          try {
            const response = await this.workspaceService
              .createCarto(carId, this.currentDetail)
              .toPromise();

            const selectedColumns = this.availableColumns
              .filter((col) => col.selected)
              .map((col) => col.field);
            localStorage.setItem(
              `carto_${response.carto.id}_columns`,
              JSON.stringify(selectedColumns)
            );

            // Log history action
            this.logHistoryAction(
              'add',
              'carto',
              response.carto.id,
              this.currentDetail.name,
              `Created new cartography`
            );

            this.snackBar.open('Cartography created successfully', 'Close', {
              duration: 3000,
            });
            this.readonly = true;
            this.isCreatingCarto = false;
            this.currentDetail = response; // Set current detail to the newly created carto
            this.cartoUpdated.emit();

            // Initialize filters for new carto
            this.initializeFilters();
          } catch (error) {
            console.error('Error creating cartography:', error);
            this.showError('Failed to create cartography');
          }
        }
      });
    }
  }

  delete(cartoId: number | undefined): void {
    if (cartoId) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Confirmation',
          message: 'Are you sure you want to delete this cartography?',
        },
      });

      dialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
          try {

            await this.workspaceService.deleteCarto(cartoId).toPromise();
            localStorage.removeItem(`carto_${cartoId}_columns`);

            // Log history action before deletion
            this.logHistoryAction(
              'delete',
              'carto',
              cartoId,
              this.currentDetail.name,
              `Deleted cartography`
            );

            this.snackBar.open('Cartography deleted successfully', 'Close', {
              duration: 3000,
            });
            this.currentDetail = null;
            this.filteredFamilies = [];
            this.cartoUpdated.emit();
          } catch (error) {
            console.error('Error deleting cartography:', error);
            this.snackBar.open('Error deleting cartography', 'Close', {
              duration: 3000,
            });
          }
        }
      });
    }
  }

  showError(mess: string): void {
    this.errorMessage = mess;
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }

  // Add these properties to your component class
  columnSelectionMode = false; 
  
  availableColumns: Array<{
    field: string;
    label: string;
    selected: boolean;
    required: boolean;
  }> = [
      { field: 'famille', label: 'Family', selected: true, required: true },
      { field: 'motorisation', label: 'Motorisation', selected: true, required: false},
      { field: 'type', label: 'Type', selected: true, required: false },
      { field: 'ecu', label: 'ECU', selected: true, required: true },
      { field: 'reco', label: 'Reco', selected: true, required: false },
      { field: 'perimetre', label: 'Perimetre', selected: true, required: false },
      { field: 'mpm', label: 'MPM', selected: true, required: false },
      { field: 'ident', label: 'Ident', selected: true, required: false },
      { field: 'ta', label: 'TA', selected: true, required: false },
      { field: 'fa', label: 'FA', selected: true, required: false },
      { field: 'protocol', label: 'Protocol', selected: true, required: false },
      { field: 'respDev', label: 'Developper', selected: true, required: false },
      { field: 'sa', label: 'SA', selected: true, required: false },
      { field: 'address', label: '@E/@R', selected: true, required: false },
      { field: 'objectifCible',label: 'Objective Pack',selected: true,required: false},
      { field: 'etatDev', label: 'Ecu Status', selected: true, required: false },
      { field: 'typeDev', label: 'Ecu Type', selected: true, required: false },
    ];

  // Method to toggle column selection mode
  toggleColumnSelectionMode() {
    this.columnSelectionMode = !this.columnSelectionMode;
  }

  // Method to toggle column selection
  toggleColumnSelection(column: {
    field: string;
    label: string;
    selected: boolean;
    required: boolean;
  }): void {
    // Don't allow deselecting required columns
    if (column.required && column.selected) {
      return;
    }
    column.selected = !column.selected;
  }

  // Method to add a new row with the selected columns
  addRowWithSelectedColumns() {
    // Create a new family for each new row
    const newFamily = this.addFamily();

    // Create a new ECU with only the selected fields
    const newEcu: { [key: string]: string } = {};

    // Add properties based on selected columns
    this.availableColumns.forEach((column) => {
      if (column.selected) {
        newEcu[column.field] = '';
      }
    });

    // Ensure required fields
    newEcu['motorisation'] = '';
    newEcu['type'] = '';
    newEcu['name'] = ''; // This corresponds to the ECU field

    // Add the new ECU to the newly created family
    newFamily.ecus.push(newEcu);

    // Exit column selection mode
    this.columnSelectionMode = false;
  }

  // Method to add a new family (modified from your existing code)
  addFamily() {
    const newFamily: { name: string; ecus: { [key: string]: string }[] } = {
      name: '',
      ecus: [],
    };

    this.currentDetail.families.push(newFamily);

    // Log history action
    if (this.carto && this.carto.id) {
      newFamily.name = newFamily.name || 'New Family';
      this.logHistoryAction(
        'add',
        'family',
        this.carto.id,
        newFamily.name,
        `Added new family to cartography Carto-${this.currentDetail.name}`
      );
    }

    // Open the column selection mode
    this.columnSelectionMode = true;

    return newFamily;
  }

  getColumnByField(arg0: string) {
    return this.availableColumns.find((col) => col.field === arg0);
  }

  resetColumnSelection() {
    this.availableColumns.forEach((column) => {
      column.selected = true; // Reset all columns to selected
    });
  }

  // Delete a family
  deleteFamily(index: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation',
        message: 'Are you sure you want to delete this Row?',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Determine if we're working with filtered families or original data
        const workingFamilies =
          this.filteredFamilies.length > 0 && this.readonly
            ? this.filteredFamilies
            : this.currentDetail.families;

        const familyToDelete = workingFamilies[index];

        // Log history action
        if (this.carto && this.carto.id) {
          this.logHistoryAction(
            'delete',
            'family',
            this.carto.id,
            familyToDelete.name,
            `Deleted family from cartography ${this.currentDetail.name}`
          );
        }

        // Remove from original data
        const originalIndex = this.currentDetail.families.findIndex(
          (f: any) => f.name === familyToDelete.name
        );
        if (originalIndex !== -1) {
          this.currentDetail.families.splice(originalIndex, 1);
        }

        // Remove from filtered view if it exists
        if (this.filteredFamilies.length > 0) {
          this.filteredFamilies.splice(index, 1);
        }

        // Update selected family index if needed
        if (this.selectedFamilyIndex >= workingFamilies.length) {
          this.selectedFamilyIndex = Math.max(0, workingFamilies.length - 1);
        }

        // Update filters after deletion
        this.extractFilterOptions();
      }
    });
  }

  // Add a new ECU to a family
  addEcu(family: any): void {
    if (!family.ecus) {
      family.ecus = [];
    }

    // Create a new ECU with default values
    const newEcu = {
      name: 'New ECU',
      reco: '',
      mpm: '',
      ident: '',
      ta: '',
      fa: '',
      protocol: '',
      sa: '',
      respDev: '',
      etatDev: '',
      address: '',
      mdsd: '',
      objectifCible: '',
      cibleLivraison: '',
      estimationChiffrage: '',
    };

    // Add to ECUs array
    family.ecus.push(newEcu);

    // Log history action
    if (this.carto && this.carto.id) {
      this.logHistoryAction(
        'add',
        'ecu',
        this.carto.id,
        newEcu.name,
        `Added new ECU to family ${family.name} in cartography ${this.currentDetail.name}`
      );
    }

    // Update filter options since we added new data
    this.extractFilterOptions();

    // Re-apply filters to update view
    this.applyFilter();

    // Scroll to the new ECU after DOM update
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  }

  // Add ECU to the currently selected family
  addEcuToSelectedFamily(): void {
    if (
      this.currentDetail?.families &&
      this.currentDetail.families.length > 0
    ) {
      const selectedFamily =
        this.currentDetail.families[this.selectedFamilyIndex];
      this.addEcu(selectedFamily);
    } else {
      this.showError('Please add a family first');
    }
  }

  // Delete an ECU
  deleteEcu(family: any, index: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation',
        message: 'Are you sure you want to delete this ECU?',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const ecuToDelete = family.ecus[index];

        // Log history action
        if (this.carto && this.carto.id) {
          this.logHistoryAction(
            'delete',
            'ecu',
            this.carto.id,
            ecuToDelete.name,
            `Deleted ECU from family ${family.name} in cartography ${this.currentDetail.name}`
          );
        }

        family.ecus.splice(index, 1);

        // Update filter options after deletion
        this.extractFilterOptions();

        // Re-apply filters to update view
        this.applyFilter();
      }
    });
  }

  // Scroll to the bottom of the container
  scrollToBottom(): void {
    if (!this.scrollContainer) return;

    const container = this.scrollContainer.nativeElement;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth', // Smooth scrolling effect
    });
  }

  getFullName(dev: any): string {
    return `${dev.Prenom ?? ''} ${dev.NomUtilisateur ?? ''}`.trim();
  }

  setFullName(dev: any, value: string): void {
    const parts = value.trim().split(' ');
    dev.Prenom = parts.slice(0, -1).join(' ') || '';
    dev.NomUtilisateur = parts.slice(-1).join('') || '';
  }

  onFullNameChange(dev: any, value: string): void {
    const parts = value.trim().split(' ');
    dev.Prenom = parts.slice(0, -1).join(' ');
    dev.NomUtilisateur = parts.slice(-1).join('');
  }

  data: any[] = [];

  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) return;

    const file = target.files[0];
    if (!this.currentDetail) {
      this.showError('Please select or create a cartography first');
      return;
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const binaryString: string = e.target.result;
        const workbook: XLSX.WorkBook = XLSX.read(binaryString, {
          type: 'binary',
        });

        // Get the first sheet
        const firstSheetName: string = workbook.SheetNames[0];
        const worksheet: XLSX.WorkSheet = workbook.Sheets[firstSheetName];

        // Convert sheet to JSON
        const excelData = XLSX.utils.sheet_to_json(worksheet);
        console.log('Imported Excel data:', excelData);

        if (excelData.length === 0) {
          this.showError('The Excel file contains no data');
          return;
        }

        // Update cartography basic info from first row if available
        this.updateCartoBasicInfo(excelData[0]);

        // Process family and ECU data
        this.processExcelData(excelData);

        // Show success message
        this.snackBar.open('Excel data imported successfully', 'Close', {
          duration: 3000,
        });

        // Re-initialize filters after import
        this.initializeFilters();
      } catch (error) {
        console.error('Error processing Excel file:', error);
        this.showError(
          'Failed to process Excel file. Please check the format.'
        );
      }
    };
    reader.readAsBinaryString(file);
  }

  // Update cartography basic info from Excel data
  private updateCartoBasicInfo(firstRow: any): void {
    // Map Excel columns to carto properties if they exist
    if (firstRow['Carto Name'])
      this.currentDetail.name = firstRow['Carto Name'];
    if (firstRow['OUTIL']) this.currentDetail.outil = firstRow['OUTIL'];
    if (firstRow['Version']) this.currentDetail.version = firstRow['Version'];
  }

  // Process Excel data and map to families and ECUs
  private processExcelData(excelData: any[]): void {
    if (!this.currentDetail) {
      this.showError('Please select or create a cartography first');
      return;
    }

    console.log('Excel Data:', excelData);

    // Step 1: Look for header row with a more flexible approach based on the console output
    let headerIndex = -1;
    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i];
      console.log('Row:', row);

      // Based on the console log, we need to check the actual structure
      if (
        (row && row['SYSTÈME'] === 'SYSTÈME') || // Original check
        (row &&
          typeof row === 'object' &&
          Object.values(row).includes('SYSTÈME')) // Flexible check
      ) {
        headerIndex = i;
        console.log('Found header row at index:', headerIndex, row);
        break;
      }
    }

    // If we couldn't find the header with standard approach, try a different approach
    if (headerIndex === -1) {
      // Directly process the data assuming it's already structured (no header row)
      console.log('Trying to process data without standard header detection');

      // Initialize families if needed
      if (!this.currentDetail.families) {
        this.currentDetail.families = [];
      } else {
        this.currentDetail.families = [];
      }

      // Create a map to group ECUs by family
      const familyGroups = new Map<string, any[]>();

      // Process each row directly
      for (const row of excelData) {
        if (!row || Object.keys(row).length === 0) continue;

        // Extract family name from the row based on console output
        const familyName = row['SYSTÈME'] || 'Unnamed Family';

        if (!familyGroups.has(familyName)) {
          familyGroups.set(familyName, []);
        }

        // Map the columns based on the structure from console log
        const ecu = {
          motorisation: row['Motorisation'] || '',
          type: row['Type'] || '',
          name: row['ECU name'] || '',
          reco: row['Reco'] || '',
          perimetre: row['PERIMETRE'] || '',
          mpm: row['MPM'] || '',
          // Add other properties if they exist in your data
          ident: row['Ident'] || '',
          ta: row['TA'] || '',
          fa: row['FA'] || '',
          protocol: row['protocole'] || '',
          address: row['@E/@R'] || '',
          respDev: row['RespDev'] || '',
          sa: row['SA'] || '',
          etatDev: row['Etat dev'],
          objectifCible: row['Objectif cible'],
        };

        familyGroups.get(familyName)?.push(ecu);
      }

      // Fill families into currentDetail
      familyGroups.forEach((ecus, familyName) => {
        const family = {
          name: familyName,
          ecus: ecus,
        };
        this.currentDetail.families.push(family);
      });

      console.log('Imported families:', this.currentDetail.families);

      // Show success
      this.snackBar.open(
        'Excel data imported and mapped successfully',
        'Close',
        {
          duration: 3000,
        }
      );

      // Force change detection if necessary
      if (this.changeDetectorRef) {
        this.changeDetectorRef.detectChanges();
      }

      return;
    }

    // If we found a header row, proceed with the original approach
    // but adapt the column mapping based on the actual structure

    // Step 2: Define column mapping based on the header row structure
    const headerRow = excelData[headerIndex];
    const columnMapping = this.determineColumnMapping(headerRow);

    // Step 3: Initialize families array
    if (!this.currentDetail.families) {
      this.currentDetail.families = [];
    } else {
      this.currentDetail.families = [];
    }

    // Step 4: Group ECUs by Family
    const familyGroups = new Map<string, any[]>();

    for (let i = headerIndex + 1; i < excelData.length; i++) {
      const row = excelData[i];
      if (!row || Object.keys(row).length === 0) continue; // Skip empty rows

      const familyName = row[columnMapping.family] || 'Unnamed Family';

      if (!familyGroups.has(familyName)) {
        familyGroups.set(familyName, []);
      }

      const ecu = {
        motorisation: row[columnMapping.motorisation] || '',
        type: row[columnMapping.type] || '',
        name: row[columnMapping.name] || 'Unnamed ECU',
        reco: row[columnMapping.reco] || '',
        perimetre: row[columnMapping.perimetre] || '',
        mpm: row[columnMapping.mpm] || '',
        ident: row[columnMapping.ident] || '',
        ta: row[columnMapping.ta] || '',
        fa: row[columnMapping.fa] || '',
        protocol: row[columnMapping.protocol] || '',
        address: row[columnMapping.address] || '',
        respDev: row[columnMapping.respDev] || '',
        sa: row[columnMapping.sa] || '',
        etatDev: row[columnMapping.etatDev] || '',
        objectifCible: row[columnMapping.objectifCible] || '',
      };

      familyGroups.get(familyName)?.push(ecu);
    }

    // Step 5: Fill families into currentDetail
    familyGroups.forEach((ecus, familyName) => {
      const family = {
        name: familyName,
        ecus: ecus,
      };
      this.currentDetail.families.push(family);
    });

    console.log('Imported families:', this.currentDetail.families);

    // Optional: Show success
    this.snackBar.open('Excel data imported and mapped successfully', 'Close', {
      duration: 3000,
    });

    // Force change detection if necessary
    if (this.changeDetectorRef) {
      this.changeDetectorRef.detectChanges();
    }
  }

  // Helper method to determine column mapping based on header row
  private determineColumnMapping(headerRow: any): any {
    const mapping: any = {
      family: '',
      motorisation: '',
      type: '',
      name: '',
      reco: '',
      perimetre: '',
      mpm: '',
      ident: '',
      ta: '',
      fa: '',
      protocol: '',
      address: '',
      respDev: '',
      sa: '',
      etatDev: '',
      objectifCible: '',
    };

    // Find the actual keys in the header row
    Object.keys(headerRow).forEach((key) => {
      const value = headerRow[key];

      if (value === 'SYSTÈME') mapping.family = key;
      else if (value === 'Motorisation') mapping.motorisation = key;
      else if (value === 'Type') mapping.type = key;
      else if (value === 'ECU name') mapping.name = key;
      else if (value === 'Reco') mapping.reco = key;
      else if (value === 'PERIMETRE') mapping.perimetre = key;
      else if (value === 'MPM') mapping.mpm = key;
      else if (value === 'Ident') mapping.ident = key;
      else if (value === 'TA') mapping.ta = key;
      else if (value === 'FA') mapping.fa = key;
      else if (value === 'protocole') mapping.protocol = key;
      else if (value === '@E/@R') mapping.address = key;
      else if (value === 'RespDev') mapping.respDev = key;
      else if (value === 'SA') mapping.sa = key;
      else if (value === 'Etat dev') mapping.etatDev = key;
      else if (value === 'Objectif cible') mapping.objectifCible = key;
    });

    return mapping;
  }

  handleImportedFile(file: File): void {
    if (!this.currentDetail) {
      this.showError('Please select or create a cartography first');
      return;
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const binaryString: string = e.target.result;
        const workbook: XLSX.WorkBook = XLSX.read(binaryString, {
          type: 'binary',
        });

        // Get the first sheet
        const firstSheetName: string = workbook.SheetNames[0];
        const worksheet: XLSX.WorkSheet = workbook.Sheets[firstSheetName];

        // Convert sheet to JSON
        const excelData = XLSX.utils.sheet_to_json(worksheet);
        console.log('Imported Excel data:', excelData);

        if (excelData.length === 0) {
          this.showError('The Excel file contains no data');
          return;
        }

        // Update cartography basic info from first row if available
        this.updateCartoBasicInfo(excelData[0]);

        // Process family and ECU data
        this.processExcelData(excelData);

        // Show success message
        this.snackBar.open('Excel data imported successfully', 'Close', {
          duration: 3000,
        });
      } catch (error) {
        console.error('Error processing Excel file:', error);
        this.showError(
          'Failed to process Excel file. Please check the format.'
        );
      }
    };
    reader.readAsBinaryString(file);
  }

  navigateToHistory(): void {
    if (this.carto && this.carto.id) {
      this.router.navigate(['/history'], {
        queryParams: { cartoId: this.carto.id, returnUrl: this.router.url },
      });
    } else {
      this.router.navigate(['/history'], {
        queryParams: { returnUrl: this.router.url },
      });
    }
  }

  // Add methods to log history actions
  private logHistoryAction(
    actionType: 'add' | 'modify' | 'delete',
    entityType: 'carto' | 'family' | 'ecu',
    entityId: number,
    entityName: string,
    details?: string
  ): void {
    this.usersService.getCurrentUser().subscribe(
      (currentUser) => {
        if (!currentUser) return;

        this.historyService
          .logAction({
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

  exportToExcel(): void {
    if (!this.currentDetail || !this.currentDetail.families) {
      this.showError('No cartography data to export');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation',
        message: 'Are you sure you want to export this cartography to Excel?',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        try {
          // Create a new workbook
          const workbook = XLSX.utils.book_new();

          // Create data array for the worksheet
          const data: any[] = [];

          // Add header information as first row
          const headerInfo: any = {
            'Carto Name': this.currentDetail.name || '',
            OUTIL: this.currentDetail.outil || 'OUTIL',
            Version: this.currentDetail.version || 'Version',
          };
          data.push(headerInfo);

          // Add a blank row after header info
          data.push({});

          // Add column headers row
          const columnHeaders = {
            SYSTÈME: 'SYSTÈME',
            Motorisation: 'Motorisation',
            Type: 'Type',
            'ECU name': 'ECU name',
            Reco: 'Reco',
            PERIMETRE: 'PERIMETRE',
            MPM: 'MPM',
            Ident: 'Ident',
            TA: 'TA',
            FA: 'FA',
            protocole: 'protocole',
            '@E/@R': '@E/@R',
            RespDev: 'RespDev',
            SA: 'SA',
            'Etat dev': 'Etat dev',
            'Objectif cible': 'Objectif cible',
          };
          data.push(columnHeaders);

          // Add ECU data from each family
          this.currentDetail.families.forEach(
            (family: { ecus: any[]; name: any }) => {
              if (family.ecus && Array.isArray(family.ecus)) {
                family.ecus.forEach((ecu) => {
                  const ecuRow = {
                    SYSTÈME: family.name,
                    Motorisation: ecu.motorisation || '',
                    Type: ecu.type || '',
                    'ECU name': ecu.name || '',
                    Reco: ecu.reco || '',
                    PERIMETRE: ecu.perimetre || '',
                    MPM: ecu.mpm || '',
                    Ident: ecu.ident || '',
                    TA: ecu.ta || '',
                    FA: ecu.fa || '',
                    protocole: ecu.protocol || '',
                    '@E/@R': ecu.address || '',
                    RespDev: ecu.respDev || '',
                    SA: ecu.sa || '',
                    'Etat dev': ecu.etatDev || '',
                    'Objectif cible': ecu.objectifCible || '',
                  };
                  data.push(ecuRow);
                });
              }
            }
          );

          // Create worksheet
          let worksheet = XLSX.utils.json_to_sheet(data, {
            skipHeader: true,
          });

          // Set column widths for better readability
          const columnWidths = [
            { wch: 20 }, // SYSTÈME
            { wch: 15 }, // Motorisation
            { wch: 15 }, // Type
            { wch: 20 }, // ECU name
            { wch: 15 }, // Reco
            { wch: 15 }, // PERIMETRE
            { wch: 15 }, // MPM
            { wch: 15 }, // Ident
            { wch: 15 }, // TA
            { wch: 15 }, // FA
            { wch: 15 }, // protocole
            { wch: 15 }, // @E/@R
            { wch: 15 }, // RespDev
            { wch: 15 }, // SA
            { wch: 15 }, // Etat dev
            { wch: 15 }, // Objectif cible
          ];
          worksheet['!cols'] = columnWidths;

          // Get the range of the worksheet
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

          // Create HTML table for styling instead of direct styling
          // This approach works with standard XLSX library

          // First, convert the worksheet to HTML
          const html = XLSX.utils.sheet_to_html(worksheet);

          // Create a temporary DOM element to manipulate the HTML
          const tempElement = document.createElement('div');
          tempElement.innerHTML = html;

          // Find the table element
          const table = tempElement.querySelector('table');
          if (table) {
            // Add border to all cells
            const allCells = table.querySelectorAll('td');
            allCells.forEach((cell) => {
              cell.style.border = '1px solid #000000';
            });

            // Style the header row (the third row, index 2)
            const rows = table.querySelectorAll('tr');
            if (rows.length > 2) {
              const headerRow = rows[2];
              const headerCells = headerRow.querySelectorAll('td');
              headerCells.forEach((cell) => {
                cell.style.backgroundColor = '#D9E1F2';
                cell.style.fontWeight = 'bold';
                cell.style.border = '1px solid #000000';
              });
            }

            // Convert back to worksheet
            const newWorksheet = XLSX.utils.table_to_sheet(table);

            // Copy the column widths to the new worksheet
            newWorksheet['!cols'] = worksheet['!cols'];

            // Use the new worksheet instead
            worksheet = newWorksheet;
          }

          // Alternative approach: Use Excel formulas to create borders
          // This method adds cell borders using Excel's own formatting capabilities

          // First create the workbook using standard approach
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Cartography');

          // Then add custom XML styling for the workbook
          // We'll use Open Office XML format which supports styles
          const fileName = `${this.currentDetail.name || 'Cartography'
            }_export_${new Date().toISOString().slice(0, 10)}.xlsx`;

          // First save to binary
          const wbout = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'binary',
          });

          // Create blob and trigger download
          const buf = new ArrayBuffer(wbout.length);
          const view = new Uint8Array(buf);
          for (let i = 0; i < wbout.length; i++) {
            view[i] = wbout.charCodeAt(i) & 0xff;
          }

          // Convert to blob and download
          const blob = new Blob([buf], { type: 'application/octet-stream' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          a.click();
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
          }, 100);

          // Show success message
          this.snackBar.open('Cartography exported successfully', 'Close', {
            duration: 3000,
          });
        } catch (error) {
          console.error('Error exporting to Excel:', error);
          this.showError('Failed to export cartography to Excel');
        }
      }
    });
  }
}
