import { Component, OnInit, Input } from '@angular/core';
import { differenceInDays, format } from 'date-fns';
import {ICreateOrderRequest, IPayPalConfig} from "ngx-paypal";
import {OpenApiService} from "../../../services/open-api.service";
import {tap} from "rxjs";
import {Router} from "@angular/router";

interface Room {
  name: string;
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


  constructor(
    private openApiService: OpenApiService, private router: Router) {}

  ngOnInit(): void {
    this.calculateReservationDetails();
    this.initConfig();
    this.loadUserData();
  }

  loadUserData(): void {
    this.openApiService.getUserInfo().pipe(
      tap((response) => {
        this.userData = response; // Сохраняем данные пользователя
      })
    ).subscribe();
  }


  calculateReservationDetails(): void {
    // Calculate nights between check-in and check-out
    this.nights = differenceInDays(this.checkOut, this.checkIn);

    // Calculate total and taxes
    this.subtotal = this.nights * this.room.price;
    this.taxes = this.subtotal * 0.15;
    this.total = this.subtotal + this.taxes;

    // Format dates for display
    this.formattedCheckIn = format(this.checkIn, 'eee MMM dd yyyy');
    this.formattedCheckOut = format(this.checkOut, 'eee MMM dd yyyy');
  }

  private initConfig(): void {
    this.payPalConfig = {
      currency: 'EUR',
      clientId: 'sb',
      createOrderOnClient: (data) => <ICreateOrderRequest>{
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'EUR',
              value: '9.99',
              breakdown: {
                item_total: {
                  currency_code: 'EUR',
                  value: '9.99'
                }
              }
            },
            items: [
              {
                name: 'Enterprise Subscription',
                quantity: '1',
                category: 'DIGITAL_GOODS',
                unit_amount: {
                  currency_code: 'EUR',
                  value: '9.99',
                },
              }
            ]
          }
        ]
      },
      advanced: {
        commit: 'true'
      },
      style: {
        label: 'paypal',
        layout: 'vertical'
      },
      onApprove: (data, actions) => {
        console.log('onApprove - transaction was approved, but not authorized', data, actions);
        actions.order.get().then((details: any) => {
          console.log('onApprove - you can get full order details inside onApprove: ', details);
        });
      },
      onClientAuthorization: (data) => {
        console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);
      },
      onCancel: (data, actions) => {
        console.log('OnCancel', data, actions);
      },
      onError: err => {
        console.log('OnError', err);
      },
      onClick: (data, actions) => {
        console.log('onClick', data, actions);
      },
    };
  }

  bookRoom() {
    const formatDate = (date: Date) =>
      date.toISOString().split('T')[0];

    const payload = {
      room_id: 2,
      check_in: formatDate(new Date(this.checkIn)),
      check_out: formatDate(new Date(this.checkOut)),
    };

    this.openApiService.makeReservation(payload).subscribe((res) => {
      this.router.navigate(['/profile']);
      console.log(res);
    });
  }

}
