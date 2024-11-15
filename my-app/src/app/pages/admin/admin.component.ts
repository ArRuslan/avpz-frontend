import { Component } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  activeSection: string = 'Hotels'; // Початковий розділ

  // Функція для зміни активного розділу
  setActiveSection(section: string) {
    this.activeSection = section;
  }
}
