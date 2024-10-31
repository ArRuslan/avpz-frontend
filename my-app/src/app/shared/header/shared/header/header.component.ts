import { Component, OnInit, Renderer2, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('header', { static: true }) header?: ElementRef;
  isLoggedIn = false;

  constructor(private renderer: Renderer2, private router: Router) {}

  ngOnInit(): void {
    if (this.header) {
      const headerHeight = this.header.nativeElement.clientHeight;
      this.renderer.setStyle(document.body, 'padding-top', `${headerHeight}px`);
    }

    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
  }

  ngOnDestroy(): void {
    this.renderer.removeStyle(document.body, 'padding-top');
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
  }
}
