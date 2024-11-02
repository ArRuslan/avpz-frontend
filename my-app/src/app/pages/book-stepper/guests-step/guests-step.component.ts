import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-guests-step',
  templateUrl: './guests-step.component.html',
  styleUrls: ['./guests-step.component.scss']
})
export class GuestsStepComponent implements OnInit {
  @Output() moveToNextStep = new EventEmitter<number>();
  adults = 0;
  children = 0;
  rooms = 0;
  promoCode = '';

  constructor() { }

  ngOnInit(): void { }


  updateGuestsAndRooms(): void {
    console.log(`Guests: ${this.adults} adults, ${this.children} children`);
    console.log(`Rooms: ${this.rooms}`);
    console.log(`Promo Code: ${this.promoCode}`);
    this.moveToNextStep.emit(1)
  }
}
