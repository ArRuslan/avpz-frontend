import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { addMonths, format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

@Component({
  selector: 'app-date-picker-step',
  templateUrl: './date-picker-step.component.html',
  styleUrls: ['./date-picker-step.component.scss']
})
export class DatePickerStepComponent implements OnInit {
  @Output() moveToNextStep = new EventEmitter<{ number: number, checkIn: any, checkOut: any }>();
  currentDate = new Date();
  checkInDate: Date | null = null;
  checkOutDate: Date | null = null;
  months: { name: string; days: Date[] }[] = [];

  constructor() {}

  ngOnInit(): void {
    this.generateMonths();
  }

  generateMonths(): void {
    this.months = [0, 1].map(offset => {
      const monthDate = addMonths(this.currentDate, offset);
      return {
        name: format(monthDate, 'MMMM yyyy'),
        days: eachDayOfInterval({
          start: startOfMonth(monthDate),
          end: endOfMonth(monthDate)
        })
      };
    });
  }

  selectDate(day: Date): void {
    if (!this.checkInDate || (this.checkInDate && this.checkOutDate)) {
      this.checkInDate = day;
      this.checkOutDate = null;
    } else if (this.checkInDate && !this.checkOutDate && day > this.checkInDate) {
      this.checkOutDate = day;
    }
  }

  isSelected(day: Date): boolean {
    return <boolean>(
      (this.checkInDate && format(day, 'yyyy-MM-dd') === format(this.checkInDate, 'yyyy-MM-dd')) ||
      (this.checkOutDate && format(day, 'yyyy-MM-dd') === format(this.checkOutDate, 'yyyy-MM-dd'))
    );
  }

  isInRange(day: Date): boolean {
    return <boolean>(
      this.checkInDate &&
      this.checkOutDate &&
      day > this.checkInDate &&
      day < this.checkOutDate
    );
  }

  formatedDay(day: Date): string {
    return format(day, 'dd');
  }

  updateDates(): void {
    this.moveToNextStep.emit({number: 2, checkIn: this.checkInDate, checkOut: this.checkOutDate})
  }
}
