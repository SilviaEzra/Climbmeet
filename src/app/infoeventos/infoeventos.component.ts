import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService, Event } from '../eventos/event.service';
import { GoogleMapsModule } from '@angular/google-maps';
import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-infoeventos',
  standalone: true,
  imports: [CommonModule, RouterModule, GoogleMapsModule],
  templateUrl: './infoeventos.component.html',
  styleUrls: ['./infoeventos.component.css']
})
export class InfoEventosComponent implements OnInit, AfterViewInit {
  event$: Observable<Event> = new Observable<Event>();
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  zoom = 15;
  markerPosition: google.maps.LatLngLiteral = this.center;

  constructor(private route: ActivatedRoute, private eventService: EventService, private ngZone: NgZone) {}

  ngOnInit() {
    this.event$ = this.route.paramMap.pipe(
      switchMap(params => {
        const eventId = Number(params.get('id'));
        if (isNaN(eventId)) {
          console.error('Invalid event ID');
          return of({} as Event); // Return an empty observable in case of error
        }
        return this.eventService.getEventById(eventId).pipe(
          catchError(error => {
            console.error('Error fetching event:', error);
            return of({} as Event); // Return an empty observable in case of error
          })
        );
      })
    );

    this.event$.subscribe(
      event => {
        if (event && event.location) {
          const [lat, lng] = event.location.split(',').map(Number);
          if (!isNaN(lat) && !isNaN(lng)) {
            this.center = { lat, lng };
            this.markerPosition = this.center;
          } else {
            console.error(`Invalid location format for event ${event.title}: ${event.location}`);
          }
        }
      },
      error => {
        console.error('Error subscribing to event:', error);
      }
    );
  }

  ngAfterViewInit() {
    // La inicialización del mapa se realiza en el template usando los bindings de Angular
  }
}
