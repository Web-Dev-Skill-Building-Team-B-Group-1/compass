import { Component, OnInit, ChangeDetectionStrategy, input, output, inject, WritableSignal, Signal, signal, computed, Inject, Injector, LOCALE_ID} from '@angular/core';
import { formatDate, DatePipe } from '@angular/common';
import { DateTimeAnimations } from './date-time.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval, map, concatMap } from 'rxjs';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-date-time',
  templateUrl: './date-time.component.html',
  styleUrls: ['./date-time.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: DateTimeAnimations,
  standalone: true,
  imports: [ DatePipe],
})
export class DateTimeComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  // --------------- INPUTS AND OUTPUTS ------------------

  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;

  // --------------- LOCAL UI STATE ----------------------

  /** Loading icon. */
  loading: WritableSignal<boolean> = signal(false);

  // --------------- COMPUTED DATA -----------------------

  formattedDate: string = '';
  
  // --------------- EVENT HANDLING ----------------------

  timeSet: Signal<Date> = toSignal(interval(1000).pipe(map(()=>new Date())), {initialValue:new Date()} );
  
  
  // --------------- OTHER -------------------------------

  constructor(
    private injector: Injector,
    @Inject(BATCH_WRITE_SERVICE) private batch: BatchWriteService,
    @Inject(LOCALE_ID) private locale: string  
    ) { }

  // --------------- LOAD AND CLEANUP --------------------
  
  ngOnInit(): void {
    const currentDate = new Date();
    this.formattedDate = formatDate(currentDate, 'MMMM d, y', this.locale);
  }
}
