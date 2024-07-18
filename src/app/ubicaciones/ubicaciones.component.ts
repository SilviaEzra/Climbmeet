import { Component, AfterViewInit, NgZone, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { HttpClient } from '@angular/common/http';

interface Location {
  id: number;
  name: string;
  type: string; // Tipo de escalada
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-ubicaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, GoogleMapsModule],
  templateUrl: './ubicaciones.component.html',
  styleUrls: ['./ubicaciones.component.css']
})
export class UbicacionesComponent implements AfterViewInit, OnInit {
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  center: google.maps.LatLngLiteral = { lat: 41.3851, lng: 2.1734 }; // Coordenadas de Barcelona
  zoom = 12; // Ajusta el nivel de zoom según tus necesidades
  locations: Location[] = [];
  filteredLocations: Location[] = [];
  selectedTypes: Set<string> = new Set(['deportiva', 'boulder indoor', 'boulder outdoor', 'clásica', 'rocódromo', 'rocódromo gratuito']);
  infoContent: string = '';

  iconUrlMap: { [key: string]: string } = {
    'deportiva': 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    'boulder indoor': 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
    'boulder outdoor': 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
    'clásica': 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
    'rocódromo': 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png',
    'rocódromo gratuito': 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png'
  };

  constructor(private ngZone: NgZone, private http: HttpClient) {}

  ngOnInit() {
    this.fetchLocations();
  }

  ngAfterViewInit() {
    // Cualquier inicialización adicional
  }

  fetchLocations() {
    this.http.get<Location[]>('http://localhost:3001/api/location/all').subscribe(
      data => {
        console.log('Fetched locations:', data);
        this.locations = data;
        this.filterLocations();
      },
      error => {
        console.error('Error fetching locations:', error);
      }
    );
  }

  toggleType(type: string) {
    if (this.selectedTypes.has(type)) {
      this.selectedTypes.delete(type);
    } else {
      this.selectedTypes.add(type);
    }
    this.filterLocations();
  }

  filterLocations() {
    this.filteredLocations = this.locations.filter(location => this.selectedTypes.has(location.type));
  }

  getLocationPosition(location: Location): google.maps.LatLngLiteral {
    return { lat: location.latitude, lng: location.longitude };
  }

  openInfoWindow(marker: MapMarker, location: Location) {
    this.infoContent = `
      <div>
        <h5>${location.name}</h5>
        <p>Type: ${location.type}</p>
        <p>Latitude: ${location.latitude}</p>
        <p>Longitude: ${location.longitude}</p>
      </div>
    `;
    this.infoWindow.open(marker);
  }
}
