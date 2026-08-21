import { Component, OnInit, ChangeDetectionStrategy, input, output, inject, WritableSignal, Signal, signal, computed, Inject, Injector } from '@angular/core';
import { QuarterlySidebarItemAnimations } from './quarterly-sidebar-item.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { QuarterlyGoalStore } from '../../../../core/store/quarterly-goal/quarterly-goal.store';
import { WeeklyGoal } from '../../../../core/store/weekly-goal/weekly-goal.model';
import { WeeklyGoalStore } from '../../../../core/store/weekly-goal/weekly-goal.store';
import { MatCheckbox } from '@angular/material/checkbox';
import { createId } from 'src/app/core/utils/rand.utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule, NgModel } from '@angular/forms';
import { QuarterlyGoal } from '../../../../core/store/quarterly-goal/quarterly-goal.model';
import { Timestamp } from '@angular/fire/firestore';
@Component({
  selector: 'app-quarterly-sidebar-item',
  templateUrl: './quarterly-sidebar-item.component.html',
  styleUrls: ['./quarterly-sidebar-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: QuarterlySidebarItemAnimations,
  standalone: true,
  imports: [MatCheckbox, MatInput, MatFormField, FormsModule
  ],
})
export class QuarterlySidebarItemComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly weeklyGoalStore = inject(WeeklyGoalStore);
  readonly quarterlyGoalStore = inject(QuarterlyGoalStore);
  // --------------- INPUTS AND OUTPUTS ------------------
  goalId: Signal<string> = input.required<string>();
  
  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;
  
  newRow: WritableSignal<WeeklyGoal | null> = signal(null);
  // --------------- LOCAL UI STATE ----------------------
  currWeeklyGoals: Signal<WeeklyGoal[]> = computed(() =>
    this.weeklyGoalStore.selectEntities([['__quarterlyGoalId', '==', this.goalId()]],{}));
  
  weeklyGoals: Signal<WeeklyGoal[]> = computed(() => {
    const goal =this.newRow();
    return goal?[...this.currWeeklyGoals(), goal]:this.currWeeklyGoals();
  });

  quarterlyGoal: Signal<QuarterlyGoal> = computed(() => 
    this.quarterlyGoalStore.selectEntities([['__id', '==', this.goalId()]], {})[0]
  );
  /** Loading icon. */
  loading: WritableSignal<boolean> = signal(false);

  // --------------- COMPUTED DATA -----------------------

  // --------------- EVENT HANDLING ----------------------
  async addGoal() {
    const currentGoalCount = this.currWeeklyGoals().length;
    const quarterlyGoal = this.quarterlyGoal();
    const newGoal = {
      __id: createId(),
      __userId: this.currentUser()?.__id,
      __quarterlyGoalId: this.goalId(),
      __hashtagId: quarterlyGoal.__hashtagId,
      text: '',
      completed: false,
      order: currentGoalCount+2,
    };
    this.newRow.set(newGoal);
  }

  async onBlur(goal:WeeklyGoal, field:NgModel){
    if (field.dirty){
      const newgoal = goal.__id === this.newRow()?.__id;
      if(newgoal && goal.text === ''){
        this.newRow.set(null);
        return;
      }
      try {
        if(newgoal){
          await this.weeklyGoalStore.add(goal);
          this.newRow.set(null);
        } else{
          await this.weeklyGoalStore.update(goal.__id, {text:goal.text});
        }
      } catch (e) {
        console.error(e);
      }
    }
    field.control.markAsPristine();
  }

  async checkGoal(goal: WeeklyGoal) {
    try {
      await this.weeklyGoalStore.update(goal.__id, {
        completed: !goal.completed,
        ...(!goal.completed ? { endDate: Timestamp.now() } : {}),
      }, {
        optimistic: true,
      });
    } catch (e) {
      console.error(e);   
    }
  }
  // --------------- OTHER -------------------------------

  constructor(
    private snackBar: MatSnackBar,
    private injector: Injector,
    @Inject(BATCH_WRITE_SERVICE) private batch: BatchWriteService,
  ) { }

  // --------------- LOAD AND CLEANUP --------------------
  
  ngOnInit() {
    this.weeklyGoalStore.load([['__quarterlyGoalId', '==', this.goalId()]], {});
  }
}
