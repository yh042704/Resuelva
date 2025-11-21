import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
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
  // private authService = inject(AuthService);
  private validateUser$: Subject<string> = new Subject<string>();

  constructor() {
    this.loginForm = this.fb.group({
      email: ['yh042704o@gmail.com', [Validators.required, Validators.email]],
      password: ['Prueba123', [Validators.required]]
    });


    // /**
    // * Configura el flujo reactivo para la validación de usuarios
    // * Utiliza un Subject para manejar las solicitudes de validación de forma eficiente
    // */
    // this.validateUser$.pipe(
    //   takeUntil(this.destroy$),
    //   tap((email: string) => {
    //     this.isLoading = true;
    //     this.isCheckingUser = true;
    //   }),
    //   /**
    //   * Verifica si el usuario existe en el sistema
    //   * Combina la respuesta del servicio con el email original para mantener el contexto
    //   */
    //   switchMap((email: string) => combineLatest([this.authService.checkUserExists(email), of(email)])),
    //   /**
    //    * Procesa la respuesta de existencia del usuario
    //    * - Si hay error de conexión, muestra notificación
    //    * - Si el usuario no existe, solicita confirmación para creación automática
    //    * - Si el usuario existe, continúa con el flujo normal
    //    */
    //   switchMap(([value, email]) => {
    //     if (!value.success) {
    //       this.snackBar.open(
    //         'Error de conexión. Intenta nuevamente.',
    //         'Cerrar',
    //         { duration: 5000 }
    //       );

    //       return combineLatest([of(false), of(email)]);
    //     }

    //     if (!value.data?.exists) {
    //       this.isCheckingUser = false;
    //       return combineLatest([this.confirmAction('Favor confirmar para proceder.',
    //         '¿Desea crear su usuario automáticamente?'), of(email)])
    //     }

    //     return combineLatest([of(true), of(email)]);
    //   }
    //   ),
    //   /**
    //   * Ejecuta el login o cancela la operación según la respuesta del usuario
    //   * - Si la respuesta es positiva, procede con el login/registro
    //   * - Si es negativa, detiene el flujo y desactiva los estados de carga
    //   */
    //   switchMap(([response, email]) => {
    //     if (response)
    //       return this.authService.login(email);

    //     this.isLoading = false;
    //     return EMPTY;
    //   }),
    //   catchError((error, originalObs) => {
    //     this.isLoading = false;
    //     this.isCheckingUser = false;
    //     this.snackBar.open(
    //       'Error de conexión. Intenta nuevamente.',
    //       'Cerrar',
    //       { duration: 5000 }
    //     );

    //     return originalObs;
    //   })
    // ).subscribe({
    //   /**
    //   * Maneja la respuesta exitosa del proceso de login/registro
    //   * - Muestra mensaje de bienvenida según si el usuario existía o fue creado
    //   * - Redirige a la página de tareas si fue exitoso
    //   * - Muestra error si la operación falló
    //   */
    //   next: (response) => {
    //     this.isLoading = false;

    //     if (response.success) {
    //       this.snackBar.open(
    //         response.data?.user.exists ?
    //           '¡Bienvenido de nuevo!' :
    //           '¡Usuario creado exitosamente!',
    //         'Cerrar',
    //         { duration: 3000 }
    //       );
    //       this.router.navigate(['/tasks']);
    //     } else {
    //       this.snackBar.open(
    //         response.error || 'Error en el login',
    //         'Cerrar',
    //         { duration: 5000 }
    //       );
    //     }
    //   }
    // });
  }

  ngOnInit(): void {
    // if (this.authService.isAuthenticated())
    //   this.router.navigate(['/tasks']);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      // const email = this.email?.value;
      // this.validateUser$.next(email);

      this.router.navigate(['principal']);
    }
  }

  get email() {
    return this.loginForm.get('email');
  }


  get password() {
    return this.loginForm.get('password');
  }

  togglePassword(e: any){
    e.preventDefault();

    this.hide = !this.hide;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
