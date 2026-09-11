import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../users.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;
  rememberMe = false;

  constructor(
    private readonly usersService: UsersService,
    private router: Router
  ) {}

  async handleSubmit() {
    if (!this.username || !this.password) {
      this.showError('Please enter both username and password');
      return;
    }

    this.isLoading = true;

    try {
      const response = await this.usersService.login(
        this.username,
        this.password
      );
      console.log('Login successful', response);

      if (response.role === 'ADMIN') {
        this.router.navigate(['/users']);
      } else {
        this.router.navigate(['/home']);
      }
    } catch (error) {
      console.error('Login failed', error);
      this.showError('Invalid username or password');
    } finally {
      this.isLoading = false;
    }
  }

  showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }
}
