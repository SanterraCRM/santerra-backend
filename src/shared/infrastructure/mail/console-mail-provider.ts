import { injectable } from "tsyringe";

import {
  MailDeliveryError,
  MailMessage,
  MailProvider,
} from "../../application/mail/mail-provider";

const PRODUCTION_ENVIRONMENTS = ["main", "production"];

@injectable()
export class ConsoleMailProvider implements MailProvider {
  private readonly isProduction = [process.env.APP_ENV, process.env.NODE_ENV].some(
    (environment) =>
      environment !== undefined && PRODUCTION_ENVIRONMENTS.includes(environment),
  );

  async send(message: MailMessage): Promise<void> {
    if (this.isProduction) {
      console.error(
        `[mail] E-mail para ${message.to} não enviado: configure RESEND_API_KEY e MAIL_FROM.`,
      );
      throw new MailDeliveryError();
    }

    console.log(
      `[mail] Para: ${message.to}\n[mail] Assunto: ${message.subject}\n${message.text}`,
    );
  }
}
