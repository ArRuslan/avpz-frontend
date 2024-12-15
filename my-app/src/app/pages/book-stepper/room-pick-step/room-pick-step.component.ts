import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';


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
  @Input() room: any;

  constructor() {}

  ngOnInit(): void {}

  bookRoom(room: any) {
    this.moveToNextStep.emit({number: 3, room: room})
  }
}
