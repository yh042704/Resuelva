import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/core/models/api.models';
import { AuthService } from 'src/app/core/services/auth.service';
import { TabServiceService } from 'src/app/core/services/tab.service';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule, CommonModule, Dialog, ButtonModule, InputTextModule, AvatarModule],
  templateUrl: './toolbar-right.component.html',
  styleUrls: ['./toolbar-right.component.scss']
})
export class NavRightComponent implements OnInit {
  mainCards = [
    {
      day: 'Today',
      cards: [
        {
          icon: 'custom-layer',
          time: '2 min ago',
          position: 'UI/UX Design',
          description:
            "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley oftype and scrambled it to make a type",
          status: false
        },
        {
          icon: 'custom-sms',
          time: '1 hour ago',
          position: 'Message',
          description: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500.",
          status: false
        }
      ]
    },
    {
      day: 'Yesterday',
      cards: [
        {
          icon: 'custom-document-text',
          time: '12 hour ago',
          position: 'Forms',
          description:
            "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley oftype and scrambled it to make a type",
          status: false
        },
        {
          icon: 'custom-security-safe',
          time: '18 hour ago',
          position: 'Security',
          description: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500.",
          status: false
        },
        {
          icon: 'custom-user-bold',
          time: '15 hour ago',
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

  changePasswordButtonOptions?: Record<string, unknown> = {
    icon: 'check',
    stylingMode: 'contained',
    text: 'Cambiar contraseña',
    onClick: () => {
      this.popupVisibleChangePassword = true;
    }
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
