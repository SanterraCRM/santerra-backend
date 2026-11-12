import { injectable } from "tsyringe";

import {
  MailDeliveryError,
  MailMessage,
  MailProvider,
} from "../../application/mail/mail-provider";

const RESEND_API_URL = "https://api.resend.com/emails";
const USER_AGENT = "webup-backend";
const REQUEST_TIMEOUT_IN_MILLISECONDS = 10_000;

interface ResendErrorBody {
  name?: string;
  message?: string;
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `A variável de ambiente ${name} é obrigatória para enviar e-mails pelo Resend.`,
    );
  }

  return value;
}

@injectable()
export class ResendMailProvider implements MailProvider {
  private readonly apiKey = requireEnv("RESEND_API_KEY");
  private readonly from = requireEnv("MAIL_FROM");

  async send(message: MailMessage): Promise<void> {
    let response: Response;

    try {
      response = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "User-Agent": USER_AGENT,
        },
        body: JSON.stringify({
          from: this.from,
          to: [message.to],
          subject: message.subject,
          text: message.text,
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_IN_MILLISECONDS),
      });
    } catch (error) {
      console.error(
        `[mail] Não foi possível conectar ao Resend para enviar e-mail para ${message.to}.`,
        error,
      );
      throw new MailDeliveryError();
    }

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as ResendErrorBody | null;

      console.error(
        `[mail] O Resend recusou o e-mail para ${message.to}: ${response.status} ${body?.name ?? ""} ${body?.message ?? ""}`.trim(),
      );
      throw new MailDeliveryError();
    }
  }
}
