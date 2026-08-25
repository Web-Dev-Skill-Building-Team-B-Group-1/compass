import { Component, OnInit, ChangeDetectionStrategy, inject, WritableSignal, Signal, signal, computed, Inject, Injector } from '@angular/core';
import { OnboardWeeklyGoalsAnimations } from './onboard-weekly-goals.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { FormArray, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CdkDropList, CdkDrag, CdkDragHandle, CdkDragDrop, CdkDragPreview, CdkDragPlaceholder } from '@angular/cdk/drag-drop';
import { MatIcon } from '@angular/material/icon';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { NgFor, NgIf } from '@angular/common';
import { WeeklyGoalStore } from 'src/app/core/store/weekly-goal/weekly-goal.store';
import { QuarterlyGoalStore, LoadQuarterlyGoal } from 'src/app/core/store/quarterly-goal/quarterly-goal.store';
import { HashtagStore, LoadHashtag } from 'src/app/core/store/hashtag/hashtag.store';
import { Hashtag } from 'src/app/core/store/hashtag/hashtag.model';
import { QuarterlyGoal } from 'src/app/core/store/quarterly-goal/quarterly-goal.model';

export interface QuarterlyGoalWithHashtag extends QuarterlyGoal {
  hashtag?: Hashtag;
}

@Component({
  selector: 'app-onboard-weekly-goals',
  templateUrl: './onboard-weekly-goals.component.html',
  styleUrls: ['./onboard-weekly-goals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: OnboardWeeklyGoalsAnimations,
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkDragPreview,
    CdkDragPlaceholder,
    MatIcon,
    MatFormField,
    MatInput,
    MatSelect,
    MatOption,
    NgFor,
    NgIf,
  ],
})
export class OnboardWeeklyGoalsComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);
  private readonly weeklyGoalStore = inject(WeeklyGoalStore);
  private readonly quarterlyGoalStore = inject(QuarterlyGoalStore);
  private readonly hashtagStore = inject(HashtagStore);
  private readonly batchWriteService = inject<BatchWriteService>(BATCH_WRITE_SERVICE);

  // --------------- INPUTS AND OUTPUTS ------------------

  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;

  // --------------- LOCAL UI STATE ----------------------

  /** Loading icon. */
  loading: WritableSignal<boolean> = signal(false);

  /** Form containing the list of weekly goals. */
  weeklyGoalsForm = this.fb.group({
    allGoals: this.fb.array([
      this.createGoalGroup(),
      this.createGoalGroup(),
      this.createGoalGroup(),
    ]),
  });

  // --------------- COMPUTED DATA -----------------------

  get allGoals(): FormArray {
    return this.weeklyGoalsForm.get('allGoals') as FormArray;
  }

  /** Quarterly goals with associated hashtags for the dropdown. */
  quarterlyGoals: Signal<QuarterlyGoalWithHashtag[]> = computed(() => {
    const userId = this.currentUser()?.__id;
    if (!userId) return [];

    const goals = this.quarterlyGoalStore.selectEntities(
      [['__userId', '==', userId]],
      { orderBy: 'order' },
    );

    return goals.map((qg) => ({
      ...qg,
      hashtag: this.hashtagStore.selectEntity(qg.__hashtagId),
    }));
  });

  // --------------- EVENT HANDLING ----------------------

  /** Handles drag and drop reordering. */
  drop(event: CdkDragDrop<unknown>): void {
    const control = this.allGoals.at(event.previousIndex);
    this.allGoals.removeAt(event.previousIndex);
    this.allGoals.insert(event.currentIndex, control);
  }

  /** Adds a new empty goal row. */
  addGoal(): void {
    this.allGoals.push(this.createGoalGroup());
  }

  /** Removes a goal row. */
  removeGoal(index: number): void {
    if (this.allGoals.length > 1) {
      this.allGoals.removeAt(index);
    }
  }

  /** Helper to find hashtag for a quarterly goal. */
  getHashtagForGoal(quarterlyGoalId: string): Hashtag | undefined {
    const match = this.quarterlyGoals().find((q) => q.__id === quarterlyGoalId);
    return match?.hashtag;
  }

  /** Saves all non-empty weekly goals. */
  async saveWeeklyGoals(): Promise<void> {
    const userId = this.currentUser()?.__id;
    if (!userId) return;

    this.loading.set(true);

    try {
      await this.batchWriteService.batchWrite(
        async (batchConfig) => {
          const ops: Promise<void>[] = [];

          this.allGoals.controls.forEach((ctrl, index) => {
            const v = ctrl.value;
            if (v.text && v.text.trim()) {
              ops.push(
                this.weeklyGoalStore.add(
                  {
                    __userId: userId,
                    __quarterlyGoalId: v.__quarterlyGoalId || '',
                    __hashtagId: this.getHashtagForGoal(v.__quarterlyGoalId)?.__id || '',
                    text: v.text.trim(),
                    completed: false,
                    order: index + 1,
                  },
                  { batchConfig },
                ),
              );
            }
          });

          await Promise.all(ops);
        },
        {
          snackBarConfig: {
            successMessage: 'Weekly goals saved',
            failureMessage: 'Could not save weekly goals',
          },
        },
      );
    } catch (e) {
      console.error('Error saving weekly goals:', e);
    } finally {
      this.loading.set(false);
    }
  }

  // --------------- OTHER -------------------------------

  private createGoalGroup(text = '', quarterlyGoalId = ''): FormGroup {
    return this.fb.group({
      text: [text],
      __quarterlyGoalId: [quarterlyGoalId],
      _new: [true],
      _deleted: [false],
    });
  }

  constructor(
    private injector: Injector,
  ) { }

  // --------------- LOAD AND CLEANUP --------------------

  ngOnInit(): void {
    const userId = this.currentUser()?.__id;
    if (!userId) return;

    // Load quarterly goals and their hashtags for the dropdown selector
    this.quarterlyGoalStore.load(
      [['__userId', '==', userId]],
      { orderBy: 'order' },
      (qg) => [
        LoadHashtag.create(this.hashtagStore, [['__id', '==', qg.__hashtagId]], {}),
      ],
    );
  }
}
