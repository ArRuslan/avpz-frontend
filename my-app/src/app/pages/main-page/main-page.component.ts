import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {
  questions = [
    {
      question: 'How can I book a room on your website?',
      answer: "You can easily book a room by selecting the hotel, dates, and room type, then following the prompts to complete your reservation. Payment can be securely made through PayPal or credit card.",
      isVisible: false
    },
    {
      question: 'How can I contact customer support?',
      answer: 'You can contact our support team by visiting the "Contact Us" section on our website and filling out the contact form. We are here to assist you with any questions or issues.',
      isVisible: false
    },
    {
      question: 'How can I receive my booking confirmation?',
      answer: 'After completing your booking, the confirmation will be sent to your email address. You can print it or show it on your mobile device when checking into the hotel.',
      isVisible: false
    },
    {
      question: 'Can I change my room type after booking?',
      answer: "Changing your room type depends on availability and the hotel's policy. Please contact our support team for more information.",
      isVisible: false
    },
  ];


  constructor(private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        document.getElementById(fragment)?.scrollIntoView({behavior: 'smooth'});
      }
    });
  }

  toggleAnswer(index: number) {
    this.questions[index].isVisible = !this.questions[index].isVisible;
  }
}
