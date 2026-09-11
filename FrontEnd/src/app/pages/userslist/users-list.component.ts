import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UsersService } from '../../users.service';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { UserDetailComponent } from './user-detail-component';

@Component({
  selector: 'app-userslist',
  standalone: true,
  imports: [CommonModule, FormsModule, MatPaginatorModule],
  templateUrl: './usersTable/table.component.html',
  styleUrls: ['./usersTable/table.component.scss'],
})
export class UserslistComponent implements OnInit {
  users: any[] = [];
  originalUsers: any[] = [];
  errorMessage: string = '';
  searchText: string = '';
  page: number = 0;
  pageSize: number = 12;
  totalRecords: number = 0;
  currentUser: [] = [];
  currentPage: number = 1;

  selectedRowIndex: number = -1;
  loading: any;

  constructor(private readonly userService: UsersService) {}

  @Output() userSelected: EventEmitter<any> = new EventEmitter();
  selectedUser: any;

  onUserSelected(user: any) {
    this.selectedUser = user;
  }

  cancelSelection(): void {
    this.selectedRowIndex = -1;
  }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.userService.getUsers(this.page, this.pageSize).subscribe(
      (data: any) => {
        this.users = data.content.sort((a: any, b: any) => a.id - b.id); // Sort users by ID in ascending order
        this.originalUsers = [...this.users]; // Keep a copy of the sorted users
        this.totalRecords = data.totalElements;
        this.users = this.users.filter((user: any) => user.role !== 'ADMIN');
        this.originalUsers = [...this.users]; // Update the originalUsers after filtering
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }

  selectUser(user: any) {
    this.userSelected.emit(user);
    this.selectedUser = user;
  }

  searchUser() {
    const searchLowerCase = this.searchText.toLowerCase();
    if (this.searchText) {
      this.users = this.originalUsers.filter((user) =>
        user.username?.toLowerCase().includes(searchLowerCase)
      );
    } else {
      this.getUsers();
    }
  }

  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.page = event.page;
    this.getUsers();
  }

  getPages(): number[] {
    const totalPages = Math.ceil(this.totalRecords / this.pageSize);
    return Array(totalPages)
      .fill(0)
      .map((x, i) => i + 1);
  }

  getFirstEntryNumber(): number {
    if (this.totalRecords === 0) {
      return 0;
    }
    return this.page * this.pageSize + 1;
  }

  getLastEntryNumber(): number {
    const lastEntryNumber = this.page * this.pageSize + this.pageSize;
    return Math.min(lastEntryNumber, this.totalRecords);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  get visiblePages(): (number | string)[] {
    const total = this.getTotalPages();
    const current = this.currentPage;
    const pages: (number | string)[] = [];

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    pages.push(1);

    if (current > 4) {
      pages.push('...');
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 3) {
      pages.push('...');
    }

    pages.push(total);
    return pages;
  }

  onPageNumberClick(page: number | string): void {
    if (typeof page === 'number') {
      this.onPageChange({ page: page - 1 });
    }
  }
}
