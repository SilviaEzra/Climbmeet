// event.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  address: string;
  date: string;
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'http://localhost:3001/api/events';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  addEvent(event: FormData): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, event, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  updateEvent(id: number, event: FormData): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, event, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError('Something bad happened; please try again later.');
  }
}
