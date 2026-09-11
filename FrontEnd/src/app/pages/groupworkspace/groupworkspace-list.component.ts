import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { WorkspaceService } from '../../workspace.service';
import { UsersService } from '../../users.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/dialog/confirm/confirm-form-dialog.component';
import { BrandFormDialogComponent } from '../../components/dialog/brand/brand-form-dialog.component';
import { CarFormDialogComponent } from '../../components/dialog/car/car-form-dialog.component';
import { DialogComponent } from '../../components/dialog/alert/dialog.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CAR_LOGOS } from '../../models/carlogos';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { Brand } from '../../models/car';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-groupworkspacelist',
  standalone: true,
  imports: [FormsModule, CommonModule, MatIconModule],
  templateUrl: './groupTable/grouptable.component.html',
  styleUrls: ['./groupTable/grouptable.component.scss'],
  animations: [
    trigger('expandCollapse', [
      state(
        'collapsed',
        style({
          height: '60px',
          overflow: 'hidden',
        })
      ),
      state(
        'expanded',
        style({
          minHeight: '60px',
        })
      ),
      transition('collapsed <=> expanded', [animate('300ms ease-in-out')]),
    ]),
    trigger('modelList', [
      state(
        'hidden',
        style({
          opacity: 0,
          height: '0px',
          overflow: 'hidden',
        })
      ),
      state(
        'visible',
        style({
          opacity: 1,
          height: '*',
        })
      ),
      transition('hidden <=> visible', [animate('300ms ease-in-out')]),
    ]),
  ],
})
export class GroupCarslistComponent implements OnInit {



  @ViewChild('cartableContainer')
  cartableContainer!: ElementRef;

  // User roles
  isManager: boolean = false;
  isTL: boolean = false;
  isAdmin: boolean = false;

  // Sidebar state
  sidebarCollapsed: boolean = false;
  currentView: string = 'brands'; // Default view
  activeView: string = 'brabds';

  // Search
  searchText: string = '';
  searchCategory: string = 'all';

  // Selected entities
  selectedBrand: any = null;
  selectedCar: any = null;
  selectedCarto: any = null;

  // Data arrays
  allBrands: Brand[] = [];
  allCars: any[] = [];
  allCartos: any[] = [];
  displayedBrands: Brand[] = [];
  displayedCars: any[] = [];
  displayedCartos: any[] = [];

  // Pagination for brands
  currentBrandPage: number = 1;
  brandsPerPage: number = 9;
  totalBrands: number = 0;

  // Pagination for cars
  currentCarPage: number = 1;
  carsPerPage: number = 10;
  totalCars: number = 0;

  // Pagination for cartos
  currentCartoPage: number = 1;
  cartosPerPage: number = 10;
  totalCartos: number = 0;

  // Expanded brand tracking
  expandedBrandId: number | null = null;

  // expandedBrandId!: number;
  selectedCarId!: number;

  // 
  carSearchText: string = '';

  // 
  isButtonDisabled: boolean = false;

  @Output() cartoSelected: EventEmitter<any> = new EventEmitter();
  @Output() carSelected: EventEmitter<any> = new EventEmitter();
  @Output() cartoUpdated: EventEmitter<void> = new EventEmitter<void>();


  constructor(
    private workspaceService: WorkspaceService,
    private usersService: UsersService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isManager = this.usersService.isManager();
    this.isTL = this.usersService.isTL();
    this.isAdmin = this.usersService.isAdmin();
    this.loadBrands();
    this.updateDisplayedCars();
  }

  // Toggle sidebar
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
  
  disableButtonTemporarily() {
    this.isButtonDisabled = true;
    setTimeout(() => {
      this.isButtonDisabled = false;
    }, 3000); // 3 sec
    }

  // Set active view
  setActiveView(view: string): void {
    this.activeView = view;

    switch (view) {
      case 'brands':
        this.navigateToBrands();
        break;
      case 'cars':
        if (this.selectedBrand) {
          this.navigateToCars(this.selectedBrand);
        } else {
          this.loadAllCars();
        }
        break;
      case 'cartos':
        if (this.selectedCar) {
          this.navigateToCartos(this.selectedCar);
        } else {
          this.loadAllCartos();
        }
        break;
      case 'families':
        if (this.selectedCarto) {
          this.selectCarto(this.selectedCarto);
        } else {
          this.navigateToBrands();
        }
        break;
    }
  }

  // Navigation methods
  navigateToBrands(): void {
    this.currentView = 'brands';
    this.selectedCar = null;
    this.selectedCarto = null;
    this.expandedBrandId = null;
    this.loadBrands();
  }

  navigateToCars(brand: any): void {
    this.currentView = 'brands'; // Keep in brands view but show cars
    this.selectedBrand = brand;
    this.selectedCar = null;
    this.selectedCarto = null;
    this.expandedBrandId = brand.id;
    this.loadCars(brand.id);
  }

