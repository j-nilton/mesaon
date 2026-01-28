import { AndroidDevice } from '@playwright/test';

export class RegisterPage {
  constructor(private device: AndroidDevice) { }

  get nameInput() { return { desc: 'name-input' }; }
  get emailInput() { return { desc: 'email-input' }; }
  get passwordInput() { return { desc: 'password-input' }; }
  get confirmPasswordInput() { return { desc: 'confirm-password-input' }; }
  get submitButton() { return { desc: 'register-submit-button' }; }
  get loginLink() { return { desc: 'login-link' }; }

  async register(name: string, email: string, pass: string) {
    await this.device.wait(this.nameInput);

    await this.device.tap(this.nameInput);
    await this.device.fill(this.nameInput, name);

    await this.device.tap(this.emailInput);
    await this.device.fill(this.emailInput, email);

    await this.device.tap(this.passwordInput);
    await this.device.fill(this.passwordInput, pass);

    // Fecha o teclado para garantir que o próximo campo esteja visível
    await this.device.shell('input keyevent 4'); // KeyCode 4 = BACK

    // Pequeno delay para a UI se ajustar
    await new Promise(r => setTimeout(r, 1000));

    await this.device.wait(this.confirmPasswordInput);
    await this.device.tap(this.confirmPasswordInput);
    await this.device.fill(this.confirmPasswordInput, pass);

    // Fecha o teclado novamente antes de clicar em enviar
    await this.device.shell('input keyevent 4'); // KeyCode 4 = BACK
    await new Promise(r => setTimeout(r, 1000));

    await this.device.wait(this.submitButton);
    await this.device.tap(this.submitButton);
  }

  async goToLogin() {
    await this.device.tap(this.loginLink);
  }
}
