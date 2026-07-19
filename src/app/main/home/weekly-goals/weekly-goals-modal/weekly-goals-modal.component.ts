import { Component, OnInit, ChangeDetectionStrategy, inject, WritableSignal, signal } from '@angular/core';
import { WeeklyGoalsModalAnimations } from './weekly-goals-modal.animations';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-weekly-goals-modal',
  templateUrl: './weekly-goals-modal.component.html',
  styleUrls: ['./weekly-goals-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: WeeklyGoalsModalAnimations,
  standalone: true,
  imports: [
    FormsModule,
  ],
})
export class WeeklyGoalsModalComponent implements OnInit {
  // --------------- LOCAL UI STATE ----------------------
  titleInput: WritableSignal<string> = signal('Weekly Goals');
  // --------------- EVENT HANDLING ----------------------
  save(): void {
    this.dialogRef.close(this.titleInput());
  }
  cancel(): void {
    this.dialogRef.close();
  }
  // --------------- OTHER -------------------------------
  constructor(
    private dialogRef: MatDialogRef<WeeklyGoalsModalComponent>,
  ) { }
  // --------------- LOAD AND CLEANUP --------------------
  ngOnInit(): void {
  }
}