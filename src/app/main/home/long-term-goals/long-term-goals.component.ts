import { Component, OnInit, ChangeDetectionStrategy, input, output, inject, WritableSignal, Signal, signal, computed, Inject, Injector } from '@angular/core';
import { LongTermGoalsAnimations } from './long-term-goals.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { LongTermGoalsItemComponent } from './long-term-goals-item/long-term-goals-item.component';
import { LongTermGoal } from 'src/app/core/store/long-term-goal/long-term-goal.model';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-long-term-goals',
  templateUrl: './long-term-goals.component.html',
  styleUrls: ['./long-term-goals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: LongTermGoalsAnimations,
  standalone: true,
  imports: [ LongTermGoalsItemComponent,
  ],
})
export class LongTermGoalsComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  // --------------- INPUTS AND OUTPUTS ------------------

  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;
  
  sampleData = signal<LongTermGoal>({
  __id: 'ltg1',
  __userId: 'test-user',
  oneYear: 'Secure SWE or UX Engineering Internship',
  fiveYear: 'Working as a SWE in a team I love with some UX/Design oriented work',
  longTermGoalNotes: '',
  oneYearNotes: '',
  fiveYearNotes: '',
  _createdAt: Timestamp.now(),
  _updatedAt: Timestamp.now(),
  _deleted: false,
});

  // --------------- LOCAL UI STATE ----------------------

  /** Loading icon. */
  loading: WritableSignal<boolean> = signal(false);

  // --------------- COMPUTED DATA -----------------------

  // --------------- EVENT HANDLING ----------------------

  // --------------- OTHER -------------------------------

  constructor(
    private injector: Injector,
    @Inject(BATCH_WRITE_SERVICE) private batch: BatchWriteService,
  ) { }

  // --------------- LOAD AND CLEANUP --------------------
  
  ngOnInit(): void {
  }
}
