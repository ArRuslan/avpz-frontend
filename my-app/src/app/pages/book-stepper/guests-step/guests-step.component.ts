import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-guests-step',
  templateUrl: './guests-step.component.html',
  styleUrls: ['./guests-step.component.scss']
})
export class GuestsStepComponent implements OnInit {
  @Output() moveToNextStep = new EventEmitter<{ number: number, guests: number }>();
  adults = 0;
  children = 0;
  rooms = 0;
  promoCode = '';

  constructor() { }

  ngOnInit(): void { }


  updateGuestsAndRooms(): void {
    const totalGuests = +this.adults + +this.children;
    console.log(`Guests: ${totalGuests}`);
    console.log(`Rooms: ${this.rooms}`);
    console.log(`Promo Code: ${this.promoCode}`);
    this.moveToNextStep.emit({ number: 1, guests: totalGuests})
  }
}
