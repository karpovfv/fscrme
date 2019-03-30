import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {MaterialService} from "../../classes/material.service";

@Component({
  selector: 'app-app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent implements AfterViewInit {

  @ViewChild('floating') floatingRef: ElementRef;

  links = [
    {
      url: '/overview',
      name: 'Обзор',
    },
    {
      url: '/analytics',
      name: 'Аналитика',
    },
    {
      url: '/history',
      name: 'История',
    },
    {
      url: '/order',
      name: 'Добавление заказа',
    },
    {
      url: '/categories',
      name: 'Ассортимент',
    }
  ];

  constructor(private auth: AuthService,
              private router: Router) {
  }

  ngAfterViewInit() {
    MaterialService.initializeFloatingButton(this.floatingRef);
  }

  logout(event: Event) {
    event.preventDefault();
    this.auth.logout();
    this.router.navigate(['/login']);
  }

}
