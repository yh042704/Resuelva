import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, Injectable, OnDestroy, OnInit, Renderer2, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTabsModule } from '@angular/material/tabs';
import { off } from "devextreme/events";
import Button from "devextreme/ui/button";
import { confirm } from 'devextreme/ui/dialog';
import { MenuItem } from "primeng/api";
import { ButtonModule } from 'primeng/button';
import { ContextMenuModule } from 'primeng/contextmenu';
import { TooltipModule } from 'primeng/tooltip';
import { Observable, catchError, exhaustMap, from } from 'rxjs';
import { ITab, MenuSelected } from '../../../core/interfaces/ITab';
import { GeneralService } from '../../../core/services/general.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { TabServiceService } from '../../../core/services/tab.service';
import { NotificacionesService } from '../../../core/services/notificaciones.service';

@Injectable({
  providedIn: "root",
})
@Component({
  selector: 'app-tabcontrol',
  standalone: true,
  imports: [ButtonModule, TooltipModule, CommonModule, ContextMenuModule, MatTabsModule],
  templateUrl: './tab-control.component.html',
  styleUrl: './tab-control.component.scss'
})
export class TabControlComponent implements OnInit, OnDestroy {
  @ViewChild('containerRef', { static: false, read: ViewContainerRef }) containerRef!: ViewContainerRef;

  tabs: ITab[] = [];
  items: MenuItem[] = [];
  activeItem: MenuItem = {};
  menuChanged: boolean = true;
  // dynamicComponent: any;

  // MyDynamic1Component = ProfileComponent;
  private renderer = inject(Renderer2);
  private service = inject(GeneralService);
  private spinner = inject(SpinnerService);
  private tabService = inject(TabServiceService);
  private notifications = inject(NotificacionesService);

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.tabService.tabItemObservable.pipe(
      exhaustMap((menu: MenuSelected) => this.GetComponentType(menu)),
      takeUntilDestroyed(),
      catchError((error, originalObs) => {
        this.notifications.showMessage(this.service.handleMessageError(error), 'error');

        return originalObs;
      }),

    ).subscribe({
      next: ([menu, componentType]) => {
        if (this.activateMenu({ originalEvent: undefined, item: { uniqueCode: menu.code, idRef: menu.idRef } })) { this.spinner.hide(); return; };

        this.containerRef.detach();
        const component = !menu?.refreshButton ? this.containerRef.createComponent(componentType) : this.cloneTab(componentType, menu);
        const selectedRecordRef = component.instance?.selectedRecordRef;
        if (selectedRecordRef !== undefined)
          component.instance.selectedRecordRef = menu.idRef

        this.tabs.push({
          header: menu.code,
          uniqueCode: menu.code,
          content: component,
          lastPageNumber: 0,
          label: menu.label,
          refreshButton: menu.refreshButton
        })

        const label = menu.label.replace(' *--* ', '-');
        const data: MenuItem = {
          label: label.length > 19 ? label.substring(0, 19) + '...' : label,
          labelToolTip: label,
          fullLabel: menu.label,
          icon: menu.icon,
          canClose: menu.canClose,
          uniqueCode: menu.code,
          command: (event: any) => {
            console.log(event);
            this.activateMenu(event);
          }
        };

        this.items.push(data);
        this.activeItem = data;

        this.updateVisibility();
        this.spinner.hide();
      },
      error: (err) => this.spinner.hide()
    });

