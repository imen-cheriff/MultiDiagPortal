import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private BASE_URL = `${environment.apiUrl}/api`;
  constructor(private http: HttpClient, private router: Router) {}

  private authStateSubject = new BehaviorSubject<boolean>(
    this.checkIfAuthenticated()
  );
  authState$ = this.authStateSubject.asObservable();

  private checkIfAuthenticated(): boolean {
    return localStorage.getItem('token') !== null;
  }

  getUsers(page: number = 0, size: number = 4): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.BASE_URL}/auth/paginateUsers`, {
      params,
    });
  }

  async login(username: string, password: string): Promise<any> {
    const url = `${this.BASE_URL}/auth/login`;
    try {
      const response = await this.http
        .post<any>(url, { username, password })
        .toPromise();
      console.log('Login response:', response);

      if (response && response.refreshToken && response.role) {
        localStorage.setItem('token', response.refreshToken);
        localStorage.setItem('role', response.role);
        localStorage.setItem('fullName', response.fullname);
        localStorage.setItem('firstName', response.firstname);

        // Store password change required flag
        if (response.passwordChangeRequired) {
          localStorage.setItem('passwordChangeRequired', 'true');
        } else {
          localStorage.removeItem('passwordChangeRequired');
        }

        // Update auth state
        this.authStateSubject.next(true);
      } else {
        console.warn('No accessToken or role in response');
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Method to verify email with token
  async verifyEmail(token: string): Promise<any> {
    const url = `${this.BASE_URL}/verification/verify?token=${token}`;
    try {
      const response = await this.http.get<any>(url).toPromise();
      return response;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  // Method to resend verification email
  async resendVerification(email: string): Promise<any> {
    const url = `${this.BASE_URL}/verification/resend`;
    try {
      const response = await this.http.post<any>(url, { email }).toPromise();
      return response;
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  }

  // Method to check if password change is required
  isPasswordChangeRequired(): boolean {
    return localStorage.getItem('passwordChangeRequired') === 'true';
  }

  // Method to change password (for first-time login or regular change)
  // changePassword(oldPassword: string, newPassword: string): Observable<any> {
  //   return this.http.post(`${this.BASE_URL}/auth/change-password`, {
  //     oldPassword,
  //     newPassword
  //   });
  // }

  async register(formData: any, token?: string): Promise<any> {
    const headersConfig: any = { 'Content-Type': 'application/json' };
    if (token) {
      headersConfig['Authorization'] = `Bearer ${token}`;
    }
    const headers = new HttpHeaders(headersConfig);

    try {
      const response = await this.http
        .post(`${this.BASE_URL}/auth/admin/register`, formData, { headers })
        .toPromise();
      console.log(response);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers(token: string): Promise<any> {
    const url = `${this.BASE_URL}/auth/admin/all-users`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    try {
      const response = this.http.get<any>(url, { headers }).toPromise();
      console.log(response);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getYourProfile(token: string): Promise<any> {
    const url = `${this.BASE_URL}/auth/profile`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    try {
      // Use await to resolve the promise
      const response = await this.http.get<any>(url, { headers }).toPromise();
      console.log(response);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(userId: string, token: string): Promise<any> {
    const url = `${this.BASE_URL}/auth/get-user/${userId}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    try {
      const response = this.http.get<any>(url, { headers }).toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(userId: number, token: string): Promise<any> {
    const url = `${this.BASE_URL}/auth/admin/delete/${userId}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    try {
      const response = this.http.delete<any>(url, { headers }).toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(userId: number, userData: any, token: string): Promise<any> {
    const url = `${this.BASE_URL}/auth/admin/update/${userId}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    try {
      const response = this.http
        .put<any>(url, userData, { headers })
        .toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }

  getCurrentUser(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http
      .get<any>(`${this.BASE_URL}/auth/current-user`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.error('User is not authenticated');
            // Redirect to login page or show an error message
          }
          return throwError(() => new Error('Failed to fetch current user.'));
        })
      );
  }

  uploadProfileImage(file: File, token: string, userId: number): Observable<any> {
    const url = `${this.BASE_URL}/auth/upload-profile-image/${userId}`;
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}` // Add authentication token if required
    });

    return this.http.post(url, formData, { headers });
  }

  changePassword(
    userId: number,
    changePasswordRequest: { newPassword: string; confirmPassword: string }
  ): Observable<any> {
    return this.http.post(
      `${this.BASE_URL}/change-password/${userId}`,
      changePasswordRequest,
      { withCredentials: true }
    );
  }

  getLoggedInUser(): string {
    const loggedInUser = localStorage.getItem('fullName') || 'defaultUser';
    return loggedInUser;
  }

  /***AUTHEMNTICATION METHODS */
  // Update logout method
  logOut(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('fullName');
    localStorage.removeItem('firstName');
    // Update auth state
    this.authStateSubject.next(false);

    // Navigate to login
    this.router.navigate(['/login']);
  }

  // Update your existing auth check methods to use the storage
  isAuthenticated(): boolean {
    return this.checkIfAuthenticated();
  }

  isAdmin(): boolean {
    if (typeof localStorage !== 'undefined') {
      const role = localStorage.getItem('role');
      return role === 'ADMIN';
    }
    return false;
  }

  isUser(): boolean {
    if (typeof localStorage !== 'undefined') {
      const role = localStorage.getItem('role');
      return role === 'USER';
    }
    return false;
  }

  isManager(): boolean {
    if (typeof localStorage !== 'undefined') {
      const role = localStorage.getItem('role');
      return role === 'MANAGER';
    }
    return false;
  }

  isTL(): boolean {
    if (typeof localStorage !== 'undefined') {
      const role = localStorage.getItem('role');
      return role === 'TEAM LEADER';
    }
    return false;
  }
}
