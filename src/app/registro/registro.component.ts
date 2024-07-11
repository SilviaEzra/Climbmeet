import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  username: string = '';
  password: string = '';
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  address: string = '';
  gender: string = '';
  climbingType: string = '';
  climbingLevel: string = '';

  constructor(private authService: AuthService) {}

  register() {
    if (!this.username || !this.password) {
      console.error('Username and Password are required');
      return;
    }

    const user = {
      username: this.username,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      address: this.address,
      gender: this.gender,
      climbingType: this.climbingType,
      climbingLevel: this.climbingLevel
    };

    console.log('Datos de registro enviados:', user);

    this.authService.register(user).subscribe(
      response => {
        console.log('Registro exitoso', response);
      },
      error => {
        console.error('Error al registrar', error);
      }
    );
  }
}
