import { signalStore, patchState, withState, withMethods, signalStoreFeature } from '@ngrx/signals';
import { USER_DB } from '../user/user.mock';
import { OnboardingState } from '../user/user.model';

export const AuthMockDB = signalStore(
  { providedIn: 'root' },
  withState({ user: JSON.parse(localStorage.getItem('mockUser')) }),
  withMethods((store) => ({
    login() {
      patchState(store, { user: {
        uid: USER_DB[0].__id,
        email: USER_DB[0].email,
        displayName: USER_DB[0].name,
        photoURL: USER_DB[0].photoURL,
        onboardingState: USER_DB[0].onboardingState
      } });
      localStorage.setItem('mockUser', JSON.stringify(store.user()));
    },
    logout() {
      patchState(store, { user: null });
      localStorage.removeItem('mockUser');
    },
  })),
);

export const AuthLoggedInMockDB = signalStore(
  { providedIn: 'root' },
  withState({ user: {
    uid: USER_DB[0].__id,
    email: USER_DB[0].email,
    displayName: USER_DB[0].name,
    photoURL: USER_DB[0].photoURL,
    onboardingState: USER_DB[0].onboardingState
  } }),
  withMethods((store) => ({
    login() {
      patchState(store, { user: {
        uid: USER_DB[0].__id,
        email: USER_DB[0].email,
        displayName: USER_DB[0].name,
        photoURL: USER_DB[0].photoURL,
        onboardingState: USER_DB[0].onboardingState
      } });
    },
    logout() {
      patchState(store, { user: null });
    },
  })),
);
