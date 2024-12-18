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

    return this.http.get<any>(`${this.apiUrl}/user/info`, { headers: headers });
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

    return this.http.patch<any>(`${this.apiUrl}/user/info`, userData, { headers: headers });
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

  makeReservation(reservation: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `${localStorage.getItem('token')}`
    });

    return this.http.post<any>(`${this.apiUrl}/bookings`, reservation, { headers: headers });
  }

  getBooking(bookingId: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `${localStorage.getItem('token')}`
    });

    return this.http.get<any>(`${this.apiUrl}/bookings/${bookingId}`, { headers: headers });
  }

  cancelReservation(id: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `${localStorage.getItem('token')}`
    });
    return this.http.post<any>(`${this.apiUrl}/bookings/${id}/cancel`, {booking_id: id}, { headers: headers });
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

    return this.http.post<any>(`${this.apiUrl}/bookings/${ticket_id}/check-payment`, {}, { headers: headers });
  }

  sortEvents(sort_by: string, sort_direction: string): Observable<any> {
    // Створення параметрів URL з переданими значеннями сортування
    let params = new HttpParams()
      .set('sort_by', sort_by)
      .set('sort_direction', sort_direction);

    return this.http.post<any>(`${this.apiUrl}/hotels/search`, {},{ params });
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
      return `${this.apiUrl}/HHB/hotels/${id}.jpg`;
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
    return this.http.get(`${this.apiUrl}/users/me/payment`, { headers: headers });
  }


  getUserReservations() : Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `${localStorage.getItem('token')}`
    });
    // Виконайте запит GET до API для отримання методів оплати користувача
    return this.http.get<any[]>(`${this.apiUrl}/bookings`, { headers: headers });
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('Current token:', token);
    if (!token || this.isTokenExpired(token)) {
      console.warn('Token is missing or expired.');
  }
    return new HttpHeaders({
      'Authorization': `${token}`,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    });
  }

  private isTokenExpired(token: string): boolean {
    try {
        const payloadBase64 = token.split('.')[1];
        const payload = JSON.parse(atob(payloadBase64));
        const exp = payload.exp * 1000;
        return Date.now() > exp;
    } catch (error) {
        console.error('Error decoding token:', error);
        return true;
    }
}

getHotels(page: number = 1): Observable<any> {
  const headers = this.getHeaders();

  const params = new HttpParams().set('page', page.toString());

  return this.http.get<any>(`${this.apiUrl}/hotels`, { headers, params });
}

  getHotelRooms(hotelId: number): Observable<any> {
    const headers = this.getHeaders();
    console.log('Requesting rooms for hotel:', hotelId, 'with headers:', headers);
    console.log('Requesting rooms with hotel ID:', hotelId);
    return this.http.get<any>(`${this.apiUrl}/admin/hotels/${hotelId}/rooms`, { headers });
  }

  createHotel(hotelData: any): Observable<any> {
    const headers = this.getHeaders();
    console.log('Token in createHotel:', headers.get('Authorization'));
    console.log('Headers in createHotel:', headers.keys());
    console.log('Hotel Data in createHotel:', hotelData);
    return this.http.post<any>(`${this.apiUrl}/admin/hotels`, hotelData, { headers });
  }

  updateHotel(hotelId: number, hotelData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.patch<any>(`${this.apiUrl}/admin/hotels/${hotelId}`, hotelData, { headers });
  }

  private getAdminId(): number | null {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const payloadBase64 = token.split('.')[1]; // Отримуємо середню частину токена
            const payload = JSON.parse(atob(payloadBase64)); // Декодуємо Base64
            console.log('Decoded payload:', payload); // Логування всього payload
            return payload?.admin_id || null; // Замість `admin_id` перевіряйте правильне поле
        } catch (error) {
            console.error('Error decoding token:', error);
        }
    }
    return null;
}

  deleteHotelAdmin(hotelId: number): Observable<any> {
    const headers = this.getHeaders();
    const adminId = this.getAdminId();
    if (!adminId) {
        throw new Error('Admin ID is missing');
    }
    return this.http.delete<any>(`${this.apiUrl}/admin/hotels/${hotelId}/admins/${adminId}`, { headers });
}

