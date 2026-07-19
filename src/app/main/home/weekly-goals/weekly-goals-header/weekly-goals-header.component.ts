import { Component, OnInit, ChangeDetectionStrategy, input, output, inject, WritableSignal, Signal, signal, computed, Inject, Injector, OutputEmitterRef } from '@angular/core';
import { WeeklyGoalsHeaderAnimations } from './weekly-goals-header.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { endOfWeek } from '../../../../core/utils/time.utils';
import { startOfWeek } from '../../../../core/utils/time.utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-weekly-goals-header',
  templateUrl: './weekly-goals-header.component.html',
  styleUrls: ['./weekly-goals-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: WeeklyGoalsHeaderAnimations,
  standalone: true,
  imports: [ MatIconModule,
  ],
})
export class WeeklyGoalsHeaderComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  // --------------- INPUTS AND OUTPUTS ------------------
  editClicked: OutputEmitterRef<boolean> = output<boolean>();

  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;

  // --------------- LOCAL UI STATE ----------------------

  /** Loading icon. */
  loading: WritableSignal<boolean> = signal(false);

 // --------------- COMPUTED DATA -----------------------
  endOfWeek = endOfWeek;
  startOfWeek = startOfWeek;

  // --------------- EVENT HANDLING ----------------------
  editGoals() {
    this.editClicked.emit(true);
  }

  // --------------- OTHER -------------------------------

  constructor(
    private injector: Injector,
    @Inject(BATCH_WRITE_SERVICE) private batch: BatchWriteService,
    private snackBar: MatSnackBar,
  ) { }

  // --------------- LOAD AND CLEANUP --------------------
  
  ngOnInit(): void {
  }
}
