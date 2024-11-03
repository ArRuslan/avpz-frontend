import {Component, EventEmitter, OnInit, Output} from '@angular/core';

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
  selector: 'app-room-pick-step',
  templateUrl: './room-pick-step.component.html',
  styleUrls: ['./room-pick-step.component.scss']
})
export class RoomPickStepComponent implements OnInit {
  @Output() moveToNextStep = new EventEmitter<{number: number, room: any}>();

  rooms: Room[] = [
    {
      name: 'Standard Two Queens',
      description: 'The Queen/Queen Guest Room features a sitting area with microwave, mini-fridge and free WiFi. Enjoy your favorite shows on the flat-screen TV.',
      maxOccupancy: 4,
      bedType: '2 Queen Bed',
      imageUrl: 'https://cdn.27.ua/sc--media--prod/default/b6/b6/d3/b6b6d38b-8022-45d8-a63c-a17226511cbc.jpg',
      rates: [
        { type: 'Best Available Rate', price: 141.00, details: 'Details' },
        { type: 'AAA Members Only', price: 126.90, details: 'Details' },
        { type: 'AARP Members Only', price: 126.90, details: 'Details' },
        { type: 'NC Resident Rate', price: 126.90, details: 'Details' },
      ],
      price: 141.00,
      availability: 'Available'
    },
    {
      name: 'ADA Standard Two Queens',
      description: 'The Queen/Queen Guest Room features a sitting area with microwave, mini-fridge and free WiFi. Enjoy your favorite shows on the flat-screen TV.',
      maxOccupancy: 4,
      bedType: '2 Queen Bed',
      imageUrl: 'https://images.prom.ua/4468299130_w600_h600_4468299130.jpg',
      rates: [
        { type: 'Best Available Rate', price: 141.00, details: 'Details' },
        { type: 'AAA Members Only', price: 126.90, details: 'Details' },
        { type: 'AARP Members Only', price: 126.90, details: 'Details' },
        { type: 'NC Resident Rate', price: 126.90, details: 'Details' },
      ],
      price: 141.00,
      availability: 'Only 1 Left'
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  bookRoom(room: any) {
    this.moveToNextStep.emit({number: 3, room: room})
  }
}
