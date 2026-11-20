import { inject, Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, Signal } from '@angular/core';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { MatMenuModule } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatMenuModule, MatIcon],
})
export class NavbarComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly router = inject(Router);

  // --------------- INPUTS AND OUTPUTS ------------------

  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;

  // --------------- LOCAL UI STATE ----------------------

  // --------------- COMPUTED DATA -----------------------

  // --------------- EVENT HANDLING ----------------------

  /** Logs out the user */
  logout() {
    this.authStore.logout();
  }
  /** Navigate to homepage by clicking Compass logo */
  homepage(){
    this.router.navigate(['/home']);
  }

  // --------------- OTHER -------------------------------

  constructor() {
  }

  ngOnInit(): void {
  }
}