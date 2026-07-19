import { Component, OnInit, ChangeDetectionStrategy, Inject, Injector } from '@angular/core';
import { WeeklyGoalsModalAnimations } from './weekly-goals-modal.animations';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { FormArray, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuarterlyGoalData, WeeklyGoalInForm } from '../../home.model';
import { WeeklyGoal } from 'src/app/core/store/weekly-goal/weekly-goal.model';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { NgFor } from '@angular/common';
import { endOfWeek, startOfWeek } from 'src/app/core/utils/time.utils';
import { MatIconModule } from '@angular/material/icon';
import { CdkDropList, CdkDrag, CdkDragHandle, CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-weekly-goals-modal',
  templateUrl: './weekly-goals-modal.component.html',
  styleUrls: ['./weekly-goals-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: WeeklyGoalsModalAnimations,
  standalone: true,
  imports: [
    MatIconButton,
    MatDialogClose,
    MatIcon,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatSelect,
    MatOption,
    NgFor,
    MatIconModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
  ],
})
export class WeeklyGoalsModalComponent implements OnInit {
  // --------------- INPUTS AND OUTPUTS ------------------

  // --------------- LOCAL UI STATE ----------------------

  weeklyGoalsForm = this.fb.group({
    allGoals: this.fb.array([
      this.fb.group({
        text: ['', Validators.required],
        originalText: [''],
        originalOrder: [1],
        __weeklyGoalId: [''],
        __quarterlyGoalId: [''],
        _deleted: [false],
        _new: [false],
      }),
    ]),
  });

  // --------------- COMPUTED DATA -----------------------

  get allGoals() {
    return this.weeklyGoalsForm.get('allGoals') as FormArray;
  }

  get addedGoalsCount() {
    return this.allGoals.controls.filter(
      (goal) => goal.value._new && !goal.value._deleted
    ).length;
  }

  get editedGoalsCount() {
    return this.allGoals.controls.filter(
      (goal) =>
        goal.dirty &&
        goal.value.text !== goal.value.originalText &&
        !goal.value._new &&
        !goal.value._deleted
    ).length;
  }

  get deletedGoalsCount() {
    return this.allGoals.controls.filter((goal) => goal.value._deleted).length;
  }

  endOfWeek = endOfWeek;
  startOfWeek = startOfWeek;

  // --------------- EVENT HANDLING ----------------------
  async saveGoals() {
      await this.data.updateWeeklyGoals(this.allGoals);
    }
  
    drop(event: CdkDragDrop<unknown>) {
      const control = this.allGoals.at(event.previousIndex);
      this.allGoals.removeAt(event.previousIndex);
      this.allGoals.insert(event.currentIndex, control);
    }
  
    fullDelete(event: Event, index: number) {
      const isDeleted = (event.target as HTMLInputElement).checked;
      const goal = this.allGoals.at(index);
      if (isDeleted && goal.value._new) {
        this.allGoals.removeAt(index);
      }
    }
  // --------------- OTHER -------------------------------

  addGoalToForm(goal: WeeklyGoalInForm) {
    this.allGoals.push(
      this.fb.group({
        text: [goal ? goal.text : '', Validators.required],
        __quarterlyGoalId: [goal ? goal.__quarterlyGoalId : '', Validators.required],
        originalText: [goal ? goal.text : ''],
        _deleted: [goal ? goal._deleted : false],
        _new: [goal ? false : true],
      })
    );
  }

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      goalDatas: Partial<QuarterlyGoalData>[];
      incompleteGoals: WeeklyGoal[];
      updateWeeklyGoals: (weeklyGoalsFormArray: FormArray) => Promise<void>;
    },
    private fb: FormBuilder,
  ) { }

  // --------------- LOAD AND CLEANUP --------------------

  ngOnInit() {
    this.allGoals.clear();
    if (this.data.incompleteGoals.length === 0) {
      this.addGoalToForm(null);
    } else {
      this.data.incompleteGoals.forEach((goal) => {
        this.addGoalToForm({
          text: goal.text,
          __quarterlyGoalId: goal.__quarterlyGoalId,
          originalText: goal.text,
          originalOrder: goal.order,
          originalQuarterlyGoalId: goal.__quarterlyGoalId,
          __weeklyGoalId: goal.__id,
          _deleted: goal._deleted,
          _new: false,
        });
      });
    }
  }
}