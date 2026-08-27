# Onboarding — Component Plan

Detailed plans for the container (smart) and presentational (dumb) components of the onboarding flow, specifically focusing on `OrganizeQuarterlyGoalsComponent`.

---

## Container Components

### OnboardingComponent

**Route Params, Query Params, and Local UI State**
* **userStore (UserStore):** Sourced from dependency injection to update user onboarding state.
  ```typescript
  readonly userStore = inject(UserStore);
  ```
* **snackBar (MatSnackBar):** Sourced from dependency injection to show error messages.
  ```typescript
  private readonly snackBar = inject(MatSnackBar);
  ```
* **currentUser (Signal<User>):** The currently logged in user, sourced from `AuthStore`.
  ```typescript
  currentUser: Signal<User> = this.authStore.user;
  ```
* **loading (WritableSignal<boolean>):** Local state to manage visual loading indicator for step transitions.
  ```typescript
  loading = signal<boolean>(false);
  ```
* **isLoading (Signal<boolean>):** Indicates if the user session/state is currently fetching on boot.
  ```typescript
  isLoading = computed(() => !this.currentUser() && !this.isTimeout());
  ```
* **isTimeout (WritableSignal<boolean>):** Triggers if the user loading takes longer than 10 seconds.
  ```typescript
  isTimeout = signal<boolean>(false);
  ```

**Store Selectors**
* **onboardingState (Signal<OnboardingState | undefined>):** Computes the current user's onboarding state from the AuthStore.
  ```typescript
  onboardingState = computed(() => this.currentUser()?.onboardingState);
  ```
* **activeStepIndex (Signal<number>):** Computes the progress bar active step index based on the current onboardingState.
  ```typescript
  activeStepIndex = computed(() => {
    const state = this.onboardingState();
    switch (state) {
      case OnboardingState.WELCOME:
        return 0;
      case OnboardingState.STEP_1:
      case OnboardingState.STEP_2:
        return 0; // LONG TERM GOALS
      case OnboardingState.STEP_3:
        return 1; // QUARTER GOALS
      case OnboardingState.STEP_4:
        return 2; // ORGANIZE (Quarterly)
      case OnboardingState.STEP_5:
      case OnboardingState.STEP_6:
        return 3; // WEEKLY GOALS
      case OnboardingState.STEP_7:
        return 4; // ORGANIZE (Weekly)
      default:
        return 0;
    }
  });
  ```

**Data Loading and Streaming**
* No external Firestore data streams are needed for this page layout as the user session/state is already streamed automatically by the `AuthStore` on app boot.
* On initialization (`ngOnInit`), set a 10-second timeout to display an error state if the user data is not yet resolved.
  ```typescript
  ngOnInit() {
    setTimeout(() => {
      if (!this.currentUser()) {
        this.isTimeout.set(true);
      }
    }, 10000);
  }
  ```

**Event Handlers and Backend Actions**
* **goNextStep (`goNextStep`):** Triggered when a step page emits a next event. Computes and saves the next onboardingState to Firestore.
  ```typescript
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
  ```
* **goBackStep (`goBackStep`):** Triggered when a step page emits a back event. Computes and saves the previous onboardingState to Firestore.
  ```typescript
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
  ```
* **retryLoad (`retryLoad`):** Reloads or re-triggers auth initialization when user clicks Retry on timeout.
  ```typescript
  retryLoad() {
    this.isTimeout.set(false);
    this.authStore.loadAuth();
    setTimeout(() => {
      if (!this.currentUser()) {
        this.isTimeout.set(true);
      }
    }, 10000);
  }
  ```
* **signOut (`signOut`):** Logs the user out if they choose to abort loading.
  ```typescript
  async signOut() {
    await this.authStore.logout();
  }
  ```

**Integration Test Scenarios**
* **Happy Path**
  * should render the onboarding container layout with `app-progress-bar` once loaded.
  * should render `app-initial-page` when `onboardingState` is `WELCOME`.
  * should render `app-organize-quarterly-goals` when `onboardingState` is `STEP_4`.
  * should update user onboardingState in `UserStore` to `STEP_5` when `app-organize-quarterly-goals` emits next event.
  * should update user onboardingState in `UserStore` to `STEP_3` when `app-organize-quarterly-goals` emits back event.
* **Edge Cases / Error Handling**
  * should render a loading spinner when `isLoading` is true (before auth user resolves).
  * should show a timeout error template with "Retry" and "Sign Out" buttons if user data loading takes longer than 10 seconds.
  * should call `authStore.logout()` if user clicks "Sign Out" on the timeout template.
  * should show snackbar notification and clear loading state if database write fails during transition.

---

## Presentational Components

### OrganizeQuarterlyGoalsComponent

**Inputs and Outputs**
* **loading (input):** Controls whether buttons are disabled and shows a loading state.
  ```typescript
  loading = input<boolean>(false);
  ```
