import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsersService } from '../../users.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.scss'],
})
export class EmailVerificationComponent implements OnInit {
  isLoading = true;
  isSuccess = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private readonly userService: UsersService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      if (token) {
        this.verifyEmail(token);
      }
    });
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const response = await this.userService.verifyEmail(token);
      this.isLoading = false;
      this.isSuccess = true;

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    } catch (error: any) {
      this.isLoading = false;
      this.errorMessage =
        error?.error?.message ||
        'Error verifying email. The token may be invalid or expired.';
    }
  }

  async resendVerification(): Promise<void> {
    const email = prompt('Please enter your email address:');
    if (email) {
      this.isLoading = true;

      try {
        await this.userService.resendVerification(email);
        this.isLoading = false;
        alert('Verification email sent successfully. Please check your inbox.');
      } catch (error) {
        this.isLoading = false;
        alert('Failed to resend verification email. Please try again later.');
      }
    }
  }
}
