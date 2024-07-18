// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3001/api/users';
  private authStatus = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token');
    this.authStatus.next(!!token);
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(username: string, password: string): Observable<{ token: string }> {
    const payload = { username, password };
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, payload).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.authStatus.next(true);
      })
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
  
  logout(): void {
    localStorage.removeItem('token');
    this.authStatus.next(false);
  }

  
  updateUser(user: any): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  const formData = new FormData();
  Object.keys(user).forEach(key => formData.append(key, user[key]));

  return this.http.put(`${this.apiUrl}/profile`, formData, { headers });
}

  getUserProfile(): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/profile`, { headers });
  }

  getAuthStatus(): Observable<boolean> {
    return this.authStatus.asObservable();
  }
}
