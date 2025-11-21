import { GeneralService } from '../../core/services/general.service';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { User, UserResponse } from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly USER_KEY = 'resuelvaCurrentUser';
  private apiService: GeneralService = inject(GeneralService);

  constructor() {
    const savedUser = localStorage.getItem(this.USER_KEY);
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(email: string, password: string): Observable<UserResponse> {

    return of({
      success: true,
      data: {
        userid: '100000',
        email: email,
        name: 'Yesenia Hernández de Merino',
        userType: 'Administrador del sistema',
        phone: '(503) 23240481',
        description: 'Responsable de asegurar el correcto funcionamiento, mantenimiento y seguridad de toda la infraestructura de sistemas de la compañía. El objetivo principal es garantizar la continuidad operativa y la optimización del rendimiento de todos los sistemas informáticos, tanto internos como externos',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4ODUxMWE2Mi01Zjg5LTRiMzYtYjMwNi1kMDY5NjJkMGI0OTAiLCJ1c2VybmFtZSI6ImdhYi5tZXJpbm8xMjM0NTYiLCJpYXQiOjE3NjM3MzkxMTQsImV4cCI6MTc2MzgyNTUxNH0.JP32SP7YwrqAkB7J0gbOd9_Bn-CdUd2_i3Obrn-_FPU',
        message: 'Autenticación correcta'
      }
    }).pipe(
      tap((response: any) => {
        if (response.success && response.data) {
          this.setCurrentUser(response.data);
        }
      })
    );

    // return this.apiService
    //   .Post<UserResponse>('users', 'login', { email, password })
    //   .pipe(
    //     tap((response: any) => {
    //       if (response.success && response.data) {
    //         this.setCurrentUser(response.data.user);
    //       }
    //     })
    //   );
  }

  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem(this.USER_KEY);
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }
}
