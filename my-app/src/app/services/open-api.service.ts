import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {mergeMap, Observable, of} from 'rxjs';
import { environment } from '../../environments/environment';

export interface TicketData {
  id: number;
  event: any;
  plan: any
  // Додайте інші властивості квитка, які вам потрібні
}

@Injectable({
  providedIn: 'root'
})
export class OpenApiService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getUserInfo(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `${localStorage.getItem('token')}`
    });
    console.log(localStorage.getItem('token'));

    return this.http.get<any>(`${this.apiUrl}/users/me`, { headers: headers });
  }

  getEventInfo(id: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `${localStorage.getItem('token')}`
    });

    return this.http.get<any>(`${this.apiUrl}/hotels/${id}`, { headers: headers });
  }

  updateUserProfile(userData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `${localStorage.getItem('token')}`
    });
    console.log(localStorage.getItem('token'));

    return this.http.patch<any>(`${this.apiUrl}/users/me`, userData, { headers: headers });
  }

  searchHotels(): Observable<any> {
    const headers = new HttpHeaders({
    'Authorization': `${localStorage.getItem('token')}`
  });
    return this.http.get<any>(`${this.apiUrl}/hotels`, { headers: headers });
  }

  buyTicket(ticketInfo: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `${localStorage.getItem('token')}`
    });
    return this.http.post<any>(`${this.apiUrl}/tickets/request-payment`, ticketInfo, { headers: headers });
  }

  getVerification(ticket_id: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `${localStorage.getItem('token')}`
    });

    return this.http.get<any>(`${this.apiUrl}/tickets/${ticket_id}/check-verification`, { headers: headers });
  }

  checkPayment(ticket_id: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `${localStorage.getItem('token')}`
    });

    return this.http.post<any>(`${this.apiUrl}/tickets/${ticket_id}/check-payment`, {}, { headers: headers });
  }

  sortEvents(sort_by: string, sort_direction: string): Observable<any> {
    // Створення параметрів URL з переданими значеннями сортування
    let params = new HttpParams()
      .set('sort_by', sort_by)
      .set('sort_direction', sort_direction);

    return this.http.post<any>(`${this.apiUrl}/events/search`, {},{ params });
  }

  getUserAvatar(userData: any): string | undefined {
    // Перевірити, чи avatar_id користувача не null
    if (userData.avatar_id !== null) {
      return `${this.apiUrl}/HHB/avatars/${userData.avatar_id}.jpg`;
    } else {
      return undefined;
    }
  }

  getEventImage(id: any): string | undefined {
    if (id !== null) {
      return `${this.apiUrl}/HHB/events/${id}.jpg`;
    } else {
      return undefined;
    }
  }

  getEventPhoto(event: any): string {
    // Перевірка, чи image_id події не null
    if (event.image_id !== null) {
      // Якщо image_id не null, виконайте запит для отримання URL фотографії
      return `${this.apiUrl}/HHB//${event.image_id}.jpg`;
    } else {
      // Якщо image_id null, поверніть порожній результат
      return "";
    }
  }

  updateUserAvatar(avatarData: string, password: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `${localStorage.getItem('token')}`
    });

    const requestBody = {
      avatar: avatarData,
      password: password
    };

    return this.http.patch<any>(`${this.apiUrl}/users/me`, requestBody, { headers: headers });
  }

  getUserPaymentMethods(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `${localStorage.getItem('token')}`
    });
    // Виконайте запит GET до API для отримання методів оплати користувача
    return this.http.get(`${this.apiUrl}/users/me/payment`, { headers: headers });
  }



  getUserTickets() : Observable<TicketData[]> {
    const headers = new HttpHeaders({
      'Authorization': `${localStorage.getItem('token')}`
    });
    // Виконайте запит GET до API для отримання методів оплати користувача
    return this.http.get<TicketData[]>(`${this.apiUrl}/tickets`, { headers: headers });
  }
}
