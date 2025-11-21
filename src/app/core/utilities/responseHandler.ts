import Swal from "sweetalert2";
import { IResponseWrapperDTO } from '../interfaces/responseWrapperDTO';

export function ResposeHandler(response: IResponseWrapperDTO) {
    if (response.success)
        return response.result;

    Swal.fire({ position: 'top-end', icon: 'info', title: 'Ocurrió un error en la petición', text: response.message, showConfirmButton: false, timer: 3500, toast: true });
    return null;
}
