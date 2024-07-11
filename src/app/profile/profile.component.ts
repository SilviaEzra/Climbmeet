import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';

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

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUserProfile();
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

  saveProfile() {
    this.authService.updateUser(this.user).subscribe(
      response => {
        console.log('Perfil actualizado', response);
        this.isEditing = false;
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
