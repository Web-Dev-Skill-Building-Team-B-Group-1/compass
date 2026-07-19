import { ChangeDetectionStrategy, Component, OnInit, OutputEmitterRef, Signal, input, output} from '@angular/core';
import { WeeklyGoalsItemAnimations } from './weekly-goals-item.animations';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WeeklyGoalData } from '../../home.model';

@Component({
  selector: 'app-weekly-goals-item',
  templateUrl: './weekly-goals-item.component.html',
  styleUrls: ['./weekly-goals-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: WeeklyGoalsItemAnimations,
  standalone: true,
  imports: [MatCheckbox, MatProgressSpinner],
})
export class WeeklyGoalsItemComponent implements OnInit {
  // --------------- INPUTS AND OUTPUTS ------------------

  goal: Signal<WeeklyGoalData> = input<WeeklyGoalData>();
  checked: OutputEmitterRef<WeeklyGoalData> = output<WeeklyGoalData>();

  // --------------- LOCAL UI STATE ----------------------

  // --------------- COMPUTED DATA -----------------------

  // --------------- EVENT HANDLING ----------------------

  checkGoal() {
    this.checked.emit(this.goal());
  }

  // --------------- OTHER -------------------------------

  constructor(private snackBar: MatSnackBar) {}

  // --------------- LOAD AND CLEANUP --------------------

  ngOnInit(): void {}
}
