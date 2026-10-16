import { Component, OnInit, ChangeDetectionStrategy, input, output, inject, WritableSignal, Signal, signal, computed, Inject, Injector, OutputEmitterRef } from '@angular/core';
import { QuarterlySidebarItemAnimations } from './quarterly-sidebar-item.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { MatCheckbox } from '@angular/material/checkbox';
import { WeeklyGoalData } from '../../../../core/store/weekly-goal/weekly-goal.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuarterlyData } from '../../../home/home.model';
import { Timestamp } from '@angular/fire/firestore';


@Component({
  selector: 'app-quarterly-sidebar-item',
  templateUrl: './quarterly-sidebar-item.component.html',
  styleUrls: ['./quarterly-sidebar-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: QuarterlySidebarItemAnimations,
  standalone: true,
  imports: [MatCheckbox
  ],
})
  
export class QuarterlySidebarItemComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  // --------------- INPUTS AND OUTPUTS ------------------

  /** Input for weekly goal data */
  goal: Signal<WeeklyGoalData> = input<WeeklyGoalData>();
  /** Boolean output event for if the checkbox is selected or not*/
  checked: OutputEmitterRef<WeeklyGoalData> = output<WeeklyGoalData>();
  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;

  // --------------- LOCAL UI STATE ----------------------

  /** Loading icon. */
  loading: WritableSignal<boolean> = signal(false);
  
  // --------------- COMPUTED DATA -----------------------

  // --------------- EVENT HANDLING ----------------------

  checkGoal(){
    this.checked.emit(this.goal());
  }
  // --------------- OTHER -------------------------------

  constructor(
    private snackBar: MatSnackBar,
    private injector: Injector,
    @Inject(BATCH_WRITE_SERVICE) private batch: BatchWriteService,
  ) { }

  // --------------- LOAD AND CLEANUP --------------------
  
  ngOnInit(): void {
  }
}