createRoom(hotelId: number, roomData: any): Observable<any> {
  const headers = this.getHeaders();
  console.log('Token in createRoom:', headers.get('Authorization'));
  return this.http.post<any>(`${this.apiUrl}/admin/hotels/${hotelId}/rooms`, roomData, { headers });
}

updateRoom(roomId: number, roomData: any): Observable<any> {
  const headers = this.getHeaders();
  console.log('Updating room with ID:', roomId);
  return this.http.patch<any>(`${this.apiUrl}/admin/rooms/${roomId}`, roomData, { headers });
}

deleteRoom(roomId: number): Observable<any> {
  const headers = this.getHeaders();
  console.log('Token in deleteRoom:', headers.get('Authorization'));
  return this.http.delete<any>(`${this.apiUrl}/admin/rooms/${roomId}`, { headers });
}

getAdmins(hotelId: number): Observable<any[]> {
  const headers = this.getHeaders();
  return this.http.get<any[]>(`${this.apiUrl}/admin/hotels/${hotelId}/admins`, { headers });
}

createAdmin(hotelId: number, adminData: any): Observable<any> {
  const headers = this.getHeaders();
  return this.http.post<any>(`${this.apiUrl}/admin/hotels/${hotelId}/admins`, adminData, { headers });
}

updateAdmin(adminId: number, adminData: any): Observable<any> {
  const headers = this.getHeaders();
  return this.http.patch<any>(`${this.apiUrl}/admin/admins/${adminId}`, adminData, { headers });
}

deleteAdmin(adminId: number): Observable<any> {
  const headers = this.getHeaders();
  return this.http.delete<any>(`${this.apiUrl}/admin/admins/${adminId}`, { headers });
}

getAdminsByHotel(hotelId: number): Observable<any> {
  const headers = this.getHeaders();
  return this.http.get<any>(`${this.apiUrl}/admin/hotels/${hotelId}/admins`, { headers });
}

getUsers(role: number, page: number = 1, pageSize: number = 50): Observable<UserResponse> {
  const headers = this.getHeaders();
  const params = new HttpParams()
    .set('role', role.toString())
    .set('page', page.toString())
    .set('page_size', pageSize.toString());

  return this.http.get<UserResponse>(`${this.apiUrl}/admin/users`, { headers, params });
}

searchUserByEmail(email: string): Observable<any> {
  const headers = this.getHeaders();
  const params = new HttpParams().set('email', email);

  return this.http.get<any>(`${this.apiUrl}/admin/users/search`, { headers, params });
}

getUserById(userId: number): Observable<any> {
  const headers = this.getHeaders();
  return this.http.get<any>(`${this.apiUrl}/admin/users/${userId}`, { headers });
}

getRoomsByType(type: string): Observable<any> {
  const headers = this.getHeaders();
  const params = new HttpParams().set('type', type);
  return this.http.get<any>(`${this.apiUrl}/rooms`, { headers, params });
}

searchHotels2(params: any = {}): Observable<any> {
  const headers = this.getHeaders();
  const httpParams = new HttpParams({ fromObject: params });

  console.log('Sending GET request to:', `${this.apiUrl}/hotels`);
  console.log('With params:', params);
  console.log('With headers:', headers);

  return this.http.get<any>(`${this.apiUrl}/hotels`, { headers, params: httpParams });
}

enableMfa(password: string, key: string, code: string): Observable<any> {
  const headers = this.getHeaders();
  const body = {
    password,
    key,
    code
  };
  return this.http.post<any>(`${environment.apiBaseUrl}/user/mfa/enable`, body, { headers });
}

disableMfa(password: string, code: string): Observable<any> {
  const headers = this.getHeaders();
  const body = {
    password,
    code
  };
  return this.http.post<any>(`${environment.apiBaseUrl}/user/mfa/disable`, body, { headers });
}

getAdminBookings(booking_id: string): Observable<any> {
  const headers = this.getHeaders();
  return this.http.get<any>(`${environment.apiBaseUrl}/admin/bookings/${booking_id}`, { headers });
}

getBookings(page: number = 1): Observable<any> {
  const headers = this.getHeaders();
  const params = new HttpParams().set('page', page.toString());

  return this.http.get<any>(`${this.apiUrl}/bookings`, { headers, params });
}
}

interface UserResponse {
  count: number;
  result: User[];
}

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: number;
  mfa_enabled: boolean;
}