  navigateToCartos(car: any): void {
    this.currentView = 'brands'; // Keep in brands view but show cartos
    this.selectedCar = car;
    this.carSelected.emit(car); // Emit car selected event
    this.selectedCarto = null;
    this.loadCartos(car.id);
  }

  isRefreshing: boolean = false;

  refreshCurrentView(): void {
    this.isRefreshing = true;

    // Determine which data to refresh based on the current view and selection
    switch (this.currentView) {
      case 'brands':
        if (this.expandedBrandId !== null && this.selectedBrand) {
          // If a brand is expanded, refresh its cars
          this.loadCars(this.expandedBrandId);
        } else {
          // Otherwise refresh all brands
          this.loadBrands();
        }
        break;
      case 'cars':
        if (this.selectedBrand) {
          this.loadCars(this.selectedBrand.id);
        } else {
          this.loadAllCars();
        }
        break;
      case 'cartos':
        if (this.selectedCar) {
          this.loadCartos(this.selectedCar.CODE_VEH);
        } else {
          this.loadAllCartos();
        }
        break;
    }

    // Reset search text on refresh
    this.searchText = '';
    this.carSearchText = '';
  }

  // Toggle brand expansion
  toggleBrandExpansion(brand: any, event: Event): void {
    event.stopPropagation();

    if (this.expandedBrandId === brand.id) {
      // Collapse the brand if the user clicks again
      this.expandedBrandId = null;
      this.selectedBrand = null;
      this.selectedCar = null;
      this.selectedCarto = null;
      this.carSelected.emit(null); // Clear selected car
    } else {
      // Collapse the brand if the user clicks again
      this.expandedBrandId = brand.id;
      console.log('Brand ID', this.expandedBrandId);
      this.selectedBrand = brand;
      this.loadCars(brand.id);
    }
  }

  // Check if brand is expanded
  isBrandExpanded(brand: any): boolean {
    return this.expandedBrandId === brand.id;
  }

  // Load data methods
  loadBrands(): void {
    this.workspaceService
      .getBrandsPaginated(this.currentBrandPage - 1, this.brandsPerPage)
      .subscribe(
        (response: any) => {
          this.allBrands = response.content.map((brand: any) => ({
            id: brand.CODMAR,
            name: brand.NOMMAR,
            logos: [CAR_LOGOS[brand.NOMMAR] || ''],
          }));
          // Sort brands alphabetically by name
          // this.allBrands.sort((a, b) => a.name.localeCompare(b.name));
          this.displayedBrands = [...this.allBrands];
          this.totalBrands = response.totalItems;
          this.isRefreshing = false; // Turn off refreshing state
          console.log(response.totalItems);
        },
        (error: any) => {
          console.error('Error loading brands:', error);
          this.isRefreshing = false; // Turn off refreshing state on error
        }
      );
  }

  loadCars(brandId?: number): void {
    if (!brandId) {
      console.error('Brand ID is required to load cars.');
      return;
    }

    this.workspaceService.getCarsByBrand(brandId).subscribe(
      (response: any) => {
        this.allCars = response;
        this.displayedCars = [...this.allCars];
        this.cdr.detectChanges(); // Force change detection
        this.isRefreshing = false; // Turn off refreshing state
        console.log('Loaded cars:', this.allCars)
      },
      (error: any) => {
        console.error('Error loading cars:', error);
        this.isRefreshing = false; // Turn off refreshing state on error
      }
    );
  }

  loadAllCars(): void {
    this.currentView = 'cars';
    this.selectedBrand = null;
    this.loadCars();
  }

  loadCartos(carId?: number): void {
    if (!carId) {
      console.error('Car ID is required to load cartographies.', carId);
      return;
    }

    this.workspaceService.getCartosByCar(carId).subscribe(
      (response: any) => {
        console.log('Loaded cartographies:', response);
        this.allCartos = response;
        this.displayedCartos = [...this.allCartos];

        // Automatically select the first cartography if available
        if (this.displayedCartos && this.displayedCartos.length > 0) {
          console.log('Auto-selecting first carto:', this.displayedCartos[0]);
          this.selectCarto(this.displayedCartos[0]);
        } else {
          console.log('No cartographies available to select');
          this.selectedCarto = null;
          this.cartoSelected.emit(null);
        }

        this.cdr.detectChanges(); // Force change detection
      },
      (error: any) => {
        console.error('Error loading cartographies:', error);
      }
    );
  }

  loadAllCartos(): void {
    this.currentView = 'cartos';
    this.selectedCar = null;
    this.loadCartos();
  }

  // Selection methods
  selectBrand(brand: any): void {
    this.selectedBrand = brand;
    this.navigateToCars(brand);
    this.displayLimit = 10; // Reset display limit when changing brands
    this.updateDisplayedCars();
  }

