import { CommonModule, Location, LocationStrategy } from '@angular/common';
import { Component, inject, input, model, NgZone, OnDestroy, OnInit } from '@angular/core';
import { fromEvent, merge, Subject, Subscription, switchMap, tap, timer } from 'rxjs';
import { NavigationItem } from 'src/app/@theme/types/navigation';
import { User } from 'src/app/core/models/api.models';
import { AuthService } from 'src/app/core/services/auth.service';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { MenuCollapseComponent } from './menu-collapse/menu-collapse.component';
import { MenuGroupVerticalComponent } from './menu-group/menu-group.component';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { TabServiceService } from 'src/app/core/services/tab.service';

@Component({
  selector: 'app-vertical-menu',
  imports: [SharedModule, MenuItemComponent, MenuCollapseComponent, MenuGroupVerticalComponent, CommonModule],
  templateUrl: './vertical-menu.component.html',
  styleUrls: ['./vertical-menu.component.scss']
})
export class VerticalMenuComponent implements OnInit, OnDestroy {
  private location = inject(Location);
  private locationStrategy = inject(LocationStrategy);

  menus = input.required<NavigationItem[]>();
  lockScreen = model<boolean>(false);

  private tabService = inject(TabServiceService);
  private idleTimeoutMs = 15 * 60 * 1000; // 15 minutos
  public idleState: Subject<boolean> = new Subject<boolean>();
  private activitySubscription: Subscription = new Subscription();

  fireOutClick() {
    let current_url = this.location.path();
    const baseHref = this.locationStrategy.getBaseHref();
    if (baseHref) {
      current_url = baseHref + this.location.path();
    }
    const link = "a.nav-link[ href='" + current_url + "' ]";
    const ele = document.querySelector(link);
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement;
      const up_parent = parent?.parentElement?.parentElement;
      const last_parent = up_parent?.parentElement;
      if (parent?.classList.contains('coded-hasmenu')) {
        parent.classList.add('coded-trigger');
        parent.classList.add('active');
      } else if (up_parent?.classList.contains('coded-hasmenu')) {
        up_parent.classList.add('coded-trigger');
        up_parent.classList.add('active');
      } else if (last_parent?.classList.contains('coded-hasmenu')) {
        last_parent.classList.add('coded-trigger');
        last_parent.classList.add('active');
      }
    }
  }

  accountList = [
    {
      icon: 'ti ti-settings',
      title: 'Configuración',
      click: (e: any) => {
        this.tabService.tabItemObservable.next({
          code: 'profile',
          icon: 'pi pi-user',
          label: "Perfil de Usuario",
          canClose: true,
          routerLink: () => import('../../../../modules/pages/auth/profile/profile')
        });
      }
    },
    {
      icon: 'ti ti-lock',
      title: 'Bloquear Pantalla',
      click: (e: any) => this.lockScreen.set(!this.lockScreen())
    }
  ];

  usuario: User | null = null;

  private authService: AuthService = inject(AuthService);

  constructor(private ngZone: NgZone) {
    this.ngZone.runOutsideAngular(() => {
      const activityEvents = merge(
        fromEvent(document, 'mousemove'),
        fromEvent(document, 'keydown'),
        fromEvent(document, 'mousedown'),
        fromEvent(document, 'scroll'),
        fromEvent(document, 'touchstart'),
        fromEvent(document, 'blur')
      );

      this.activitySubscription = activityEvents.pipe(
        switchMap(() => {
          return timer(this.idleTimeoutMs);
        }),
        tap(() => this.ngZone.run(() => this.lockScreen.set(true)))
      ).subscribe();
    });
  }

  ngOnDestroy(): void {
    this.activitySubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.usuario = this.authService.getCurrentUser();
  }
}
