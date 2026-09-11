import { Component, HostBinding, ViewChild } from '@angular/core';
import { GroupCarDetailComponent } from './groupworkspace-details.component';
import { GroupCarslistComponent } from './groupworkspace-list.component';
import { WorkspaceService } from '../../workspace.service';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [GroupCarDetailComponent, GroupCarslistComponent],
  templateUrl: './groupworkspace.component.html',
})
export class GroupworkspaceComponent {
  @HostBinding('class') cssClass = 'd-flex h-100';
  @ViewChild('cartographyList') cartographyList!: GroupCarslistComponent;
  @ViewChild('carDetailComponent') carDetailComponent!: GroupCarDetailComponent;

  selectedCarto: any;
  availableCartos: any[] = [];
  selectedCarId: number | null = null;

  constructor(private workspaceService: WorkspaceService) {}

  onCartoSelected(carto: any) {
    this.selectedCarto = carto;
  }

  // onNewClicked() {
  //   this.selectedCarto = null;
  // }

  onCartoUpdated() {
    // Reload cartos if we have a selected car
    if (this.selectedCarId) {
      this.loadCartosForCar(this.selectedCarId);
    }
  }

  onCarSelected(car: any) {
    if (car) {
      console.log('CAR :', car);
      this.selectedCarId = car.CODE_VEH;
      this.loadCartosForCar(car.CODE_VEH);
    }
  }

  onCartoTabSelected(cartoId: number) {
    // Find the carto in available cartos
    const carto = this.availableCartos.find((c) => c.id === cartoId);
    if (carto) {
      this.selectedCarto = carto;
    }
  }

  loadCartosForCar(carId: number) {
    this.workspaceService.getCartosByCar(carId).subscribe(
      (cartos: any[]) => {
        this.availableCartos = cartos;

        // Auto-select the first cartography if available
        if (cartos && cartos.length > 0) {
          this.selectedCarto = cartos[0];
        } else {
          this.selectedCarto = null;
        }
      },
      (error: any) => {
        console.error('Error loading cartographies:', error);
        this.availableCartos = [];
        this.selectedCarto = null;
      }
    );
  }
}
