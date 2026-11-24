import { Component, OnInit, ChangeDetectionStrategy, input, output, inject, WritableSignal, Signal, signal, computed, Inject, Injector } from '@angular/core';
import { QuarterlyGoalsAnimations } from './quarterly-goals.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { QuarterlyGoalsItemComponent } from './quarterly-goals-item/quarterly-goals-item.component';
import { QuarterlyGoalData, WeeklyGoalData } from '../home.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuarterlyGoalsHeaderComponent } from './quarterly-goals-header/quarterly-goals-header.component';

@Component({
  selector: 'app-quarterly-goals',
  templateUrl: './quarterly-goals.component.html',
  styleUrls: ['./quarterly-goals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: QuarterlyGoalsAnimations,
  standalone: true,
  imports: [QuarterlyGoalsItemComponent, QuarterlyGoalsHeaderComponent
  ],
})
export class QuarterlyGoalsComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  // --------------- INPUTS AND OUTPUTS ------------------

  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;

  // --------------- LOCAL UI STATE ----------------------
  incompleteWeeklyGoals: WeeklyGoalData[] = [
    {
      __id: 'wg1',
      __userId: 'test-user',
      __quarterlyGoalId: 'qg1',
      __hashtagId: 'ht1',
      text: 'Finish Google Cover Letter',
      completed: false,
      order: 1,
      hashtag: {
        __id: 'ht1',
        name: 'coverletter',
        color: '#EE8B72',
      },
    },
    {
      __id: 'wg2',
      __userId: 'test-user',
      __quarterlyGoalId: 'qg2',
      __hashtagId: 'ht2',
      text: 'Apply to Microsoft',
      completed: false,
      order: 2,
      hashtag: {
        __id: 'ht2',
        name: 'apply',
        color: '#2DBDB1',
      },
    },
  ];

  completeWeeklyGoals: WeeklyGoalData[] = [
    {
      __id: 'wg3',
      __userId: 'test-user',
      __quarterlyGoalId: 'qg3',
      __hashtagId: 'ht3',
      text: 'Review data structures',
      completed: true,
      order: 3,
      hashtag: {
        __id: 'ht3',
        name: 'interview',
        color: '#FFB987',
        _deleted: false,
      },
    },
  ];

  // TODO (1/1): add mock items to quarterlyGoals matching QuarterlyGoalData structure
  quarterlyGoals: QuarterlyGoalData[] = [
    {
      __id: 'qg1',
      __userId: 'test-user',
      __hashtagId: 'ht1',
      text: 'Do well in algorithms class',
      completed: false,
      order: 1,
      hashtag: {
        __id: 'ht1',
        name: 'class-algorithms',
        color: '#FFB987',
      },
      weeklyGoalsTotal: 1,
      weeklyGoalsComplete: 0,
    },

    {
      __id: 'qg2',
      __userId: 'test-user',
      __hashtagId: 'ht2',
      text: 'Apply to all internships',
      completed: false,
      order: 2,
      hashtag: {
        __id: 'ht2',
        name: 'apply-internships',
        color: '#2DBDB1',
      },
      weeklyGoalsTotal: 2,
      weeklyGoalsComplete: 0,
    },

    {
      __id: 'qg3',
      __userId: 'test-user',
      __hashtagId: 'ht3',
      text: 'Technical interview prep',
      completed: false,
      order: 3,
      hashtag: {
        __id: 'ht3',
        name: 'interview-technical',
        color: '#EE8B72',
      },
      weeklyGoalsTotal: 3,
      weeklyGoalsComplete: 0,
    },
  ];
  /** Loading icon. */
  loading: WritableSignal<boolean> = signal(false);

  // --------------- COMPUTED DATA -----------------------

  // --------------- EVENT HANDLING ----------------------
  checkGoal(goal: QuarterlyGoalData) {
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
