import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { OrganizeQuarterlyGoalsComponent } from './organize-quarterly-goals.component';

describe('OrganizeQuarterlyGoalsComponent Unit Tests', () => {
  async function setup(inputs: { loading?: boolean } = {}) {
    const user = userEvent.setup();
    const nextEmit = jasmine.createSpy('nextEmit');
    const backEmit = jasmine.createSpy('backEmit');

    const view = await render(OrganizeQuarterlyGoalsComponent, {
      componentInputs: {
        loading: inputs.loading ?? false,
      },
      on: {
        next: nextEmit,
        back: backEmit,
      },
    });

    return { user, nextEmit, backEmit, fixture: view.fixture };
  }

  it('renders card content, illustration icon, and action buttons', async () => {
    await setup();

    expect(screen.getByText('One step at a time.')).toBeTruthy();
    expect(
      screen.getByText(
        'Weekly planning will keep you on track to achieve your goals. Start with three goals for the week.'
      )
    ).toBeTruthy();

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(2);
  });

  it('emits next event on next button click', async () => {
    const { user, nextEmit } = await setup();

    const buttons = screen.getAllByRole('button');
    const nextBtn = buttons[1]; // Next button is second
    await user.click(nextBtn);
    expect(nextEmit).toHaveBeenCalledTimes(1);
  });

  it('emits back event on back button click', async () => {
    const { user, backEmit } = await setup();

    const buttons = screen.getAllByRole('button');
    const backBtn = buttons[0]; // Back button is first
    await user.click(backBtn);
    expect(backEmit).toHaveBeenCalledTimes(1);
  });

  it('disables action buttons when loading is true', async () => {
    const { user, nextEmit, backEmit } = await setup({ loading: true });

    const buttons = screen.getAllByRole('button');
    const backBtn = buttons[0] as HTMLButtonElement;
    const nextBtn = buttons[1] as HTMLButtonElement;

    expect(backBtn.disabled).toBeTrue();
    expect(nextBtn.disabled).toBeTrue();

    // Check click doesn't trigger emitter
    await user.click(nextBtn);
    await user.click(backBtn);
    expect(nextEmit).not.toHaveBeenCalled();
    expect(backEmit).not.toHaveBeenCalled();
  });
});
