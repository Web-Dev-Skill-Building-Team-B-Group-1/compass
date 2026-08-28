import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { OnboardingComponent } from './onboarding.component';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { UserStore } from 'src/app/core/store/user/user.store';
import { OnboardingState, User } from 'src/app/core/store/user/user.model';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Timestamp } from '@angular/fire/firestore';
import { DATABASE_SERVICE } from 'src/app/core/firebase/database.service';
import { FirebaseMockService } from 'src/app/core/firebase/firebase.mock.service';
import { BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { BatchWriteMockService } from 'src/app/core/store/batch-write.mock.service';

// Define a test auth store object that holds a writable signal
const mockAuthStore = {
  user: signal<User | null>(null),
  loadAuth: jasmine.createSpy('loadAuth'),
  logout: jasmine.createSpy('logout').and.callFake(() => {
    mockAuthStore.user.set(null);
  }),
};

describe('OnboardingComponent Integration Tests', () => {
  let userStore: InstanceType<typeof UserStore>;
  let mockUser: User;

  beforeEach(async () => {
    mockUser = {
      __id: 'test-user-123',
      name: 'Test Onboarding User',
      email: 'onboard@test.com',
      onboardingState: OnboardingState.STEP_4,
      _createdAt: Timestamp.now(),
      _updatedAt: Timestamp.now(),
      _deleted: false,
    };

    await TestBed.configureTestingModule({
      imports: [OnboardingComponent, MatSnackBarModule, NoopAnimationsModule],
      providers: [
        { provide: AuthStore, useValue: mockAuthStore },
        { provide: DATABASE_SERVICE, useClass: FirebaseMockService },
        { provide: BATCH_WRITE_SERVICE, useClass: BatchWriteMockService },
        UserStore,
      ],
    }).compileComponents();

    userStore = TestBed.inject(UserStore);
  });

  it('renders loading spinner initially when user is not loaded', () => {
    mockAuthStore.user.set(null);
    const fixture = TestBed.createComponent(OnboardingComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.loading-spinner')).toBeTruthy();
    expect(element.querySelector('app-progress-bar')).toBeNull();
  });

  it('renders stepper and step page when user resolves', () => {
    mockAuthStore.user.set(null);
    const fixture = TestBed.createComponent(OnboardingComponent);
    fixture.detectChanges();

    // Now resolve user
    mockAuthStore.user.set(mockUser);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.loading-spinner')).toBeNull();
    expect(element.querySelector('app-progress-bar')).toBeTruthy();
    expect(element.querySelector('app-organize-quarterly-goals')).toBeTruthy();
  });

  it('triggers userStore.update to next state when child emits next', async () => {
    mockAuthStore.user.set(mockUser);
    const fixture = TestBed.createComponent(OnboardingComponent);
    fixture.detectChanges();

    const updateSpy = spyOn(userStore, 'update').and.returnValue(Promise.resolve());

    // Trigger next action
    fixture.componentInstance.goNextStep();

    expect(updateSpy).toHaveBeenCalledWith('test-user-123', {
      onboardingState: OnboardingState.STEP_5,
    });
  });

  it('triggers userStore.update to previous state when child emits back', async () => {
    mockAuthStore.user.set(mockUser);
    const fixture = TestBed.createComponent(OnboardingComponent);
    fixture.detectChanges();

    const updateSpy = spyOn(userStore, 'update').and.returnValue(Promise.resolve());

    // Trigger back action
    fixture.componentInstance.goBackStep();

    expect(updateSpy).toHaveBeenCalledWith('test-user-123', {
      onboardingState: OnboardingState.STEP_3,
    });
  });

  it('shows fallback timeout layout if user loading takes longer than 10 seconds', fakeAsync(() => {
    mockAuthStore.user.set(null);
    const fixture = TestBed.createComponent(OnboardingComponent);
    fixture.detectChanges();

    tick(10000);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.loading-spinner')).toBeNull();
    expect(element.textContent).toContain('Onboarding is taking a bit long to load');

    const signOutBtn = element.querySelector('.btn-solid') as HTMLButtonElement;
    signOutBtn.click();
    expect(mockAuthStore.logout).toHaveBeenCalled();
  }));
});