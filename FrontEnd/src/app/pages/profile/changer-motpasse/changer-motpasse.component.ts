import { Component, ElementRef, OnInit } from '@angular/core';
import { UsersService } from '../../../users.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PasswordStrengthBarComponent } from '../../../components/password-strength-bar/password-strength-bar.component';

@Component({
  selector: 'app-changer-motpasse',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, PasswordStrengthBarComponent],
  templateUrl: './changer-motpasse.component.html',
  styleUrl: './changer-motpasse.component.scss',
})
export class ChangerMotpasseComponent implements OnInit {
  newPassword: string = '';
  confirmPassword: string = '';
  userId: any;
  passwordChangeSuccess: boolean | null = null;
  passwordsDoNotMatch: boolean = false;
  messageVisible: boolean = false;
  isSubmitting: boolean = false;
  touched: any;

  constructor(
    private userService: UsersService, 
    private readonly route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.getCurrentUser();
  }

  getCurrentUser() {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        if (user && user.id) {
          this.userId = user.id;
          console.log('User ID retrieved:', this.userId);
        } else {
          console.error('Invalid user object or missing ID:', user);
        }
      },
      error: (error) => {
        console.error("Error retrieving current user", error);
      },
    });
  }

  changePassword(): void {
    // Check if passwords match
    if (this.newPassword !== this.confirmPassword) {
      this.passwordsDoNotMatch = true;
      this.passwordChangeSuccess = false; // Indicate failure
      console.error('Passwords do not match.');
      return;
    } else {
      this.passwordsDoNotMatch = false;
    }
  
    // Validate password requirements
    if (!this.newPasswordIsValid() || !this.passwordIsStrongEnough()) {
      this.passwordChangeSuccess = false; // Indicate failure
      console.error('Password does not meet the required criteria.');
      return;
    }
  
    // Check if user ID is available
    if (!this.userId) {
      this.passwordChangeSuccess = false; // Indicate failure
      console.error('Unable to change password. User ID not defined.');
      return;
    }
  
    // Set submitting state
    this.isSubmitting = true;
    this.passwordChangeSuccess = null; // Reset success state
  
    // Call service to change password
    this.userService
      .changePassword(this.userId, {
        newPassword: this.newPassword,
        confirmPassword: this.confirmPassword,
      })
      .subscribe({
        next: (resp) => {
          this.passwordChangeSuccess = true; // Indicate success
          this.isSubmitting = false;
  
          // Trigger success alert with fade-out effect
          this.triggerSuccessAlert();
  
          // Reset form after successful password change
          this.resetForm();
        },
        error: (error) => {
          this.passwordChangeSuccess = false; // Indicate failure
          this.isSubmitting = false;
  
          // Trigger error alert with fade-out effect
          this.triggerErrorAlert();
  
          console.error('Error changing password:', error);
        },
      });
  }
  
  // Trigger the success alert with fade-out effect
  triggerSuccessAlert(): void {
    setTimeout(() => {
      this.passwordChangeSuccess = null; // Clear success message after 3 seconds
    }, 1000);
  }
  
  // Trigger the error alert with fade-out effect
  triggerErrorAlert(): void {
    setTimeout(() => {
      this.passwordChangeSuccess = null; // Clear error message after 3 seconds
    }, 2000);
  }
  
  // Reset the form fields
  resetForm(): void {
    setTimeout(() => {
      this.newPassword = '';
      this.confirmPassword = '';
      this.passwordsDoNotMatch = false;
    }, 1000); // Reset after 3 seconds to allow user to see the success message
  }

  newPasswordIsValid(): boolean {
    return this.newPassword.length >= 4 || this.newPassword.length <= 50;
  }

  passwordIsStrongEnough(): boolean {
    const hasUppercase = /[A-Z]/.test(this.newPassword);
    const hasLowercase = /[a-z]/.test(this.newPassword);
    const hasNumber = /[0-9]/.test(this.newPassword);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      this.newPassword
    );
    return hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  }

    // Check if the password contains at least one uppercase letter
    isUppercasePresent(password: string): boolean {
      return /[A-Z]/.test(password);
    }
  
    // Check if the password contains at least one lowercase letter
    isLowercasePresent(password: string): boolean {
      return /[a-z]/.test(password);
    }
  
    // Check if the password contains at least one number
    isNumberPresent(password: string): boolean {
      return /[0-9]/.test(password);
    }
  
    // Check if the password contains at least one special character
    isSpecialCharacterPresent(password: string): boolean {
      return /[!@#$%^&*(),.?":{}|<>]/.test(password);
    }
}