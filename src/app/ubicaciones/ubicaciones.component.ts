import { Component, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';

interface Location {
  id: number;
  title: string;
  type: string; // Tipo de escalada
  position: {
    lat: number;
    lng: number;
  };
}

@Component({
  selector: 'app-ubicaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, GoogleMapsModule],
  templateUrl: './ubicaciones.component.html',
  styleUrls: ['./ubicaciones.component.css']
})
export class UbicacionesComponent implements AfterViewInit {
  center: google.maps.LatLngLiteral = { lat: 37.7749, lng: -122.4194 };
  zoom = 8;
  locations: Location[] = [
    { id: 1, title: 'Escalada Deportiva 1', type: 'deportiva', position: { lat: 37.7749, lng: -122.4194 } },
    { id: 2, title: 'Boulder Indoor 1', type: 'boulder indoor', position: { lat: 37.8044, lng: -122.2711 } },
    { id: 3, title: 'Boulder Outdoor 1', type: 'boulder outdoor', position: { lat: 37.6879, lng: -122.4702 } },
    { id: 4, title: 'Escalada Clásica 1', type: 'clásica', position: { lat: 37.7338, lng: -122.4467 } },
    { id: 5, title: 'Rocódromo 1', type: 'rocódromo', position: { lat: 37.7542, lng: -122.4471 } },
    { id: 6, title: 'Rocódromo Gratuito 1', type: 'rocódromo gratuito', position: { lat: 37.7641, lng: -122.4622 } }
  ];
  filteredLocations: Location[] = this.locations;
  selectedTypes: Set<string> = new Set(['deportiva', 'boulder indoor', 'boulder outdoor', 'clásica', 'rocódromo', 'rocódromo gratuito']);

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit() {
    // Cualquier inicialización adicional
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
}
