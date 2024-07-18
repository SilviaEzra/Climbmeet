// src/app/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = {};
  isEditing: boolean = false;
  selectedFile: File | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { message: 'Es necesario iniciar sesión para acceder al perfil' } });
    } else {
      this.loadUserProfile();
    }
  }

  loadUserProfile() {
    this.authService.getUserProfile().subscribe(
      response => {
        this.user = response;
      },
      error => {
        console.error('Error al cargar el perfil del usuario', error);
      }
    );
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  saveProfile() {
    const formData: any = { ...this.user };
    if (this.selectedFile) {
      formData.profileImage = this.selectedFile;
    }

    this.authService.updateUser(formData).subscribe(
      response => {
        console.log('Perfil actualizado', response);
        this.isEditing = false;
        this.loadUserProfile(); // Recargar el perfil actualizado
      },
      error => {
        console.error('Error al actualizar el perfil', error);
      }
    );
  }

  editProfile() {
    this.isEditing = true;
  }
}
