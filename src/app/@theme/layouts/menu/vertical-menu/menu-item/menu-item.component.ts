import { Component, Input, inject } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavigationItem } from 'src/app/@theme/types/navigation';
import { LayoutService } from 'src/app/@theme/services/layout.service';
import { TabServiceService } from 'src/app/modules/core/services/tab.service';

@Component({
  selector: 'app-menu-item',
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss']
})
export class MenuItemComponent {
  tabService = inject(TabServiceService);

  private layoutService = inject(LayoutService);
  private sanitizer = inject(DomSanitizer);

  // public props
  @Input() item!: NavigationItem;

  itemClick(event: Event) {
    console.log(this.item);
    this.tabService.tabItemObservable.next({ code: this.item.id, icon: this.item.icon, label: this.item.title, canClose: true, routerLink: this.item.link });
  }
  // public method
  toggleMenu(event: MouseEvent) {
    if (window.innerWidth < 1025) {
      this.layoutService.toggleSideDrawer();
    }
    const ele = event.target as HTMLElement;
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement as HTMLElement;
      const up_parent = ((parent.parentElement as HTMLElement).parentElement as HTMLElement).parentElement as HTMLElement;
      const last_parent = up_parent.parentElement;
      const sections = document.querySelectorAll('.coded-hasmenu');
      for (let i = 0; i < sections.length; i++) {
        sections[i].classList.remove('active');
        sections[i].classList.remove('coded-trigger');
      }

      if (parent.classList.contains('coded-hasmenu')) {
        parent.classList.add('coded-trigger');
        parent.classList.add('active');
      } else if (up_parent.classList.contains('coded-hasmenu')) {
        up_parent.classList.add('coded-trigger');
        up_parent.classList.add('active');
      } else if (last_parent?.classList.contains('coded-hasmenu')) {
        last_parent.classList.add('coded-trigger');
        last_parent.classList.add('active');
      }
    }
  }

  sanitizeURL(url: string): SafeUrl {
    // Validate and sanitize the URL here
    // For example, check if it starts with 'http://' or 'https://'
    // If it's valid, return the sanitized URL
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
