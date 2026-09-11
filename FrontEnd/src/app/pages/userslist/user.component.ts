import {Component, HostBinding} from '@angular/core';
import { UserslistComponent } from './users-list.component';
import { UserDetailComponent } from './user-detail-component';
import { UsersService } from '../../users.service';


@Component({
  selector: 'app-user',
  standalone: true,
  imports: [UserslistComponent, UserDetailComponent],
  templateUrl: './user.component.html',
})
export class UserComponent {
   @HostBinding('class') cssClass = 'd-flex  h-100';

  constructor(private usersService: UsersService) {}
  selectedUserId: string | null = null;
  selectedUser: any;
  token: any;

  onUserSelected(user: any) {
    this.selectedUser = user;
  }

  onNewClicked() {
    this.selectedUser = null;
  }

  // onUserUpdated() {
  //   // Reload cartos if we have a selected car
  //   if (this.selectedUserId) {
  //     this.loadUsers(this.selectedUserId);
  //   }
  // }

  // loadUsers(userId: string) {
  //   this.usersService.getUserById(userId,this.token).subscribe(
  //     (cartos: any[]) => {
  //       this.availableCartos = cartos;

  //       // Auto-select the first cartography if available
  //       if (cartos && cartos.length > 0) {
  //         this.selectedCarto = cartos[0];
  //       } else {
  //         this.selectedCarto = null;
  //       }
  //     },
  //     (error: any) => {
  //       console.error('Error loading cartographies:', error);
  //       this.availableCartos = [];
  //       this.selectedCarto = null;
  //     }
  //   );
  // }

  
}
