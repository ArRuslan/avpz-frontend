import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-book-stepper',
  templateUrl: './book-stepper.component.html',
  styleUrls: ['./book-stepper.component.scss']
})
export class BookStepperComponent implements OnInit {

  selectedStep: number = 0
  constructor() { }

  ngOnInit(): void {
  }

  changeStep(step: number) {
    this.selectedStep = step;
  }
}
