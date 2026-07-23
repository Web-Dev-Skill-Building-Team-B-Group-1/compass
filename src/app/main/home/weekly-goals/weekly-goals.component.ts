import { Component, OnInit, ChangeDetectionStrategy, input, output, inject, WritableSignal, Signal, signal, computed, Inject, Injector } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { WeeklyGoalsAnimations } from './weekly-goals.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { WeeklyGoalsHeaderComponent } from './weekly-goals-header/weekly-goals-header.component';
import { WeeklyGoalsItemComponent } from './weekly-goals-item/weekly-goals-item.component';
import { WeeklyGoalData } from 'src/app/core/store/weekly-goal/weekly-goal.model';

@Component({
  selector: 'app-weekly-goals',
  templateUrl: './weekly-goals.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: WeeklyGoalsAnimations,
  standalone: true,
  imports: [
    WeeklyGoalsHeaderComponent,
    WeeklyGoalsItemComponent,
  ],
})
export class WeeklyGoalsComponent implements OnInit {
  readonly authStore = inject(AuthStore);

  // --------------- INPUTS AND OUTPUTS ------------------

  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;

  /** Sample weekly goal data passed to the weekly goal item. */
  sampleData: WeeklyGoalData = {
    __id: 'wg1',
    __userId: 'test-user',
    __quarterlyGoalId: 'qg1',
    __hashtagId: 'ht1',
    text: 'Apply to Microsoft',
    completed: false,
    order: 1,
    _createdAt: Timestamp.now(),
    _updatedAt: Timestamp.now(),
    _deleted: false,
    hashtag: {
      __id: 'ht1',
      __userId: 'test-user',
      name: 'apply-internships',
      color: '#2DBDB1',
      _createdAt: Timestamp.now(),
      _updatedAt: Timestamp.now(),
      _deleted: false,
    },
  };

  // --------------- LOCAL UI STATE ----------------------

  /** Loading icon. */
  loading: WritableSignal<boolean> = signal(false);

  // --------------- COMPUTED DATA -----------------------

  // --------------- EVENT HANDLING ----------------------
  /** Updates the completion state of the weekly goal. */
  updateGoalCompletion(completed: boolean): void {
    this.sampleData = {
      ...this.sampleData,
      completed,
   };
  }
  // --------------- OTHER -------------------------------

  constructor(
    private injector: Injector,
    @Inject(BATCH_WRITE_SERVICE) private batch: BatchWriteService,
  ) { }

  // --------------- LOAD AND CLEANUP --------------------

  ngOnInit(): void {
  }
}