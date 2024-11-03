import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-book-stepper',
  templateUrl: './book-stepper.component.html',
  styleUrls: ['./book-stepper.component.scss']
})
export class BookStepperComponent implements OnInit {

  checkInDate: any;
  checkOutDate: any;
  selectedRoom: any;
  guests: any;
  selectedStep: number = 0;
  constructor() { }

  ngOnInit(): void {
  }

  changeStep(step: number) {
    this.selectedStep = step;
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
}
