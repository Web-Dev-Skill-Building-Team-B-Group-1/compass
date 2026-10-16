import { Component, OnInit, ChangeDetectionStrategy, input, output, inject, WritableSignal, Signal, signal, computed, Inject, Injector } from '@angular/core';
import { QuarterlyGoalsSidebarAnimations } from './quarterly-goals-sidebar.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { QuarterlySidebarItemComponent } from './quarterly-sidebar-item/quarterly-sidebar-item.component';
import { WeeklyGoalData } from '../../../core/store/weekly-goal/weekly-goal.model';
import { Timestamp } from '@angular/fire/firestore';
import { QuarterlyData } from '../../home/home.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-quarterly-goals-sidebar',
  templateUrl: './quarterly-goals-sidebar.component.html',
  styleUrls: ['./quarterly-goals-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: QuarterlyGoalsSidebarAnimations,
  standalone: true,
  imports: [QuarterlySidebarItemComponent
  ],
})
export class QuarterlyGoalsSidebarComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  // --------------- INPUTS AND OUTPUTS ------------------

  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;

  // --------------- LOCAL UI STATE ----------------------

  /** Loading icon. */
  loading: WritableSignal<boolean> = signal(false);

  data: QuarterlyData = {
      __id: 'qg1',
      __userId: 'test-user',
      __hashtagId: 'ht1',
      text: 'Apply to all internships',
      completed: false,
      order: 1,
      _createdAt: Timestamp.now(),
      _updatedAt: Timestamp.now(),
      _deleted: false,
      weeklyGoals: [
        {
          __id: 'wg1',
          __userId: 'test-user',
          __quarterlyGoalId: 'qg1',
          __hashtagId: 'ht1',
          text: 'Finish Google Cover Letter',
          completed: false,
          order: 1,
        },
        {
          __id: 'wg2',
          __userId: 'test-user',
          __quarterlyGoalId: 'qg2',
          __hashtagId: 'ht2',
          text: 'Apply to Microsoft',
          completed: true,
          order: 2,
        },
      ],
    };
  
  // --------------- COMPUTED DATA -----------------------

  // --------------- EVENT HANDLING ----------------------
  
  checkGoal(goal: WeeklyGoalData) {
    this.snackBar.open(
      goal.completed ? 'Marked goal as incomplete' : 'Marked goal as complete',
      '',
      {
        duration: 3000,
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
      },
    );
  }

  addGoal(){
    this.snackBar.open('Clicked on add button', '', {
      duration: 3000,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
    });
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
