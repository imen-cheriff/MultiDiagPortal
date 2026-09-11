import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './components/nav/nav.component';
import { UsersService } from './users.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(private userService: UsersService) {}
  
  ngOnInit(): void {
    // Check auth state on app initialization
    const isAuth = this.userService.isAuthenticated();
    // Optional: force navigation to home if authenticated
    if (isAuth && window.location.pathname === '/login') {
      window.location.href = '/home';
    }
  }
}