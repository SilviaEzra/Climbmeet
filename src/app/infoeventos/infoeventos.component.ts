import { Component, OnInit, NgZone, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService, Event } from '../eventos/event.service';
import { AuthService } from '../auth.service'; // Importa AuthService
import { GoogleMapsModule } from '@angular/google-maps';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

declare var bootstrap: any;
declare var google: any;

@Component({
  selector: 'app-infoeventos',
  standalone: true,
  imports: [CommonModule, RouterModule, GoogleMapsModule, FormsModule],
  templateUrl: './infoeventos.component.html',
  styleUrls: ['./infoeventos.component.css']
})
export class InfoEventosComponent implements OnInit, AfterViewInit {
  event$: Observable<Event> = new Observable<Event>();
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  zoom = 15;
  markerPosition: google.maps.LatLngLiteral = this.center;
  markerOptions: google.maps.MarkerOptions = { draggable: true };
  newEvent: Event = {
    id: 0,
    title: '',
    description: '',
    location: '',
    address: '',
    date: '',
    image: ''
  };
  
  isLoggedIn: boolean = false; // Añadir esta propiedad

  private autocomplete: any;
  private geocoder: any;
  selectedFile: File | null = null;
  eventIdToDelete: number | null = null;

  constructor(
    private route: ActivatedRoute, 
    private eventService: EventService, 
    private authService: AuthService, // Inyecta AuthService
    private ngZone: NgZone, 
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.getAuthStatus().subscribe(status => {
      this.isLoggedIn = status;
    });

    this.event$ = this.route.paramMap.pipe(
      switchMap(params => {
        const eventId = Number(params.get('id'));
        return this.eventService.getEventById(eventId);
      })
    );

    this.event$.subscribe(
      event => {
        if (event) {
          this.newEvent = { ...event };
          if (event.location) {
            const [lat, lng] = event.location.split(',').map(Number);
            if (!isNaN(lat) && !isNaN(lng)) {
              this.center = { lat, lng };
              this.markerPosition = this.center;
            } else {
              console.error(`Invalid location format for event ${event.title}: ${event.location}`);
            }
          }
        }
      },
      error => {
        console.error('Error fetching event:', error);
      }
    );
  }

  ngAfterViewInit() {
    const modalElement = document.getElementById('editEventModal');
    if (modalElement) {
      modalElement.addEventListener('shown.bs.modal', () => {
        this.initAutocomplete();
        this.geocoder = new google.maps.Geocoder();
      });
    }
  }

  initAutocomplete() {
    const input = document.getElementById('editLocation') as HTMLInputElement;
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
    const address = (document.getElementById('editLocation') as HTMLInputElement).value;
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

  showEditModal(event: Event) {
    const modalElement = document.getElementById('editEventModal');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
      this.populateEditForm(event);
    }
  }

  populateEditForm(event: Event) {
    this.newEvent = { ...event };
    if (event.location) {
      const [lat, lng] = event.location.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        this.center = { lat, lng };
        this.markerPosition = this.center;
      } else {
        console.error(`Invalid location format for event ${event.title}: ${event.location}`);
      }
    }
  }

  updateEvent() {
    const formData = new FormData();
    formData.append('title', this.newEvent.title);
    formData.append('description', this.newEvent.description);
    formData.append('location', this.newEvent.location);
    formData.append('address', this.newEvent.address);
    formData.append('date', this.newEvent.date);
    const fileInput = document.getElementById('editImage') as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      formData.append('image', fileInput.files[0]);
    }

    const eventId = this.newEvent.id;
    console.log('Updating event - ID:', eventId);
    console.log('Updating event - FormData:', formData);

    this.eventService.updateEvent(eventId, formData).subscribe(
      () => {
        const modalElement = document.getElementById('editEventModal');
        if (modalElement) {
          const modalInstance = bootstrap.Modal.getInstance(modalElement);
          modalInstance.hide();
        }
        console.log('Event updated successfully');
        this.router.navigate(['/eventos']);
      },
      error => {
        console.error('Error updating event:', error);
      }
    );
  }

  confirmDelete(eventId: number) {
    this.eventIdToDelete = eventId;
    const modalElement = document.getElementById('deleteEventModal');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  deleteEvent() {
    if (this.eventIdToDelete !== null) {
      this.eventService.deleteEvent(this.eventIdToDelete).subscribe(
        () => {
          console.log('Event deleted successfully');
          this.router.navigate(['/eventos']);
        },
        error => {
          console.error('Error deleting event:', error);
        }
      );
    }
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }
}
