import { ChangeDetectionStrategy, Component, OnInit, output } from '@angular/core';
import { WeeklyGoalsHeaderAnimations } from './weekly-goals-header.animations';
import { endOfWeek, startOfWeek } from 'src/app/core/utils/time.utils';

@Component({
  selector: 'app-weekly-goals-header',
  templateUrl: './weekly-goals-header.component.html',
  styleUrls: ['./weekly-goals-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: WeeklyGoalsHeaderAnimations,
  standalone: true,
  imports: [],
})
export class WeeklyGoalsHeaderComponent implements OnInit {
  // --------------- INPUTS AND OUTPUTS ------------------

  // no input for this component – it's not needed :)
  editClicked = output<boolean>();

  // --------------- LOCAL UI STATE ----------------------

  // --------------- COMPUTED DATA -----------------------

  endOfWeek = endOfWeek; // import from time.utils.ts

  startOfWeek = startOfWeek; // import from time.utils.ts

  // --------------- EVENT HANDLING ----------------------

  /** Update weekly goal. */
  editGoals() {
    this.editClicked.emit(true);
  }

  // --------------- OTHER -------------------------------

  constructor() {}

  // --------------- LOAD AND CLEANUP --------------------

  ngOnInit(): void {}
}
