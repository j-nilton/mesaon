import { AndroidDevice } from '@playwright/test';

export class LoginPage {
  constructor(private device: AndroidDevice) { }

  get emailInput() { return { desc: 'email-input' }; }
  get passwordInput() { return { desc: 'password-input' }; }
  get loginButton() { return { desc: 'login-button' }; }
  get forgotPasswordLink() { return { desc: 'forgot-password-link' }; }
  get registerButton() { return { desc: 'register-button' }; }

  async login(email: string, pass: string) {
    await this.device.wait(this.emailInput);
    await this.device.tap(this.emailInput);
    await this.device.fill(this.emailInput, email);

    await this.device.tap(this.passwordInput);
    await this.device.fill(this.passwordInput, pass);

    await this.device.tap(this.loginButton);
  }

  async goToRegister() {
    await this.device.wait(this.registerButton);
    await this.device.tap(this.registerButton);
  }

  async goToRecoverPassword() {
    await this.device.tap(this.forgotPasswordLink);
  }
}
