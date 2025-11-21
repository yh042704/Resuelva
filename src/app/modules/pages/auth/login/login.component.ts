import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { catchError, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { SharedModule } from 'src/app/modules/shared/shared.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule, RouterModule, CommonModule, MatSnackBarModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatFormFieldModule, MatButtonModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', '../authentication.scss']
})
export default class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  hide = true;
  isLoading = false;

  private router = inject(Router);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private validateUser$: Subject<[string, string]> = new Subject<[string, string]>();

  constructor() {
    this.loginForm = this.fb.group({
      email: ['yh042704@gmail.com', [Validators.required, Validators.email]],
      password: ['Prueba123', [Validators.required]]
    });

    this.validateUser$.pipe(
      takeUntil(this.destroy$),
      tap(([email, password]) => {
        this.isLoading = true;
      }),
      switchMap(([email, password]) => this.authService.login(email, password)),
      catchError((error, originalObs) => {
        this.isLoading = false;
        this.snackBar.open(
          'Error de conexión. Intenta nuevamente.',
          'Cerrar',
          { duration: 5000 }
        );

        return originalObs;
      })
    ).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        if (response.success) {
          this.snackBar.open('¡Bienvenido de nuevo!', 'Cerrar', { duration: 3000 });
          this.router.navigate(['principal']);
        } else {
          this.snackBar.open(response.error || 'Error en el login', 'Cerrar', { duration: 5000 });
        }
      }
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated())
      this.router.navigate(['principal']);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const email = this.email?.value;
      const password = this.password?.value;
      this.validateUser$.next([email, password]);
    }
  }

  get email() {
    return this.loginForm.get('email');
  }


  get password() {
    return this.loginForm.get('password');
  }

  togglePassword(e: any) {
    e.preventDefault();

    this.hide = !this.hide;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
