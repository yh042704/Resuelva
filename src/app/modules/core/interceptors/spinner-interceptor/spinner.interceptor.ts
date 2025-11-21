import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { SpinnerService } from '../../services/spinner.service';
import { inject } from '@angular/core';

export const SpinnerInterceptor: HttpInterceptorFn = (req, next) => {
    const spinnerService = inject(SpinnerService);
    const showSpinner = req.headers.get('Showspinner')?.toLowerCase() === 'true';

    if (showSpinner) {
        // Show the spinner
        spinnerService.show();
    }

    return next(req).pipe(
        finalize(() => {
            if (showSpinner) {
                // Hide the spinner after request is completed
                spinnerService.hide();
            }
        })
    );
};