  selectCar(car: any, event: Event): void {
    event.stopPropagation();
    console.log('Car selected:', car);
    this.selectedCar = car;
    this.selectedCarId = car.CODE_VEH;
    console.log('Car ID:', car.CODE_VEH);
    this.carSelected.emit(car); // Emit the selected car
    this.selectedCarto = null; // Clear previous selection
    this.loadCartos(car.CODE_VEH);
  }

  selectCarto(carto: any) {
    console.log('Selecting cartography:', carto);
    this.selectedCarto = carto;
    this.cartoSelected.emit(carto);
  }

  // Handle carto updates from details component
  onCartoUpdated(): void {
    if (this.selectedCar) {
      this.loadCartos(this.selectedCar.id);
    }
    this.cartoUpdated.emit();
  }

  // Search methods
  applySearch(): void {
    const searchTextLower = this.searchText.toLowerCase();

    switch (this.currentView) {
      case 'brands':
        this.displayedBrands = this.allBrands.filter((brand) =>
          brand.name.toLowerCase().includes(searchTextLower)
        );
        break;
      case 'cars':
        this.displayedCars = this.allCars.filter((car) =>
          car.model.toLowerCase().includes(searchTextLower)
        );
        break;
      case 'cartos':
        this.displayedCartos = this.allCartos.filter((carto) =>
          carto.name.toLowerCase().includes(searchTextLower)
        );
        break;
    }
    console.log('Current view:', this.currentView);
  }

  applyCarSearch() {
    const searchTextLower = this.carSearchText.toLowerCase();
    this.displayedCars = this.allCars.filter((car) =>
      car.NOMVEH?.toLowerCase().includes(searchTextLower)
    );
  }

  // CRUD operations for brands
  addBrand(): void {
    const dialogRef = this.dialog.open(BrandFormDialogComponent, {
      width: '500px',
      data: { mode: 'add' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.workspaceService.createBrand(result).subscribe(
          () => {
            this.loadBrands();
          },
          (error: any) => {
            if (error.status === 409) {
              console.error('Brand already exists:', error.message);
              this.dialog.open(DialogComponent, {
                width: '400px',
                data: {
                  message: 'The brand name already exists.',
                },
              });
            } else {
              console.error('Error creating brand:', error);
            }
          }
        );
      }
    });
  }

  errorMessage: string | undefined;

  showError(mess: string): void {
    this.errorMessage = mess;
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }

