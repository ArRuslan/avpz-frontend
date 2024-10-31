import {Component, OnInit} from '@angular/core';
import {OpenApiService} from "../../services/open-api.service";
import {ActivatedRoute} from "@angular/router";
import {interval, switchMap} from "rxjs";
import {ICreateOrderRequest} from "ngx-paypal";

export interface Event {
  id: number;
  name: string;
  description: string;
  category: string;
  city: string;
  start_time: number; // Unix timestamp
  end_time: number; // Unix timestamp
  image_id: string;
  location: Location;
  plans: Plan[];
}

export interface Location {
  name: string;
  longitude: number;
  latitude: number;
}

export interface Plan {
  id: number;
  name: string;
  price: number;
}

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {

  event!: Event;
  img: string | undefined = '';
  isApproved: any = null
  payPalConfig: any = null;
  ticketId: number|null = null;

  constructor(
    private route: ActivatedRoute,
    private openApiService: OpenApiService
  ) {
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('event_id');
    if (id) {
      this.openApiService.getEventInfo(+id).subscribe(
        (res) => {
          this.event = res;
          this.getEventImageUrl(this.event.image_id);
        }
      );
    }
    this.initConfig();
   // this.initConfig();
  }

  getEventImageUrl(imageId: string) {
    this.img = this.openApiService.getEventImage(imageId);
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  }

  calculateDuration(startTime: number, endTime: number): number {
    return (endTime - startTime) / 60;
  }

  buyTicket(plan: Plan) {
    const ticketInfo = {
      event_id: this.event.id,
      plan_id: plan.id,
      amount: 1
    }
    this.openApiService.buyTicket(ticketInfo).subscribe(
      (res) => {
        this.ticketId = res.ticket_id;
        this.isApproved = 0;
        interval(15000).pipe(
          switchMap(() => this.openApiService.getVerification(this.ticketId!))
        ).subscribe(
          (verificationRes) => {
              this.isApproved = verificationRes.payment_state;
            console.log(verificationRes);
          },
          (error) => {
            console.error('Verification request failed', error);
          }
        );
      },
      (error) => {
        console.error('Ticket purchase failed', error);
      }
    );
  }

  private initConfig(): void {
    this.payPalConfig = {
      currency: 'USD',
      clientId: 'sb',
      createOrderOnServer: async (data: any) => {
        return new Promise<string>((resolve) => {
          this.openApiService.getVerification(this.ticketId!).subscribe(
            (verificationRes) => {
              this.isApproved = verificationRes.payment_state;
              resolve(verificationRes.paypal_id);
            },
            (error) => {
              console.error('Verification request failed', error);
            }
          )
        });
      },
      advanced: {
        commit: 'true'
      },
      style: {
        label: 'paypal',
        layout: 'vertical'
      },
      onApprove: (data: any, actions: any) => {
        console.log('onApprove - transaction was approved, but not authorized', data, actions);
        actions.order.get().then((details: any) => {
          console.log('onApprove - you can get full order details inside onApprove: ', details);
        });
      },
      onClientAuthorization: (data: any) => {
        interval(2500).pipe(
          switchMap(() => this.openApiService.checkPayment(this.ticketId!))
        ).subscribe(
          (verificationRes) => {
            location.href = "/profile";
          },
          (error) => {
            console.error('Verification request failed', error);
          }
        );
      },
      onCancel: (data: any, actions: any) => {
        console.log('OnCancel', data, actions);
      },
      onError: (err: any) => {
        console.log('OnError', err);
      },
      onClick: (data: any, actions: any) => {
        console.log('onClick', data, actions);
      },
    };
  }


}
