import { Component, OnInit, ChangeDetectionStrategy, input, output, inject, WritableSignal, Signal, signal, computed, Inject, Injector } from '@angular/core';
import { LongTermGoalsSidebarAnimations } from './long-term-goals-sidebar.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { JsonPipe } from '@angular/common';
import { LongTermGoalStore } from '../../../core/store/long-term-goal/long-term-goal.store';
import { LongTermGoal } from '../../../core/store/long-term-goal/long-term-goal.model';

@Component({
  selector: 'app-long-term-goals-sidebar',
  templateUrl: './long-term-goals-sidebar.component.html',
  styleUrls: ['./long-term-goals-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: LongTermGoalsSidebarAnimations,
  standalone: true,
  imports: [
    JsonPipe,
  ],
})
export class LongTermGoalsSidebarComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly longTermGoalStore = inject(LongTermGoalStore);
  // --------------- INPUTS AND OUTPUTS ------------------
  
  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;

  // --------------- LOCAL UI STATE ----------------------

  /** Loading icon. */
  loading: WritableSignal<boolean> = signal(false);

  // --------------- COMPUTED DATA -----------------------

  /** Retrieve long term goal for the user from the store */
  longTermGoal: Signal<LongTermGoal> = computed(() => {
    return this.longTermGoalStore.selectFirst([['__userId', '==', this.currentUser()?.__id]], {});
  });
  
  // --------------- EVENT HANDLING ----------------------

  // --------------- OTHER -------------------------------

  constructor(
    private injector: Injector,
    @Inject(BATCH_WRITE_SERVICE) private batch: BatchWriteService,
  ) { }

  // --------------- LOAD AND CLEANUP --------------------

  /** Loading long term goal for the current user into the store */
  ngOnInit() {
    this.longTermGoalStore.load([['__userId', '==', this.currentUser()?.__id]], {});
  }
}
