// registro.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

declare var bootstrap: any;

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

  usernameExists: boolean = false;
  emailExists: boolean = false;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  register(registerForm: NgForm) {
    if (registerForm.invalid) {
      console.error('Form is invalid');
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

    this.authService.register(user).subscribe(
      response => {
        console.log('Registro exitoso', response);
        this.usernameExists = false;
        this.emailExists = false;
        this.errorMessage = '';
        this.showSuccessModal();
      },
      error => {
        console.error('Error al registrar', error);
        this.usernameExists = false;
        this.emailExists = false;
        this.errorMessage = '';

        if (error.error && error.error.msg) {
          this.errorMessage = error.error.msg;
        }

        if (this.errorMessage.includes('Username')) {
          this.usernameExists = true;
        } else if (this.errorMessage.includes('Email')) {
          this.emailExists = true;
        }
      }
    );
  }

  showSuccessModal() {
    const modalElement = document.getElementById('successModal');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  navigateToLogin() {
    const modalElement = document.getElementById('successModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
    this.router.navigate(['/login']);
  }
}
