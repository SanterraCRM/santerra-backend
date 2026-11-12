import { ServiceUnavailableError } from "../../errors/app-error";

export const MAIL_PROVIDER = "MailProvider";

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
}

export class MailDeliveryError extends ServiceUnavailableError {
  constructor() {
    super("Não foi possível enviar o e-mail agora. Tente novamente em instantes.");
  }
}

export interface MailProvider {
  send(message: MailMessage): Promise<void>;
}
