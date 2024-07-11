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

  center: google.maps.LatLngLiteral = { lat: 37.7749, lng: -122.4194 };
  zoom = 8;
  markerOptions: google.maps.MarkerOptions = { draggable: true };
  markerPosition: google.maps.LatLngLiteral = this.center;

  private autocomplete: any;
  private geocoder: any;

  isLoggedIn: boolean = false;
  showProfileFlag: boolean = false;
  showEventsFlag: boolean = true; // Mostrar eventos por defecto
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
            this.newEvent.location = `${location.lat()},${location.lng()}`;
            this.newEvent.address = place.formatted_address;
            this.center = { lat: location.lat(), lng: location.lng() };
            this.zoom = 15;
            this.markerPosition = this.center;
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
          this.ngZone.run(() => {
            this.newEvent.location = `${location.lat()},${location.lng()}`;
            this.newEvent.address = results[0].formatted_address;
            this.center = { lat: location.lat(), lng: location.lng() };
            this.zoom = 15;
            this.markerPosition = this.center;
          });
        } else {
          console.error('Geocode was not successful for the following reason: ' + status);
        }
      });
    }
  }

  onMapClick(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      const location = event.latLng.toJSON();
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
    }
  }

  onSubmit() {
    this.eventService.addEvent({ ...this.newEvent }).subscribe(() => {
      this.newEvent = { id: 0, title: '', description: '', location: '', address: '', date: '', image: 'assets/event-placeholder.jpg' };

      const modalElement = document.getElementById('createEventModal');
      if (modalElement) {
        const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
        modalInstance.hide();
      }
      this.showEvents();
    }, error => {
      console.error('Error creating event:', error);
    });
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
