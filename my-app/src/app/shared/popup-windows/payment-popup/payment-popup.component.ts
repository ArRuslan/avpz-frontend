import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { IPayPalConfig } from "ngx-paypal";
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
  public payPalConfig?: IPayPalConfig;

  constructor(
    private dialogRef: MatDialogRef<PaymentPopupComponent>, private http: HttpClient, private openApiService: OpenApiService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.reservation = this.data.reservation;
    this.initPayPalConfig();
  }

  private initPayPalConfig(): void {
    this.payPalConfig = {
      currency: 'USD',
      clientId: 'sb',
      createOrderOnServer: () => {
        return new Promise<string>((resolve) => {
          if (this.reservation.payment_id) {
            resolve(this.reservation.payment_id); // Передаем order_id в PayPal
          }
        });
      },
      advanced: {
        commit: 'true',
      },
      style: {
        label: 'paypal',
        layout: 'vertical',
      },
      onApprove: (data, actions) => {
        console.log('Transaction approved', data, actions);
        actions.order.get().then((details: any) => {
          console.log('Full order details:', details);
        });
      },
      authorizeOnServer: () => {
        return new Promise((resolve, reject) => {

        if(this.reservation.id) {
          const interval = setInterval(() => {
            this.openApiService.getBooking(this.reservation.id as number).subscribe(
              response => {
                if(response.status > 0) {
                  console.log('Booking confirmed: ' + JSON.stringify(response));
                  clearInterval(interval);
                  resolve(true);
                  this.closePopup();
                }
              },
              error => {
                console.error('Failed to fetch booking details', error);
              }
            );
          }, 3000);
        }

        });
      },
      /*onClientAuthorization: () => {
        if (this.bookingId) {
          this.openApiService.checkPayment(this.bookingId).subscribe(
            (response) => {
              alert('Booking confirmed: ' + JSON.stringify(response));
              this.router.navigate(['/bookings', this.bookingId]);
            },
            (error) => {
              console.error('Failed to fetch booking details', error);
            }
          );
        }
      },*/
      onCancel: (data, actions) => {
        console.log('Payment cancelled', data, actions);
      },
      onError: (err) => {
        console.error('Payment error', err);
      },
      onClick: (data, actions) => {
        console.log('PayPal button clicked', data, actions);
      },
    };
  }

  closePopup() {
    this.dialogRef.close();
  }
  
  protected readonly environment = environment;
}

