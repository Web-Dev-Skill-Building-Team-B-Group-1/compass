import { Component, OnInit, ChangeDetectionStrategy, input, output, inject, WritableSignal, Signal, signal, computed, Inject, Injector } from '@angular/core';
import { OrganizeQuarterlyGoalsAnimations } from './organize-quarterly-goals.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';

@Component({
  selector: 'app-organize-quarterly-goals',
  templateUrl: './organize-quarterly-goals.component.html',
  styleUrls: ['./organize-quarterly-goals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: OrganizeQuarterlyGoalsAnimations,
  standalone: true,
  imports: [
  ],
})
export class OrganizeQuarterlyGoalsComponent {
  // --------------- INPUTS AND OUTPUTS ------------------

  /** Loading indicator state to disable action buttons. */
  loading = input<boolean>(false);

  /** Emits when user clicks next step button. */
  next = output<void>();

  /** Emits when user clicks back step button. */
  back = output<void>();

  // --------------- LOCAL UI STATE ----------------------

  // --------------- COMPUTED DATA -----------------------

  // --------------- EVENT HANDLING ----------------------

  /** Triggered on next action click. */
  onNext(): void {
    if (!this.loading()) {
      this.next.emit();
    }
  }

  /** Triggered on back action click. */
  onBack(): void {
    if (!this.loading()) {
      this.back.emit();
    }
  }

  // --------------- OTHER -------------------------------

  constructor(
    private injector: Injector,
    @Inject(BATCH_WRITE_SERVICE) private batch: BatchWriteService,
  ) { }

  // --------------- LOAD AND CLEANUP --------------------

  ngOnInit(): void {
  }
}
