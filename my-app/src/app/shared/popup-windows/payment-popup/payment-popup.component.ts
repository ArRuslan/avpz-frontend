import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {OpenApiService} from "../../../services/open-api.service";

declare global {
  interface Window {
    paypal: any;
  }
}

export interface Reservation {
  id: number;
  user_id: number;
  room_id: number;
  check_in: string;
  check_out: string;
  total_price: number;
  status: number;
  created_at: string;
  payment_id: string;
}

@Component({
  selector: 'app-payment-popup',
  templateUrl: './payment-popup.component.html',
  styleUrls: ['./payment-popup.component.scss']
})
export class PaymentPopupComponent implements OnInit {
  reservation!: Reservation;

  constructor(
    private dialogRef: MatDialogRef<PaymentPopupComponent>, private http: HttpClient, private openApiService: OpenApiService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.reservation = this.data.reservation;
    this.loadPayPalScript();
  }

  loadPayPalScript(): void {
    const script = document.createElement('script');
    script.src = "https://www.paypal.com/sdk/js?client-id=AUHPZ6xZAFKv6YDkPRsu72hz65WaIfkLABWsnsQ--BmsZK79U9KlqlmB1j5-4aBeCFigHRQVW4E-tYPA";
    script.onload = () => {
      if (window['paypal']) {
        window['paypal'].Buttons({
          createOrder: async (data: any, actions: any) => {
            return this.createOrder().subscribe({
              next: (response) => {
                if (response.payment_id) {
                  return response.payment_id;
                }
                throw new Error('Failed to create payment');
              }
            });
          },
          onApprove: async (data: any, actions: any) => {
            await this.checkPaymentStatus();
          },
          onError: (err: any) => {
            console.error('Error processing payment:', err);
          }
        }).render('#paypal-button-container');
      }
    };
    document.body.appendChild(script);
  }

  async checkPaymentStatus() {
    // Проверка статуса оплаты
    const intervalId = setInterval(() => {
      this.getBookingStatus().subscribe({
        next: (response) => {
          if (response.status !== 0) {
            clearInterval(intervalId);
            alert('Payment success');
            this.closePopup();
          }
        },
        error: (err) => {
          console.error('Error checking payment status:', err);
          clearInterval(intervalId);
        }
      });
    }, 10000); // Проверка каждые 10 секунд
  }
  

  // Метод для создания заказа на сервере
  createOrder(): Observable<any> {
    return this.openApiService.makeReservation(this.reservation);
  }

  // Метод для получения статуса оплаты
  getBookingStatus(): Observable<any> {
    return this.http.get<Reservation>(`${environment.apiBaseUrl}/bookings/`+this.reservation.id);
  }

  closePopup() {
    this.dialogRef.close();
  }
  
  protected readonly environment = environment;
}

