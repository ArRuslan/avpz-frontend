import {Component, OnInit} from '@angular/core';
import {differenceInDays, format} from "date-fns";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-book-stepper',
  templateUrl: './book-stepper.component.html',
  styleUrls: ['./book-stepper.component.scss']
})
export class BookStepperComponent implements OnInit {

  checkInDate: any;
  checkOutDate: any;
  selectedRoom: any;

  taxes: number = 0;
  total: number = 0;
  subtotal: number = 0;

  guests: any;
  selectedStep: number = 0;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.selectedRoom = {
        type: params['type'],
        price: +params['price'], // Преобразование в число
        id: +params['id'], // Преобразование в число
        hotel_id: +params['hotel_id'], // Преобразование в число
        available: params['available'] === 'true' // Преобразование в boolean
      };
      console.log(this.selectedRoom); // Ваш объект `room`
    });
  }

  changeStep(step: number) {
    this.selectedStep = step;
    if (step == 3) {
      this.calculateReservationDetails();
    }
  }

  selectGuests(event: any) {
    this.guests = event.guests;
    console.log(`Guests:`, this.guests);
    this.changeStep(event.number)
  }

  selectRoom(event: any) {
    this.selectedRoom = event.room;
    console.log(`Book room:`, this.selectedRoom);
    this.changeStep(event.number)
  }

  selectDate(event: any) {
    this.checkInDate = event.checkIn;
    this.checkOutDate = event.checkOut;
    console.log(`Check in date: ${event.checkIn}`);
    console.log(`Check out date: ${event.checkOut}`);
    this.changeStep(event.number)
  }

  calculateReservationDetails(): void {
    // Calculate total and taxes
    this.subtotal = differenceInDays(this.checkOutDate, this.checkInDate) * this.selectedRoom.price;
    this.taxes = this.subtotal * 0.15;
    this.total = this.subtotal + this.taxes;
  }

}
