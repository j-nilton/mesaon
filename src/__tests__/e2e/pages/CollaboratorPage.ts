import { AndroidDevice } from '@playwright/test';

export class CollaboratorPage {
  constructor(private device: AndroidDevice) {}

  get accessCodeInput() { return { desc: 'access-code-input' }; }
  get generateButton() { return { desc: 'generate-code-button' }; }
  get confirmButton() { return { desc: 'confirm-code-button' }; }
  get title() { return { text: 'Código de acesso' }; }

  async generateCode() {
    await this.device.wait(this.generateButton);
    await this.device.tap(this.generateButton);
  }

  async enterCode(code: string) {
    await this.device.tap(this.accessCodeInput);
    await this.device.fill(this.accessCodeInput, code);
    await this.device.tap(this.confirmButton);
  }
}
