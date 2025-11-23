import { Component, inject, OnInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, RouterModule } from '@angular/router';
import { SharedModule } from './modules/shared/shared.module';
import { PrimeNGConfig } from 'primeng/api';
import deMessages from "devextreme/localization/messages/es.json";
import { locale, loadMessages } from "devextreme/localization";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  private router = inject(Router);

  isSpinnerVisible = true;

  constructor(private primengConfig: PrimeNGConfig) {
    this.router.events.subscribe(
      (event) => {
        if (event instanceof NavigationStart) {
          this.isSpinnerVisible = true;
        } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
          this.isSpinnerVisible = false;
        }
      },
      () => {
        this.isSpinnerVisible = false;
      }
    );
  }

   ngOnInit(): void {
        loadMessages(deMessages);
        locale('es-SV');

        this.primengConfig.ripple = true;
    }
}
