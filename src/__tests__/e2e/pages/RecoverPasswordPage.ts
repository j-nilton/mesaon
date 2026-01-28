import { AndroidDevice } from '@playwright/test';

export class RecoverPasswordPage {
  constructor(private device: AndroidDevice) {}

  get emailInput() { return { desc: 'recover-email-input' }; }
  get submitButton() { return { desc: 'recover-submit-button' }; }

  async recover(email: string) {
    await this.device.wait(this.emailInput);
    await this.device.tap(this.emailInput);
    await this.device.fill(this.emailInput, email);
    await this.device.tap(this.submitButton);
  }
}
