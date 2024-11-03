import { Component, OnInit, Input } from '@angular/core';
import { differenceInDays, format } from 'date-fns';

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

  constructor() {}

  ngOnInit(): void {
    this.calculateReservationDetails();
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
}
