import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private _spinnerVisible = new BehaviorSubject<boolean>(false);
  public spinnerVisible$ = this._spinnerVisible.asObservable();

  show() {
    this._spinnerVisible.next(true);
  }

  hide() {
    this._spinnerVisible.next(false);
  }
}
