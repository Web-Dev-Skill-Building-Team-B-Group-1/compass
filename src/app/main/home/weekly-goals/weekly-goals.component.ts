import { ChangeDetectionStrategy, Component, OnInit, Signal, signal } from '@angular/core';
import { WeeklyGoalsAnimations } from './weekly-goals.animations';
import { WeeklyGoalsHeaderComponent } from './weekly-goals-header/weekly-goals-header.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WeeklyGoalsModalComponent } from './weekly-goals-modal/weekly-goals-modal.component';
import { QuarterlyGoalData, WeeklyGoalData } from '../home.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Timestamp } from '@angular/fire/firestore';
import { CdkDropList, CdkDrag, CdkDragHandle, CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-weekly-goals',
  templateUrl: './weekly-goals.component.html',
  styleUrls: ['./weekly-goals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: WeeklyGoalsAnimations,
  standalone: true,
  imports: [
    WeeklyGoalsHeaderComponent, 
    WeeklyGoalsModalComponent,
    CdkDropList,
    CdkDrag,
    CdkDragHandle
  ]
  
})
export class WeeklyGoalsComponent implements OnInit {
  // --------------- INPUTS AND OUTPUTS ------------------

  // --------------- LOCAL UI STATE ----------------------

  incompleteWeeklyGoals: Signal<WeeklyGoalData[]> = signal([
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
  ]);

  completeWeeklyGoals: Signal<WeeklyGoalData[]> = signal([
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
  ]);

  quarterlyGoals: Signal<QuarterlyGoalData[]> = signal([
    {
      __id: 'qg1',
      __userId: 'test-user',
      __hashtagId: 'ht1',
      text: 'Finish cover letters',
      completed: false,
      order: 1,
      _createdAt: Timestamp.now(),
      _updatedAt: Timestamp.now(),
      _deleted: false,
      hashtag: {
        __id: 'ht1',
        name: 'coverletter',
        color: '#EE8B72',
        _createdAt: Timestamp.now(),
        _updatedAt: Timestamp.now(),
        _deleted: false,
      },
      weeklyGoalsTotal: 1,
      weeklyGoalsComplete: 0,
    },
    {
      __id: 'qg2',
      __userId: 'test-user',
      __hashtagId: 'ht2',
      text: 'Apply to internships',
      completed: false,
      order: 2,
      _createdAt: Timestamp.now(),
      _updatedAt: Timestamp.now(),
      _deleted: false,
      hashtag: {
        __id: 'ht2',
        name: 'apply',
        color: '#2DBDB1',
        _createdAt: Timestamp.now(),
        _updatedAt: Timestamp.now(),
        _deleted: false,
      },
      weeklyGoalsTotal: 1,
      weeklyGoalsComplete: 0,
    },
    {
      __id: 'qg3',
      __userId: 'test-user',
      __hashtagId: 'ht3',
      text: 'Technical interview prep!',
      completed: false,
      order: 3,
      _createdAt: Timestamp.now(),
      _updatedAt: Timestamp.now(),
      _deleted: false,
      hashtag: {
        __id: 'ht3',
        name: 'interview',
        color: '#FFB987',
        _createdAt: Timestamp.now(),
        _updatedAt: Timestamp.now(),
        _deleted: false,
      },
      weeklyGoalsTotal: 1,
      weeklyGoalsComplete: 1,
    },
  ]);

  /** For storing the dialogRef in the opened modal. */
  dialogRef: MatDialogRef<any>;

  // --------------- COMPUTED DATA -----------------------
  // --------------- EVENT HANDLING ----------------------

  /** Update weekly goals. */
  openModal(editClicked: boolean) {
    this.dialogRef = this.dialog.open(WeeklyGoalsModalComponent, {
      height: '90%',
      position: { bottom: '0' },
      panelClass: 'goal-modal-panel',
      data: {
        goalDatas: this.quarterlyGoals(),
        incompleteGoals: this.incompleteWeeklyGoals(),
        updateWeeklyGoals: async (weeklyGoalsFormArray) => {
          try {
            this.snackBar.open('Goals were updated', '', {
              duration: 3000,
              verticalPosition: 'bottom',
              horizontalPosition: 'center',
            });
            this.dialogRef.close();
          } catch (e) {
            console.error(e);
          }
        },
      },
    });
  }

  // --------------- OTHER -------------------------------
  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) { }
  // --------------- LOAD AND CLEANUP --------------------

  ngOnInit() { }
}
