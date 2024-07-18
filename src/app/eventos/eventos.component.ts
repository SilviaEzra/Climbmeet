import { Component, AfterViewInit, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { EventService, Event } from './event.service';
import { AuthService } from '../auth.service';
import { GoogleMapsModule } from '@angular/google-maps';
import { ProfileComponent } from '../profile/profile.component';
import { LoginComponent } from '../login/login.component';
import { EventosCreadosComponent } from '../eventos-creados/eventos-creados.component';

declare var bootstrap: any;
declare var google: any;

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    GoogleMapsModule,
    ProfileComponent,
    LoginComponent,
    EventosCreadosComponent
  ],
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.css']
})
export class EventosComponent implements AfterViewInit, OnInit {
  newEvent: Event = {
    id: 0,
    title: '',
    description: '',
    location: '',
    address: '',
    date: '',
    image: 'assets/event-placeholder.jpg'
  };

  selectedFile: File | null = null;
  isEditing: boolean = false;

  center: google.maps.LatLngLiteral = { lat: 41.3851, lng: 2.1734 }; // Coordenadas de Barcelona
  zoom = 12; // Ajusta el nivel de zoom según tus necesidades
  markerOptions: google.maps.MarkerOptions = { draggable: true };
  markerPosition: google.maps.LatLngLiteral = this.center;

  private autocomplete: any;
  private geocoder: any;

  isLoggedIn: boolean = false;
  showProfileFlag: boolean = false;
  showEventsFlag: boolean = true;
  showLoginFlag: boolean = false;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private ngZone: NgZone,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.getAuthStatus().subscribe(status => {
      this.isLoggedIn = status;
    });
  }

  ngAfterViewInit() {
    const modalElement = document.getElementById('createEventModal');
    if (modalElement) {
      modalElement.addEventListener('shown.bs.modal', () => {
        this.initAutocomplete();
        this.geocoder = new google.maps.Geocoder();
      });
    }
  }

  initAutocomplete() {
    const input = document.getElementById('location') as HTMLInputElement;
    if (google.maps.places) {
      this.autocomplete = new google.maps.places.Autocomplete(input);

      this.autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          const place = this.autocomplete.getPlace();
          if (place.geometry) {
            const location = place.geometry.location;
            if (location && typeof location.lat === 'function' && typeof location.lng === 'function') {
              const lat = location.lat();
              const lng = location.lng();
              if (!isNaN(lat) && !isNaN(lng)) {
                this.newEvent.location = `${lat},${lng}`;
                this.newEvent.address = place.formatted_address;
                this.center = { lat, lng };
                this.zoom = 15;
                this.markerPosition = this.center;
              } else {
                console.error('Invalid location data');
              }
            } else {
              console.error('Invalid location object');
            }
          } else {
            console.error('No geometry found for the selected place');
          }
        });
      });
    } else {
      console.error('Google Maps Places API not available');
    }
  }

  performSearch() {
    const address = (document.getElementById('location') as HTMLInputElement).value;
    if (this.geocoder) {
      this.geocoder.geocode({ address: address }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          if (location && typeof location.lat === 'function' && typeof location.lng === 'function') {
            const lat = location.lat();
            const lng = location.lng();
            if (!isNaN(lat) && !isNaN(lng)) {
              this.ngZone.run(() => {
                this.newEvent.location = `${lat},${lng}`;
                this.newEvent.address = results[0].formatted_address;
                this.center = { lat, lng };
                this.zoom = 15;
                this.markerPosition = this.center;
              });
            } else {
              console.error('Invalid location data');
            }
          } else {
            console.error('Invalid location object');
          }
        } else {
          console.error('Geocode was not successful for the following reason: ' + status);
        }
      });
    } else {
      console.error('Geocoder not initialized');
    }
  }

  onMapClick(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      const location = event.latLng.toJSON();
      if (location && !isNaN(location.lat) && !isNaN(location.lng)) {
        this.newEvent.location = `${location.lat},${location.lng}`;
        this.markerPosition = location;

        if (this.geocoder) {
          this.geocoder.geocode({ location: location }, (results: any, status: any) => {
            if (status === 'OK' && results[0]) {
              this.ngZone.run(() => {
                this.newEvent.address = results[0].formatted_address;
              });
            } else {
              console.error('Geocode was not successful for the following reason: ' + status);
            }
          });
        }
      } else {
        console.error('Invalid location data');
      }
    }
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('title', this.newEvent.title);
    formData.append('description', this.newEvent.description);
    formData.append('location', this.newEvent.location);
    formData.append('address', this.newEvent.address);
    formData.append('date', this.newEvent.date);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    if (this.isEditing) {
      this.eventService.updateEvent(this.newEvent.id, formData).subscribe(() => {
        this.resetForm();
        this.closeModal();
        this.showEvents();
      }, error => {
        console.error('Error updating event:', error);
      });
    } else {
      this.eventService.addEvent(formData).subscribe(() => {
        this.resetForm();
        this.closeModal();
        this.showEvents();
      }, error => {
        console.error('Error creating event:', error);
      });
    }
  }

  resetForm() {
    this.newEvent = { id: 0, title: '', description: '', location: '', address: '', date: '', image: 'assets/event-placeholder.jpg' };
    this.selectedFile = null;
    this.isEditing = false;
  }

  closeModal() {
    const modalElement = document.getElementById('createEventModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      modalInstance.hide();
    }
  }

  openEditModal(event: Event) {
    this.newEvent = { ...event };
    this.isEditing = true;
    this.openModal();
  }

  openModal() {
    const modalElement = document.getElementById('createEventModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  handleCreateEventClick() {
    if (this.isLoggedIn) {
      const modalElement = document.getElementById('createEventModal');
      if (modalElement) {
        const modalInstance = new bootstrap.Modal(modalElement);
        modalInstance.show();
      }
    } else {
      const warningModalElement = document.getElementById('warningModal');
      if (warningModalElement) {
        const warningModalInstance = new bootstrap.Modal(warningModalElement);
        warningModalInstance.show();
      }
    }
  }

  deleteEvent(id: number) {
    this.eventService.deleteEvent(id).subscribe(() => {
      this.showEvents();
    }, error => {
      console.error('Error deleting event:', error);
    });
  }

  showProfile() {
    if (this.isLoggedIn) {
      this.showProfileFlag = true;
      this.showEventsFlag = false;
      this.showLoginFlag = false;
    } else {
      this.showLogin();
    }
  }

  showLogin() {
    this.showProfileFlag = false;
    this.showEventsFlag = false;
    this.showLoginFlag = true;
  }

  showEvents() {
    this.showProfileFlag = false;
    this.showEventsFlag = true;
    this.showLoginFlag = false;
  }
}
