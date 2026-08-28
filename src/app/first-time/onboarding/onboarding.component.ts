import { Component, OnInit, ChangeDetectionStrategy, inject, WritableSignal, Signal, signal, computed } from '@angular/core';
import { OnboardingAnimations } from './onboarding.animations';
import { User, OnboardingState } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { UserStore } from 'src/app/core/store/user/user.store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { InitialPageComponent } from './step-pages/initial-page/initial-page.component';
import { OnboardLongTermGoalsComponent } from './step-pages/onboard-long-term-goals/onboard-long-term-goals.component';
import { OnboardLongTermTransitionComponent } from './step-pages/onboard-long-term-transition/onboard-long-term-transition.component';
import { OnboardQuarterlyGoalsComponent } from './step-pages/onboard-quarterly-goals/onboard-quarterly-goals.component';
import { OrganizeQuarterlyGoalsComponent } from './step-pages/organize-quarterly-goals/organize-quarterly-goals.component';
import { OnboardWeeklyGoalsComponent } from './step-pages/onboard-weekly-goals/onboard-weekly-goals.component';
import { FinalPageComponent } from './step-pages/final-page/final-page.component';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  animations: OnboardingAnimations,
  imports: [
    ProgressBarComponent,
    InitialPageComponent,
    OnboardLongTermGoalsComponent,
    OnboardLongTermTransitionComponent,
    OnboardQuarterlyGoalsComponent,
    OrganizeQuarterlyGoalsComponent,
    OnboardWeeklyGoalsComponent,
    FinalPageComponent,
  ],
})
export class OnboardingComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly userStore = inject(UserStore);
  private readonly snackBar = inject(MatSnackBar);

  // --------------- INPUTS AND OUTPUTS ------------------

  // --------------- LOCAL UI STATE ----------------------

  /** Loading indicator state to disable action buttons. */
  loading = signal<boolean>(false);

  /** Triggers if the user loading takes longer than 10 seconds. */
  isTimeout = signal<boolean>(false);

  // --------------- COMPUTED DATA -----------------------

  /** The currently signed in user. */
  currentUser: Signal<User | null | undefined> = this.authStore.user;

  /** Indicates if the user session/state is currently fetching on boot. */
  isLoading = computed(() => !this.currentUser() && !this.isTimeout());

  /** Computes the current user's onboarding state from the AuthStore. */
  onboardingState = computed(() => this.currentUser()?.onboardingState);

  // --------------- EVENT HANDLING ----------------------

  /** Triggered when a step page emits a next event. Computes and saves the next onboardingState to Firestore. */
  async goNextStep(): Promise<void> {
    const userId = this.currentUser()?.__id;
    const currentState = this.onboardingState();
    if (!userId || !currentState) return;

    let nextState: OnboardingState;
    switch (currentState) {
      case OnboardingState.WELCOME: nextState = OnboardingState.STEP_1; break;
      case OnboardingState.STEP_1: nextState = OnboardingState.STEP_2; break;
      case OnboardingState.STEP_2: nextState = OnboardingState.STEP_3; break;
      case OnboardingState.STEP_3: nextState = OnboardingState.STEP_4; break;
      case OnboardingState.STEP_4: nextState = OnboardingState.STEP_5; break;
      case OnboardingState.STEP_5: nextState = OnboardingState.STEP_6; break;
      case OnboardingState.STEP_6: nextState = OnboardingState.STEP_7; break;
      case OnboardingState.STEP_7: nextState = OnboardingState.DONE; break;
      default: return;
    }

    this.loading.set(true);
    try {
      await this.userStore.update(userId, { onboardingState: nextState });
    } catch (e) {
      console.error('Failed to progress onboarding step', e);
      this.snackBar.open('Failed to progress to the next step. Please try again.', 'Dismiss', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  /** Triggered when a step page emits a back event. Computes and saves the previous onboardingState to Firestore. */
  async goBackStep(): Promise<void> {
    const userId = this.currentUser()?.__id;
    const currentState = this.onboardingState();
    if (!userId || !currentState) return;

    let prevState: OnboardingState;
    switch (currentState) {
      case OnboardingState.STEP_1: prevState = OnboardingState.WELCOME; break;
      case OnboardingState.STEP_2: prevState = OnboardingState.STEP_1; break;
      case OnboardingState.STEP_3: prevState = OnboardingState.STEP_2; break;
      case OnboardingState.STEP_4: prevState = OnboardingState.STEP_3; break;
      case OnboardingState.STEP_5: prevState = OnboardingState.STEP_4; break;
      case OnboardingState.STEP_6: prevState = OnboardingState.STEP_5; break;
      case OnboardingState.STEP_7: prevState = OnboardingState.STEP_6; break;
      default: return;
    }

    this.loading.set(true);
    try {
      await this.userStore.update(userId, { onboardingState: prevState });
    } catch (e) {
      console.error('Failed to revert onboarding step', e);
      this.snackBar.open('Failed to go back to the previous step. Please try again.', 'Dismiss', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  /** Reloads or re-triggers auth initialization when user clicks Retry on timeout. */
  retryLoad() {
    this.isTimeout.set(false);
    this.authStore.loadAuth();
    this.setupTimeout();
  }

  /** Logs the user out if they choose to abort loading. */
  async signOut() {
    await this.authStore.logout();
  }

  // --------------- OTHER -------------------------------

  private setupTimeout() {
    setTimeout(() => {
      if (!this.currentUser()) {
        this.isTimeout.set(true);
      }
    }, 10000);
  }

  // --------------- LOAD AND CLEANUP --------------------

  ngOnInit() {
    this.setupTimeout();
  }
}