    this.tabService.tabItemCloseObservable.pipe(
      takeUntilDestroyed(),
      catchError((error, originalObs) => {
        this.notifications.showMessage(this.service.handleMessageError(error), 'error');

        return originalObs;
      })
    ).subscribe({
      next: (uniqueCode) => {
        this.onCloseTab(null, { uniqueCode: uniqueCode })
      },
      error: (err) => {
        this.spinner.hide();
      }
    })
  }

  ngOnInit(): void {
    this.loadMainTab();
  }

  private loadMainTab() {
    this.tabService.tabItemObservable.next({
      code: 'dashboard',
      icon: 'pi pi-home',
      label: "Inicio",
      canClose: false,
      routerLink: () => import('../../pages/dashboard/dashboard.component')
    });
  }

  private cloneTab(label: string, menu: MenuSelected) {
    const [item] = this.items.filter(item => item['fullLabel'] === label);
    const [tab] = this.isOpenTab(item['uniqueCode']);
    const component = this.containerRef.createComponent(tab.content!.componentType);

    setTimeout(() => {
      const buttonSave = component.location.nativeElement.querySelector('#btnSave');
      const button = Button.getInstance(buttonSave!) as Button;
      const buttonSaveAction = (button as any)._clickAction;

      off(buttonSave, "dxclick");
      this.renderer.listen(buttonSave, 'click', () => {
        buttonSaveAction(menu.refreshButton);
      });
    }, 1000);

    return component;
  }

  private isOpenTab(uniqueCode: string) {
    return this.tabs.filter(tab => tab.uniqueCode === uniqueCode);
  }

  private activateMenu(event: { originalEvent: any, item: { uniqueCode: string, idRef: any }, close?: boolean; }) {
    if (event.item.uniqueCode === this.activeItem['uniqueCode']) return true;

    let [tab] = this.isOpenTab(event.item.uniqueCode);
    if (tab) {
      [this.activeItem] = this.items.filter(item => item['uniqueCode'] === event.item.uniqueCode);

      if (!event.close)
        this.containerRef.detach();
      this.containerRef.insert(tab.content!.hostView);

      if (!event.originalEvent) {
        const selectedRecordRef = tab.content!.instance.selectedRecordRef;
        if (selectedRecordRef)
          if (event.item.idRef)
            tab.content!.instance.selectedRecordRef = event.item.idRef;
      }

      this.updateVisibility();
      return true;
    }

    return false;
  }

  onCloseTab(event: any, item: any) {
    event?.stopPropagation();

    confirm(`¿Está seguro que desea cerrar la ventana <b>${item.label}</b>?`, "Confirmación")
      .then(dialogResult => {
        if (dialogResult) {
          for (let i = 0; this.tabs.length; i++) {
            if (this.tabs[i].uniqueCode === item.uniqueCode) {
              const effect = this.document.getElementById('effectComponent');
              const uniqueCodeActiveItem: string = this.activeItem['uniqueCode'];
              const uniqueCodeTabs: string = this.tabs[i].uniqueCode;
              let timeout = 0;
              if (effect && uniqueCodeTabs === uniqueCodeActiveItem) {
                effect.classList.remove("effect-component");
                effect.classList.add("lightSpeedOut");
                timeout = 500;
              }

              setTimeout(() => {
                this.tabs[i].content!.hostView.destroy();
                this.tabs[i].content!.destroy();
                this.tabs[i].content = null;
                // this.tabs[i].view.destroy();

                this.items = this.items.filter(item2 => item2['uniqueCode'] !== item.uniqueCode);
                this.tabs.splice(i, 1);

                if (uniqueCodeTabs === uniqueCodeActiveItem) {
                  this.containerRef.remove();
                  this.containerRef.clear();
                  //  this.spinner.show();
                  //  this.document.location.reload()
                  this.activateMenu({ originalEvent: undefined, item: { uniqueCode: this.items[i - 1]['uniqueCode'], idRef: undefined }, close: true })
                } else
                  this.updateVisibility();
              }, timeout);

              break;
            }
          };
        }
      });
  }

  private async digestMessage(message: string) {
    const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8); // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""); // convert bytes to hex string

    return hashHex;
  }

  private GetComponentType(mnu: MenuSelected): Observable<any[]> {
    this.spinner.show();
    return from((async () => {
      if (typeof mnu.routerLink !== 'function')
        return [mnu, null];

      const link = mnu.routerLink;
      const resolved = !mnu?.refreshButton ? await link().then((x: any) => x.default) : link();

      return [mnu, resolved];
    })());
  }

  private updateVisibility(): void {
    this.menuChanged = false;
    setTimeout(() => { this.menuChanged = true; }, 0);
  }

  ngOnDestroy(): void {
    this.tabs.forEach(tab => {
      // if (tab.content) {
      tab.content!.hostView.destroy();
      tab.content!.destroy();
      tab.content = null;
      // tab.view.destroy();
      // };
    });

    this.containerRef.clear();
  }
}
