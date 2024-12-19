import { Component, OnInit, Input } from '@angular/core';
import { differenceInDays, format } from 'date-fns';
import { IPayPalConfig } from "ngx-paypal";
import { OpenApiService } from "../../../services/open-api.service";
import { Router } from "@angular/router";

interface Room {
  name: string;
  id: number;
  hotel_id: number;
  description: string;
  maxOccupancy: number;
  bedType: string;
  imageUrl: string;
  rates: Rate[];
  price: number;
  availability: string;
}

interface Rate {
  type: string;
  price: number;
  details: string;
}

@Component({
  selector: 'app-confirmation-step',
  templateUrl: './confirmation-step.component.html',
  styleUrls: ['./confirmation-step.component.scss']
})
export class ConfirmationStepComponent implements OnInit {
  @Input() room!: Room;
  @Input() checkIn!: Date;
  @Input() checkOut!: Date;
  @Input() guests!: number;

  nights: number = 0;
  taxes: number = 0;
  total: number = 0;
  subtotal: number = 0;
  formattedCheckIn: string = '';
  formattedCheckOut: string = '';
  public payPalConfig?: IPayPalConfig;
  userData: any = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    city: '',
    postal_code: '',
  };
  bookingId: number | null = null; // ID созданного букинга
  orderId: string | null = null; // Payment ID для PayPal
  isBookingCreated: boolean = false; // Показывать кнопки оплаты?

  constructor(private openApiService: OpenApiService, private router: Router) {}

  ngOnInit(): void {
    this.calculateReservationDetails();
    this.loadUserData();
  }

  loadUserData(): void {
    this.openApiService.getUserInfo().subscribe(
      (response) => {
        this.userData = response;
      },
      (error) => {
        console.error('Failed to load user data', error);
      }
    );
  }

  calculateReservationDetails(): void {
    this.nights = differenceInDays(this.checkOut, this.checkIn);
    this.subtotal = this.nights * this.room.price;
    this.taxes = this.subtotal * 0.15;
    this.total = this.subtotal + this.taxes;

    this.formattedCheckIn = format(this.checkIn, 'eee MMM dd yyyy');
    this.formattedCheckOut = format(this.checkOut, 'eee MMM dd yyyy');
  }

  bookRoom(): void {
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const payload = {
      room_id: this.room.id,
      hotel_id: this.room.hotel_id,
      check_in: formatDate(new Date(this.checkIn)),
      check_out: formatDate(new Date(this.checkOut)),
    };

    this.openApiService.makeReservation(payload).subscribe(
      (response) => {
        this.bookingId = response.booking_id; // Получаем ID букинга
        this.orderId = response.payment_id; // Получаем payment_id для PayPal
        this.isBookingCreated = true; // Показываем кнопки оплаты
        this.initPayPalConfig(); // Инициализируем PayPal с новым order_id
      },
      (error) => {
        console.error('Failed to create booking', error);
        alert('Error: ' + error.message || 'Failed to create booking');
      }
    );
  }

  private initPayPalConfig(): void {
    this.payPalConfig = {
      currency: 'USD',
      clientId: 'sb',
      createOrderOnServer: () => {
        return new Promise<string>((resolve) => {
          if (this.orderId) {
            resolve(this.orderId); // Передаем order_id в PayPal
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

        if(this.bookingId) {
          const interval = setInterval(() => {
            this.openApiService.getBooking(this.bookingId as number).subscribe(
              response => {
                if(response.status > 0) {
                  console.log('Booking confirmed: ' + JSON.stringify(response));
                  clearInterval(interval);
                  resolve(true);
                  this.router.navigate(['/bookings', this.bookingId]);
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
}
