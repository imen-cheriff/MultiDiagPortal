import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { UsersService } from '../../users.service';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { WorkspaceService } from '../../workspace.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent implements OnInit {
user: any;
fullName: string | null = localStorage.getItem('fullName');
firstName: string | null = localStorage.getItem('firstName');
private authSubscription: Subscription | null = null;

  constructor(private readonly userService: UsersService,
    private readonly router: Router,
    private workspaceService: WorkspaceService

  ){}

  isAuthenticated:boolean = false;
  isAdmin:boolean = false;
  isUser:boolean = false;
  isManager:boolean = false;
  isTL:boolean = false
  pendingCount: number = 0

  logout(): void {
    this.userService.logOut();
  }

  ngOnInit(): void {
    this.updateAuthState();
    
    // Subscribe to auth state changes
    this.authSubscription = this.userService.authState$.subscribe(() => {
      this.updateAuthState();
    });

    this.workspaceService.getPendingCartosCount().subscribe((count: any) => {
      this.pendingCount = count;
    });

    // Subscribe to changes in the pending cartos count
    this.workspaceService.updatePendingCount(this.pendingCount);
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private updateAuthState(): void {
    this.isAuthenticated = this.userService.isAuthenticated();
    this.isAdmin = this.userService.isAdmin();
    this.isUser = this.userService.isUser();
    this.isManager = this.userService.isManager();
    this.isTL = this.userService.isTL();
    
    // Update user info from storage
    this.fullName = localStorage.getItem('fullName');
    this.firstName = localStorage.getItem('firstName');
  }
  
}

