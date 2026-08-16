import { Component, OnInit, ChangeDetectionStrategy, input, output, inject, WritableSignal, Signal, signal, computed, Inject, Injector } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { WeeklyGoalsAnimations } from './weekly-goals.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { WeeklyGoalsHeaderComponent } from './weekly-goals-header/weekly-goals-header.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WeeklyGoalsModalComponent } from './weekly-goals-modal/weekly-goals-modal.component';
import { QuarterlyGoalData, WeeklyGoalData } from '../home.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CdkDropList, CdkDrag, CdkDragHandle, CdkDragDrop } from '@angular/cdk/drag-drop';
import { WeeklyGoalsItemComponent } from './weekly-goals-item/weekly-goals-item.component';
import { WeeklyGoalStore } from 'src/app/core/store/weekly-goal/weekly-goal.store';
import { QuarterlyGoalStore, LoadQuarterlyGoal } from 'src/app/core/store/quarterly-goal/quarterly-goal.store';
import { HashtagStore, LoadHashtag } from 'src/app/core/store/hashtag/hashtag.store';
import { FormArray } from '@angular/forms';

@Component({
  selector: 'app-weekly-goals',
  templateUrl: './weekly-goals.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: WeeklyGoalsAnimations,
  standalone: true,
  imports: [
    WeeklyGoalsHeaderComponent,
    WeeklyGoalsItemComponent,
    WeeklyGoalsModalComponent,
    WeeklyGoalsItemComponent,
    CdkDropList,
    CdkDrag,
    CdkDragHandle
  ]
  
})
export class WeeklyGoalsComponent implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly weeklyGoalStore = inject(WeeklyGoalStore);
  private readonly quarterlyGoalStore = inject(QuarterlyGoalStore);
  private readonly hashtagStore = inject(HashtagStore);
  private readonly batchWriteService = inject<BatchWriteService>(BATCH_WRITE_SERVICE);
  // --------------- INPUTS AND OUTPUTS ------------------

  // --------------- LOCAL UI STATE ----------------------

  incompleteWeeklyGoals: Signal<WeeklyGoalData[]> = computed(() => {
    const userId = this.authStore.user()?.__id;
    const goals = this.weeklyGoalStore.selectEntities(
      [
        ['__userId', '==', userId],
        ['completed', '==', false],
      ],
      { orderBy: 'order' },
    );
    return goals.map(g => ({
      ...g,
      hashtag: this.hashtagStore.selectEntity(g.__hashtagId),
    }));
  });

  completeWeeklyGoals: Signal<WeeklyGoalData[]> = computed(() => {
    const userId = this.authStore.user()?.__id;
    const goals = this.weeklyGoalStore.selectEntities(
      [
        ['__userId', '==', userId],
        ['completed', '==', true],
        ['completionDate', '>=', this.startOfWeek()],
      ],
      { orderBy: 'order' },
    );
    return goals.map(g => ({
      ...g,
      hashtag: this.hashtagStore.selectEntity(g.__hashtagId),
    }));
  });

  quarterlyGoals: Signal<QuarterlyGoalData[]> = computed(() => {
    const goals = this.quarterlyGoalStore.selectEntities([['__userId', '==', this.authStore.user()?.__id]], { orderBy: 'order' });

    return goals.map(qg => {
      let weeklyGoals = this.weeklyGoalStore.selectEntities([['__quarterlyGoalId', '==', qg.__id]], {});
      let weeklyGoalsTotal = 0;
      let weeklyGoalsComplete = 0;
      for (const wg of weeklyGoals) {
        weeklyGoalsTotal++;
        if (wg.completed) weeklyGoalsComplete++;
      }

      return {
        ...qg,
        hashtag: this.hashtagStore.selectEntity(qg.__hashtagId),
        weeklyGoalsTotal,
        weeklyGoalsComplete,
      };
    });
  });

  /** For storing the dialogRef in the opened modal. */
  dialogRef: MatDialogRef<any>;

  // --------------- COMPUTED DATA -----------------------
  
  // --------------- EVENT HANDLING ----------------------
  async saveWeeklyGoals(allGoals: FormArray): Promise<void> {
    const userId = this.authStore.user()?.__id;
    if (!userId) return;
  
    await this.batchWriteService.batchWrite(
      async (batchConfig) => {
        const ops: Promise<void>[] = [];
  
        allGoals.controls.forEach((ctrl, index) => {
          const v = ctrl.value;
  
          // 1. brand-new goal the user added
          if (v._new && !v._deleted) {
            ops.push(this.weeklyGoalStore.add(
              {
                __userId: userId,
                __quarterlyGoalId: v.__quarterlyGoalId,
                text: v.text,
                completed: false,
                order: index + 1,
              },
              { batchConfig },
            ));
  
          // 2. existing goal the user deleted
          } else if (v._deleted && !v._new) {
            ops.push(this.weeklyGoalStore.remove(v.__weeklyGoalId, { batchConfig }));
  
          // 3. existing goal that changed (text edited, or reordered via drag)
          } else if (ctrl.dirty && !v._new && !v._deleted) {
            ops.push(this.weeklyGoalStore.update(
              v.__weeklyGoalId,
              { text: v.text, order: index + 1, __quarterlyGoalId: v.__quarterlyGoalId },
              { batchConfig },
            ));
          }
        });
  
        await Promise.all(ops);
      },
      {
        snackBarConfig: {
          successMessage: 'Goals were updated',
          failureMessage: 'Could not update goals',
          undoOnAction: true,
        },
      },
    );
  }
  async toggleGoalComplete(goal: WeeklyGoalData): Promise<void> {
    await this.weeklyGoalStore.update(
      goal.__id,
      { completed: !goal.completed },
      { snackBarConfig: {
          successMessage: goal.completed ? 'Marked goal as incomplete' : 'Marked goal as complete',
          failureMessage: 'Could not update goal',
      }},
    );
  }
  // --------------- OTHER -------------------------------

  /** Update weekly goals. */
  openModal(editClicked: boolean) {
    this.dialogRef = this.dialog.open(WeeklyGoalsModalComponent, {
      height: '90%',
      position: { bottom: '0' },
      panelClass: 'goal-modal-panel',
      data: {
        goalDatas: this.quarterlyGoals(),
        incompleteGoals: this.incompleteWeeklyGoals(),
        updateWeeklyGoals: async (weeklyGoalsFormArray: FormArray) => {
          try {
            await this.saveWeeklyGoals(weeklyGoalsFormArray);
            this.dialogRef.close();
          } catch (e) {
            console.error(e); // failure snackbar is already handled inside batchWrite
          }
        },
      },
    });
  }

  // --------------- OTHER -------------------------------
  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}
  // --------------- LOAD AND CLEANUP --------------------

  private startOfWeek(): Timestamp {
    const now = new Date();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - now.getDay());
    sunday.setHours(0, 0, 0, 0);
    return Timestamp.fromDate(sunday);
  }

  ngOnInit(): void {
    const userId = this.authStore.user()?.__id;
    if (!userId) return;

    this.weeklyGoalStore.load(
      [
        ['__userId', '==', userId],
        ['completed', '==', false],
      ],
      { orderBy: 'order' },
      (g) => [
        LoadQuarterlyGoal.create(this.quarterlyGoalStore, [['__id', '==', g.__quarterlyGoalId]], {}),
        LoadHashtag.create(this.hashtagStore, [['__id', '==', g.__hashtagId]], {}),
      ],
    );

    this.weeklyGoalStore.load(
      [
        ['__userId', '==', userId],
        ['completed', '==', true],
        ['completionDate', '>=', this.startOfWeek()],
      ],
      { orderBy: 'order' },
      (g) => [
        LoadQuarterlyGoal.create(this.quarterlyGoalStore, [['__id', '==', g.__quarterlyGoalId]], {}),
        LoadHashtag.create(this.hashtagStore, [['__id', '==', g.__hashtagId]], {}),
      ],
    );
  }
}