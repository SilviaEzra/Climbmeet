import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login(loginForm: NgForm) {
    if (loginForm.invalid) {
      console.error('Form is invalid');
      return;
    }

    const credentials = {
      username: this.username,
      password: this.password
    };

    this.authService.login(credentials.username, credentials.password).subscribe(
      response => {
        console.log('Login exitoso', response);
        // Redirigir al usuario al componente de perfil después de un inicio de sesión exitoso
        this.router.navigate(['/eventos/profile']);
      },
      error => {
        console.error('Error al iniciar sesión', error);
        // Manejar el error del login
      }
    );
  }
}
