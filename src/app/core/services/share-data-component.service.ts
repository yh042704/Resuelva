import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ShareDataComponentService {
    dataSchedulerObservable: Subject<any> = new Subject<any>();
    constructor() { }
}
