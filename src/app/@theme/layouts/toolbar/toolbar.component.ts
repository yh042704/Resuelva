// angular import
import { Component } from '@angular/core';

// project import
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { NavLeftComponent } from './toolbar-left/toolbar-left.component';
import { NavRightComponent } from './toolbar-right/toolbar-right.component';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [SharedModule, NavLeftComponent, NavRightComponent],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class NavBarComponent {}
