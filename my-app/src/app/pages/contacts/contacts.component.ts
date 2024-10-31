import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
  email: string = '';
  name: string = '';
  message: string = '';

  constructor() { }

  ngOnInit(): void {
  }

  onSubmit(): void {
    const subject = encodeURIComponent(this.name);
    const body = encodeURIComponent(this.message);
    const mailtoUrl = `mailto:HHBteam@gmail.com?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;

    this.name = '';
    this.email = '';
    this.message = '';
  }
}
