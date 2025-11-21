import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { timer } from 'rxjs';
import { currentTime, rotateClockHands } from './clock.operator';

@Component({
  selector: 'app-clock-lock-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clock-lock-screen.html',
  styleUrl: './clock-lock-screen.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClockLockScreenComponent {
  readonly oneSecond = 1000;

  clockHandsTransform$ = timer(0, this.oneSecond).pipe(currentTime(), rotateClockHands());
}
