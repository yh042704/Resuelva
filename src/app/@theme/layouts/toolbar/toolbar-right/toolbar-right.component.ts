import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { User } from 'src/app/core/models/api.models';
import { AuthService } from 'src/app/core/services/auth.service';
import { TabServiceService } from 'src/app/core/services/tab.service';
import { SharedModule } from 'src/app/modules/shared/shared.module';

@Component({
  selector: 'app-nav-right',
  standalone: true,
  imports: [SharedModule, CommonModule, DialogModule, ButtonModule, InputTextModule, AvatarModule],
  templateUrl: './toolbar-right.component.html',
  styleUrls: ['./toolbar-right.component.scss']
})
export class NavRightComponent implements OnInit {
  mainCards = [
    {
      day: 'Hoy',
      cards: [
        {
          icon: 'custom-layer',
          time: 'hace 2 minutos',
          position: 'UI/UX Design',
          description:
            "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley oftype and scrambled it to make a type",
          status: false
        },
        {
          icon: 'custom-sms',
          time: 'hace 1 hora',
          position: 'Message',
          description: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500.",
          status: false
        }
      ]
    },
    {
      day: 'Ayer',
      cards: [
        {
          icon: 'custom-document-text',
          time: 'hace 12 horas',
          position: 'Forms',
          description:
            "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley oftype and scrambled it to make a type",
          status: false
        },
        {
          icon: 'custom-security-safe',
          time: 'hace 18 horas',
          position: 'Security',
          description: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500.",
          status: false
        },
        {
          icon: 'custom-user-bold',
          time: 'hace 15 horas',
          position: 'Challenge invitation',
          description: 'Jonny aber invites to join the challenge',
          status: true
        }
      ]
    }
  ];

  notification = [
    {
      sub_title: 'Improvement',
      time: '12 hour ago',
      title: 'Widgets update',
      img: 'assets/images/layout/img-announcement-3.png'
    },
    {
      sub_title: 'New Feature',
      time: '18 hour ago',
      title: 'Coming soon dark mode',
      img: 'assets/images/layout/img-announcement-4.png'
    }
  ];
  usuario: User | null = null;
  popupVisibleChangePassword: boolean = false;

  private router: Router = inject(Router);
  private tabService = inject(TabServiceService);
  private authService: AuthService = inject(AuthService);

  closeDialog() {
    this.popupVisibleChangePassword = false;
  }

  ngOnInit(): void {
    this.usuario = this.authService.getCurrentUser();
  }

  clickProfile(e: any) {
    this.tabService.tabItemObservable.next({
      code: 'profile',
      icon: 'pi pi-user',
      label: "Perfil de Usuario",
      canClose: true,
      routerLink: () => import('../../../../modules/pages/auth/profile/profile')
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['login']);
  }
}
