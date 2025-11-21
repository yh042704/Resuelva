import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { MenuSelected } from '../interfaces/ITab';

@Injectable({
  providedIn: 'root'
})
export class TabServiceService {
  tabItemObservable: Subject<MenuSelected> = new Subject<MenuSelected>();
  tabItemCloseObservable: Subject<string> = new Subject<string>();
  tabItemChangeObservable: Subject<any> = new Subject<any>();
  constructor() { }
}
