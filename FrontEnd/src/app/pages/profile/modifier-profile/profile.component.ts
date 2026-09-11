import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '../../../users.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {


  profileInfo: any;
  profileForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isEditing: boolean = false;
  isSaving: boolean = false;
  profileImage: string | null = null;

  constructor(
    private readonly userService: UsersService,
    private readonly router: Router,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      phone: ['']
    });
  }

  async ngOnInit() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No Token Found");
      }

      this.profileInfo = await this.userService.getYourProfile(token);
      this.initializeForm();
    } catch (error: any) {
      this.showError(error.message);
    }
  }

  initializeForm() {
    if (this.profileInfo && this.profileInfo.user) {
      this.profileForm.patchValue({
        firstname: this.profileInfo.user.firstname,
        lastname: this.profileInfo.user.lastname,
        email: this.profileInfo.user.email,
        username: this.profileInfo.user.username,
        phone: this.profileInfo.user.phone || ''
      });
    }
  }

  toggleEditMode() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.initializeForm(); // Reset form to original values when canceling
    }
  }

  async saveProfile() {
    if (this.profileForm.invalid) {
      return;
    }

    this.isSaving = true;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No Token Found");
      }

      const updatedProfile = {
        ...this.profileForm.value,
        id: this.profileInfo.user.id
      };

      await this.userService.updateUser(this.profileInfo.user.id, updatedProfile, token);
      
      // Update local profile info
      this.profileInfo.user = {
        ...this.profileInfo.user,
        ...this.profileForm.value
      };
      
      this.showSuccess('Profile updated successfully');
      this.isEditing = false;
    } catch (error: any) {
      this.showError(error.message || 'Error updating profile');
    } finally {
      this.isSaving = false;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    const token = 'your-auth-token'; // Replace with actual token
  
    this.userService.uploadProfileImage(file, token,this.profileInfo.user.id).subscribe({
      next: (response) => console.log('Upload successful!', response),
      error: (error) => console.error('Upload failed!', error)
    });
  }
  

  // This would be implemented to actually upload the image to your server
  // async uploadProfileImage(file: File) {
  //   try {
  //     const token = localStorage.getItem('token');
  //     if (!token) {
  //       throw new Error("No Token Found");
  //     }
  
  //     // const formData = new FormData();
  //     // formData.append('file', file); // Use 'file' to match backend parameter
  
  //     // Call the service method (assuming it returns an Observable)
  //     this.userService.uploadProfileImage(file,token, this.profileInfo.user.id)
  //       .subscribe({
  //         next: () => this.showSuccess('Profile image updated successfully'),
  //         error: (error) => this.showError(error.message || 'Error uploading profile image')
  //       });
  
  //   } catch (error: any) {
  //     this.showError(error.message || 'Unexpected error occurred');
  //   }
  // }
  

  changePassword() {
    // Navigate to password change page or open modal
    this.router.navigate(['/change-password', this.profileInfo.user.id]);
  }

  // enable2FA() {
  //   // Navigate to 2FA setup page or open modal
  //   this.router.navigate(['/setup-2fa']);
  // }

  updateProfile(id: string) {
    this.router.navigate(['/admin/update', id]);
  }

  showError(message: string) {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => {
      this.errorMessage = '';
    }, 1000);
  }

  showSuccess(message: string) {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => {
      this.successMessage = '';
    }, 1000);
  }

}