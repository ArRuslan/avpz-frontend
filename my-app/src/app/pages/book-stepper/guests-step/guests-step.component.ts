import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-guests-step',
  templateUrl: './guests-step.component.html',
  styleUrls: ['./guests-step.component.scss']
})
export class GuestsStepComponent implements OnInit {
  @Output() moveToNextStep = new EventEmitter<{ number: number, guests: number }>();

  adults: number = 0; 
  children: number = 0;
  rooms: number = 1;
  promoCode: string = '';

  constructor() {}

  ngOnInit(): void {}

  updateGuestsAndRooms(): void {
    const totalGuests = this.adults + this.children;
    console.log(`Guests: ${totalGuests}`);
    console.log(`Rooms: ${this.rooms}`);
    console.log(`Promo Code: ${this.promoCode}`);

    this.moveToNextStep.emit({ number: 1, guests: totalGuests });
  }

  addRoom(): void {
    if (this.rooms < 10) {
      this.rooms++;
      console.log(`Room added. Total rooms: ${this.rooms}`);
    } else {
      console.log('Maximum number of rooms reached.');
    }
  }
}