  editBrand(brand: any, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(BrandFormDialogComponent, {
      width: '500px',
      data: { mode: 'edit', brand: { ...brand } },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.workspaceService.updateBrand(brand.id, result).subscribe(
          () => {
            this.loadBrands();
          },
          (error: any) => {
            console.error('Error updating brand:', error);
          }
        );
      }
    });
  }

  deleteBrand(brand: any, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Brand',
        message: `Are you sure you want to delete ${brand.NOMMAR}? This will also delete all associated cars and cartographies.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.workspaceService.deleteBrand(brand.id).subscribe(
          () => {
            if (this.selectedBrand && this.selectedBrand.id === brand.id) {
              this.selectedBrand = null;
              this.selectedCar = null;
              this.selectedCarto = null;
              this.expandedBrandId = null;
            }
            this.loadBrands();
          },
          (error: any) => {
            console.error('Error deleting brand:', error);
          }
        );
      }
    });
  }

  // CRUD operations for cars
  addCar(event: Event): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(CarFormDialogComponent, {
      width: '500px',
      data: {
        mode: 'add',
        brandId: this.expandedBrandId,
        brandName: this.selectedBrand?.NOMMAR,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const brandId = this.expandedBrandId;
        if (brandId === null) {
          console.error('Brand ID is missing.');
          return;
        } else {
          this.workspaceService.createCar(brandId, result).subscribe(
            () => {
              this.loadCars(this.selectedBrand?.id);
            },
            (error: any) => {
              if (error.status === 409) {
                // Show the DialogComponent for duplicate car model error
                this.dialog.open(DialogComponent, {
                  width: '400px',
                  data: {
                    message: 'The car model already exists for this brand.',
                  },
                });
              } else {
                // Show DialogComponent for general errors
                this.dialog.open(DialogComponent, {
                  width: '400px',
                  data: {
                    message:
                      'An error occurred while creating the car. Please try again.',
                  },
                });
              }
            }
          );
        }
      }
    });
  }

  editCar(car: any, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(CarFormDialogComponent, {
      width: '500px',
      data: {
        mode: 'edit',
        car: { ...car },
        brandId: this.selectedBrand?.id,
        brandName: this.selectedBrand?.NOMMAR,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.workspaceService.updateCar(car.id, result).subscribe(
          () => {
            this.loadCars(this.selectedBrand?.id);
          },
          (error: any) => {
            console.error('Error updating car:', error);
          }
        );
      }
    });
  }

  deleteCar(car: any, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Car',
        message: `Are you sure you want to delete ${car.model}? This will also delete all associated cartographies.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.workspaceService.deleteCar(car.id).subscribe(
          () => {
            if (this.selectedCar && this.selectedCar.id === car.id) {
              this.selectedCar = null;
              this.selectedCarto = null;
            }
            this.loadCars(this.selectedBrand?.id);
          },
          (error: any) => {
            console.error('Error deleting car:', error);
          }
        );
      }
    });
  }

  // Helper methods
  getTotalEcus(carto: any): number {
    if (!carto.families) return 0;

    return carto.families.reduce((total: number, family: any) => {
      return total + (family.ecus ? family.ecus.length : 0);
    }, 0);
  }

  // Pagination methods for brands
  onBrandPageChange(page: number): void {
    this.currentBrandPage = page;
    this.loadBrands();
  }

  getBrandPages(): number[] {
    const totalPages = this.getTotalBrandPages();
    const visiblePages = 5;
    const pages: number[] = [];

    let startPage = Math.max(
      1,
      this.currentBrandPage - Math.floor(visiblePages / 2)
    );
    let endPage = Math.min(totalPages, startPage + visiblePages - 1);

    if (endPage - startPage + 1 < visiblePages) {
      startPage = Math.max(1, endPage - visiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  getTotalBrandPages(): number {
    return Math.ceil(this.totalBrands / this.brandsPerPage);
  }

  // Pagination methods for cars
  onCarPageChange(page: number): void {
    this.currentCarPage = page;
    this.loadCars(this.selectedBrand?.id);
  }

  getCarPages(): number[] {
    const totalPages = this.getTotalCarPages();
    const visiblePages = 5;
    const pages: number[] = [];

    let startPage = Math.max(
      1,
      this.currentCarPage - Math.floor(visiblePages / 2)
    );
    let endPage = Math.min(totalPages, startPage + visiblePages - 1);

    if (endPage - startPage + 1 < visiblePages) {
      startPage = Math.max(1, endPage - visiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  getTotalCarPages(): number {
    return Math.ceil(this.totalCars / this.carsPerPage);
  }

  // Pagination methods for cartos
  onCartoPageChange(page: number): void {
    this.currentCartoPage = page;
    this.loadCartos(this.selectedCar?.id);
  }

  getCartoPages(): number[] {
    const totalPages = this.getTotalCartoPages();
    const visiblePages = 5;
    const pages: number[] = [];

    let startPage = Math.max(
      1,
      this.currentCartoPage - Math.floor(visiblePages / 2)
    );
    let endPage = Math.min(totalPages, startPage + visiblePages - 1);

    if (endPage - startPage + 1 < visiblePages) {
      startPage = Math.max(1, endPage - visiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  getTotalCartoPages(): number {
    return Math.ceil(this.totalCartos / this.cartosPerPage);
  }

  // Entry number calculations for pagination info
  getFirstEntryNumber(type: string = 'brands'): number {
    switch (type) {
      case 'brands':
        return (this.currentBrandPage - 1) * this.brandsPerPage + 1;
      case 'cars':
        return (this.currentCarPage - 1) * this.carsPerPage + 1;
      case 'cartos':
        return (this.currentCartoPage - 1) * this.cartosPerPage + 1;
      default:
        return 1;
    }
  }

  getLastEntryNumber(type: string = 'brands'): number {
    switch (type) {
      case 'brands':
        return Math.min(
          this.currentBrandPage * this.brandsPerPage,
          this.totalBrands
        );
      case 'cars':
        return Math.min(this.currentCarPage * this.carsPerPage, this.totalCars);
      case 'cartos':
        return Math.min(
          this.currentCartoPage * this.cartosPerPage,
          this.totalCartos
        );
      default:
        return 1;
    }
  }

  // Add these properties to your component class
  public displayLimit: number = 10; // Initial number of cars to display
  public isLoadingMore: boolean = false;
  public hasMoreCars: boolean = false;

  // Add this method to update displayed cars
  updateDisplayedCars() {
    if (!this.selectedBrand || !this.selectedBrand.cars) {
      this.displayedCars = [];
      this.hasMoreCars = false;
      return;
    }

    const allCars = this.selectedBrand.cars;
    this.displayedCars = allCars.slice(0, this.displayLimit);
    this.hasMoreCars = allCars.length > this.displayLimit;
  }

  // Add this method to load more cars
  loadMoreCars() {
    if (!this.selectedBrand || this.isLoadingMore) return;

    this.isLoadingMore = true;

    //(remove in production)
    setTimeout(() => {
      this.displayLimit += 10; // Increase the display limit
      this.updateDisplayedCars();
      this.isLoadingMore = false;
    }, 500); // Simulated delay of 500ms
  }
}
