# Document Evolution Log — Onboarding Component Design

A structured record of how the design of the onboarding components evolved through the human-AI planning session.

---

## Cycle 1: Initial Draft

### User Input
> I am implementing the onboarding page (specifically the organize page) for my goal-setting application. OrganizeQuarterlyGoalsComponent within OnboardingComponent is where I'm making the changes. Can you help me think through how I'll go about implementing this?
>
> the onboarding component will include the entire flow starting from initial page, going through all the step-pages ending with the final page, but I only need to complete the code for the organize-quarterly-goals component (page provided in the image)

### AI Draft Summary
Drafted initial component specs for the onboarding flow:
1. **OnboardingComponent** (container): Handles orchestration of steps, queries `authStore.user` to compute current `onboardingState` and maps it to a progress bar index.
2. **OrganizeQuarterlyGoalsComponent** (container): Implements the Card layout matching the screenshot with Title, Sub-text, and Back/Next button handlers. Updates `onboardingState` in the `UserStore` to progress or regress steps.
3. **ProgressBarComponent** (presentational): Renders a 5-step progress indicator. Styled with active, completed, and upcoming states.

### What the AI added beyond what the user said
*   Refactored `ProgressBarComponent` to be fully presentational (using `activeStepIndex` and `steps` inputs), resolving the "child calls service" anti-pattern where it previously had direct AuthStore coupling.
*   Computed the mapping logic inside `OnboardingComponent` from 9 `OnboardingState` enum values to 5 visual steps on the progress bar.
*   Provided complete integration and unit test suites covering happy paths, button clicks, state transitions, visual rendering, and DB failure cases.

---

## Cycle 1.5: Auto-Critique & Self-Fix

### AI Critique
1.  **🚨 [CONTAINER_MISSING_LOADING_STATE] OnboardingComponent Boot Loading**: Evaluation of `activeStepIndex` assumed `currentUser` is immediately available, leading to a flash of the WELCOME page before user data resolves.
2.  **⚠️ [CONTAINER_MISSING_ERROR_STATE] OrganizeQuarterlyGoalsComponent Error Path**: `goNext()` and `goBack()` did not trigger any UI-facing alerts on failure.
3.  **⚠️ [AGENT_UNDECLARED_STORE_INJECTION] OrganizeQuarterlyGoalsComponent Missing DI**: Referenced `userStore` without injecting the service.

### User Response
> *(None - Auto-Critique Step)*

### Document Delta
| Field | Before | After |
|---|---|---|
| `OnboardingComponent.isLoading` | Undefined | `computed(() => !this.currentUser())` |
| `OnboardingComponent` Integration Tests | No loading spinner test | `should render a loading spinner when isLoading is true` |
| `OrganizeQuarterlyGoalsComponent.userStore` | Undefined | `readonly userStore = inject(UserStore);` |
| `OrganizeQuarterlyGoalsComponent.snackBar` | Undefined | `private readonly snackBar = inject(MatSnackBar);` |
| `OrganizeQuarterlyGoalsComponent.goNext` | Only did `console.error` on catch | Added `this.snackBar.open(...)` on catch |
| `OrganizeQuarterlyGoalsComponent.goBack` | Only did `console.error` on catch | Added `this.snackBar.open(...)` on catch |

### What shifted
*   AI performed an automated self-review of the drafted plans against constraints/guides, proactively resolving missing state variables, undeclared dependency injections, and silent error catch blocks prior to human review.

---

## Cycle 2: Component Decoupling & Loading Timeout

### AI Critique
1.  **🚨 [CONTAINER_MISSING_ERROR_STATE] OnboardingComponent Loading Fallback**: If user auth data boot loading hangs (e.g. offline status on boot or Firebase permissions block), onboarding is stuck with an indefinite loading spinner. Suggested a 10-second timeout fallback displaying a Retry / Sign Out page.
2.  **⚠️ [ARCH_SMART_DUMB_BOUNDARY] OrganizeQuarterlyGoalsComponent Coupling**: The step page was designed as a container component injecting UserStore directly, despite being a static transition page with no distinct data queries. Suggested refactoring it to a presentational component emitting `(next)` and `(back)` outputs, and centralizing DB updates in `OnboardingComponent`.

### User Response
> 1. a 10 second timeout should work
> 2. yes that would be cleaner

### Document Delta
| Field | Before | After |
|---|---|---|
| `OnboardingComponent.userStore` | Undefined | `readonly userStore = inject(UserStore);` |
| `OnboardingComponent.snackBar` | Undefined | `private readonly snackBar = inject(MatSnackBar);` |
| `OnboardingComponent.isTimeout` | Undefined | `signal<boolean>(false)` |
| `OnboardingComponent.isLoading` | `computed(() => !this.currentUser())` | `computed(() => !this.currentUser() && !this.isTimeout())` |
| `OnboardingComponent.goNextStep` | Undefined | Triggers `userStore.update` to progress `onboardingState` |
| `OnboardingComponent.goBackStep` | Undefined | Triggers `userStore.update` to regress `onboardingState` |
| `OnboardingComponent.retryLoad` | Undefined | Resets `isTimeout` and triggers reload |
| `OnboardingComponent.signOut` | Undefined | Calls `authStore.logout()` |
| `OrganizeQuarterlyGoalsComponent` type | Container | Presentational |
| `OrganizeQuarterlyGoalsComponent.loading` | Local UI state signal | Angular input signal |
| `OrganizeQuarterlyGoalsComponent.next` | `goNext()` event handler | Angular output signal |
| `OrganizeQuarterlyGoalsComponent.back` | `goBack()` event handler | Angular output signal |

### What shifted
*   User accepted the loading fallback strategy, adding timeout protection to boot sequences.
*   User agreed to refactor `OrganizeQuarterlyGoalsComponent` into a presentational component, migrating state modification actions and DI setup into the parent `OnboardingComponent` to enforce unidirectional data flow.
