import { Component, Renderer2 } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'my-app';
  showHeader = true;

  constructor(private router: Router, private renderer: Renderer2) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const noHeaderRoutes = ['/login', '/sign_up', '/admin', '/admin-login'];
        this.showHeader = !noHeaderRoutes.includes(event.url);

        if (this.showHeader) {
          this.renderer.removeClass(document.body, 'no-header');
        } else {
          this.renderer.addClass(document.body, 'no-header');
        }

        window.scrollTo(0, 0);
      }
    });
  }
}
