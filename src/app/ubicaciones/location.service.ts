import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = 'http://localhost:3001/api/location';

  constructor(private http: HttpClient) { }

  getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.apiUrl}/all`);
  }

  addLocation(location: Location): Observable<Location> {
    return this.http.post<Location>(`${this.apiUrl}/add`, location);
  }
}
