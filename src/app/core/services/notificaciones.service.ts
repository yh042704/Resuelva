import { inject, Injectable } from '@angular/core';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import { MessageService } from 'primeng/api';

@Injectable({
    providedIn: 'root'
})
export class NotificacionesService {

    // private messageService = inject(MessageService);

    constructor(private messageService: MessageService) { }

    showMessage(message: any, type: any) {
        notify({
            message: message,
            position: "top right",
            direction: "up-push",
        }, type, 3000);
    }

    showSummaryError(messages: any[]) {
        this.messageService.clear();
        this.messageService.add({ severity: 'error', summary: 'Errores', detail: '<ul><li>' + messages.join('</li><li>') + '</li></ul>', sticky: true });
    }

    dialogConfirm(message: any, titulo: any): Promise<boolean> {

        return confirm(message, titulo);
    }
}