* **next (output):** Emitted when the user clicks the "Next" button.
  ```typescript
  next = output<void>();
  ```
* **back (output):** Emitted when the user clicks the "Back" button.
  ```typescript
  back = output<void>();
  ```

**Local UI State**
* None. (Stateless)

**Visual States**
* **Default Card:** Displays the circle logo containing the compass navigation arrow in the center, title "One step at a time.", description text "Weekly planning will keep you on track to achieve your goals. Start with three goals for the week.", and "Back" / "Next" action buttons aligned on the bottom right.
* **Loading State:** If `loading()` input is true, the buttons are disabled, and a loading spinner is visible on the "Next" / "Back" action area.

**Accessibility**
* Main container uses `<main>` semantic tag.
* Action buttons use `<button>` tag (not clickable divs).
* Back and Next buttons have clear descriptive labels (already text-based).
* Compass icon has `aria-hidden="true"` as it is a purely decorative SVG/graphic.

**Unit Test Scenarios**
* **Happy Path**
  * should render card content, title, and description text.
  * should emit `next` when "Next" button is clicked.
  * should emit `back` when "Back" button is clicked.
* **Edge Cases / Error Handling**
  * should disable Back and Next buttons when `loading()` input is true.

---

### ProgressBarComponent

**Inputs and Outputs**
* **activeStepIndex (input):** The 0-based index of the currently active step.
  ```typescript
  activeStepIndex = input.required<number>();
  ```
* **steps (input):** The array of step labels to display in the progress bar.
  ```typescript
  steps = input<string[]>([
    'LONG TERM GOALS',
    'QUARTER GOALS',
    'ORGANIZE',
    'WEEKLY GOALS',
    'ORGANIZE'
  ]);
  ```

**Local UI State**
* None. (Stateless)

**Visual States**
* **Completed Step:** Circle is fully filled with the primary teal color. The connecting line to the next step is also green/teal.
* **Active Step:** Circle is represented as a green/teal outline. The text label is styled with active green/teal color.
* **Inactive/Upcoming Step:** Circle is represented as a grey outline. The connecting line and label are light grey.

**Accessibility**
* The progress bar is marked up as a `<nav>` with `aria-label="Onboarding progress"`.
* Renders a `role="progressbar"` element with `aria-valuenow`, `aria-valuemin="1"`, and `aria-valuemax` computed from `steps().length`.
* Text labels are associated using `aria-describedby` or are visually readable.

**Unit Test Scenarios**
* **Happy Path**
  * should render a progress step node for each step label provided.
  * should apply completed class to all steps with index less than `activeStepIndex()`.
  * should apply active class to the step node at `activeStepIndex()`.
* **Edge Cases / Error Handling**
  * should gracefully handle empty `steps` input by rendering nothing.
  * should clamp or handle out-of-bounds `activeStepIndex()` values cleanly.

---

## Implementation Sequence

### Task 0: Shared Infrastructure
No new database models or external services are needed. We will use the existing `UserStore` and `AuthStore`.

### Onboarding Group

- [ ] **Task 1: ProgressBarComponent** (presentational)
  - **Scope:** Create `ProgressBarComponent` presentational template, styling, and inputs/outputs. Refactor the existing boilerplate file.
  - **Verification:** `npm test -- --testPathPattern=progress-bar`
  - **Commit message:** `feat(onboarding): implement progress-bar presentational component`

- [ ] **Task 2: OrganizeQuarterlyGoalsComponent** (presentational)
  - **Scope:** Convert `OrganizeQuarterlyGoalsComponent` into a presentational component. Implement the template layout, styling (including CSS gradients and flex alignment corresponding to screenshot), `loading` input, and `next` / `back` output emitters.
  - **Verification:** `npm test -- --testPathPattern=organize-quarterly-goals`
  - **Commit message:** `feat(onboarding): implement organize-quarterly-goals step presentational component`

- [ ] **Task 3: OnboardingComponent** (container)
  - **Scope:** Update `OnboardingComponent` to manage the boot loading spinner, 10-second timeout fallback state with Retry/Sign Out, render `ProgressBarComponent`, and handle next/back output events from `OrganizeQuarterlyGoalsComponent` to execute user database updates.
  - **Verification:** `npm test -- --testPathPattern=onboarding`
  - **Commit message:** `feat(onboarding): wire up onboarding container with step transitions and timeout recovery`

---

## Appendix: Component Plan Stances & Open Issues

### Container Components

*   🔵 **Timeout Strategy (Cycle 2):** User agreed to implement a 10-second timeout fallback UI if user auth data fails to load on boot, displaying Retry and Sign Out buttons.
*   🔵 **Component Decoupling (Cycle 2):** User agreed to make `OrganizeQuarterlyGoalsComponent` a presentational (dumb) component rather than a smart container, routing all state writes through the parent `OnboardingComponent`.

### Presentational Components
