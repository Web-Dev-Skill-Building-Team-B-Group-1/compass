import { Component, OnInit, ChangeDetectionStrategy, input, output, inject, WritableSignal, Signal, signal, computed, Inject, Injector } from '@angular/core';
import { NotesHeaderAnimations } from './notes-header.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { LongTermGoal } from 'src/app/core/store/long-term-goal/long-term-goal.model';
import { LongTermGoalStore } from 'src/app/core/store/long-term-goal/long-term-goal.store';
import { QuarterlyGoal } from 'src/app/core/store/quarterly-goal/quarterly-goal.model';
import { QuarterlyGoalStore } from 'src/app/core/store/quarterly-goal/quarterly-goal.store';
import { Hashtag } from 'src/app/core/store/hashtag/hashtag.model';
import { HashtagStore, LoadHashtag } from 'src/app/core/store/hashtag/hashtag.store';
import { Router } from '@angular/router';
@Component({
  selector: 'app-notes-header',
  templateUrl: './notes-header.component.html',
  styleUrls: ['./notes-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: NotesHeaderAnimations,
  standalone: true,
  imports: [
  ],
})
export class NotesHeaderComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly longTermGoalStore = inject(LongTermGoalStore);
  readonly quarterlyGoalStore = inject(QuarterlyGoalStore);
  readonly hashtagStore = inject(HashtagStore);
  readonly router = inject(Router);
  
  // --------------- INPUTS AND OUTPUTS ------------------
  
  goalId: Signal<string> = input.required<string>();
  
  currentUser: Signal<User> = this.authStore.user;
  
  // --------------- LOCAL UI STATE ----------------------
  
  loading: WritableSignal<boolean> = signal(false);
  
  // --------------- COMPUTED DATA -----------------------
  
  longTermGoal: Signal<LongTermGoal | null> = computed(() => this.longTermGoalStore.selectEntity(this.goalId()));
  
  quarterlyGoal: Signal<QuarterlyGoal | null> = computed(() => this.quarterlyGoalStore.selectEntity(this.goalId()));
  
  hashtag: Signal<Hashtag | null> = computed(() => {
    const goal = this.quarterlyGoal();
    return goal ? this.hashtagStore.selectEntity(goal.__hashtagId) : null;
  });
  
  // --------------- EVENT HANDLING ----------------------
  
  close(): void {
    this.router.navigate(['/home']);
  }
  
  // --------------- OTHER -------------------------------
  
  constructor(
    private injector: Injector,
    @Inject(BATCH_WRITE_SERVICE) private batch: BatchWriteService,
  ) { }
  
  // --------------- LOAD AND CLEANUP --------------------
  
  ngOnInit(): void {
    this.longTermGoalStore.load(
      [['__id', '==', this.goalId()]],
      {},
      () => [],
      { loading: this.loading },
    );
    this.quarterlyGoalStore.load(
      [['__id', '==', this.goalId()]],
      {},
      (goal: QuarterlyGoal) => [
        LoadHashtag.create(this.hashtagStore, [['__id', '==', goal.__hashtagId]], {}),
      ],
      { loading: this.loading },
    );
  }
}