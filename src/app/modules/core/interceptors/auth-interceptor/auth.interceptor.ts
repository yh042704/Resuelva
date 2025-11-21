
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, exhaustMap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private authService: AuthService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError((error: any) => {
                if (error instanceof HttpErrorResponse && error.status === 401) {
                    return this.authService.refreshTokenService().pipe(
                        exhaustMap((refreshResponse: any) => {
                            if (refreshResponse.status.requestStatus.codigo === 401) {

                                Swal.fire({
                                    title: 'Sesión expirada',
                                    text: 'Su sesión ha expirado, debe iniciar sesión nuevamente',
                                    icon: 'error'
                                }).then(() => {
                                    setTimeout(() => {
                                        this.authService.logoutService();
                                    }, 1000);
                                });
                                throw error;
                            }

                            // Actualizar el token en el encabezado de la solicitud original
                            const tokenResponse = refreshResponse.data;
                            localStorage.setItem('token', tokenResponse.token);
                            localStorage.setItem('X-Tenant-Pais', tokenResponse.tenant);
                            localStorage.setItem('expire_at', tokenResponse.expireAt);

                            const authRequest = request.clone({
                                setHeaders: {
                                    Authorization: `Bearer ${tokenResponse.accessToken}`
                                }
                            });

                            return next.handle(authRequest);
                        })
                    );
                }

                throw error;
            })
        );
    }
}
