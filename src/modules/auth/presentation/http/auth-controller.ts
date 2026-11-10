import { RequestHandler } from "express";
import { injectable } from "tsyringe";

import { getAuthContext } from "../../../../shared/http/request-context";
import { CreateCompanyUseCase } from "../../application/use-cases/create-company-use-case";
import { ForgotPasswordUseCase } from "../../application/use-cases/forgot-password-use-case";
import { GetSessionUseCase } from "../../application/use-cases/get-session-use-case";
import { LoginUseCase } from "../../application/use-cases/login-use-case";
import { ResetPasswordUseCase } from "../../application/use-cases/reset-password-use-case";
import { SelectCompanyUseCase } from "../../application/use-cases/select-company-use-case";
import { SendEmailVerificationUseCase } from "../../application/use-cases/send-email-verification-use-case";
import { SignUpUseCase } from "../../application/use-cases/sign-up-use-case";
import { VerifyEmailUseCase } from "../../application/use-cases/verify-email-use-case";
import {
  createCompanySchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  selectCompanySchema,
  sendEmailVerificationSchema,
  signUpSchema,
  verifyEmailSchema,
} from "./auth-schemas";

@injectable()
export class AuthController {
  constructor(
    private readonly sendEmailVerificationUseCase: SendEmailVerificationUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly signUpUseCase: SignUpUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly selectCompanyUseCase: SelectCompanyUseCase,
    private readonly getSessionUseCase: GetSessionUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly createCompanyUseCase: CreateCompanyUseCase,
  ) {}

  sendEmailVerification: RequestHandler = async (request, response) => {
    await this.sendEmailVerificationUseCase.execute(
      sendEmailVerificationSchema.parse(request.body),
    );

    response.status(204).send();
  };

  verifyEmail: RequestHandler = async (request, response) => {
    const result = await this.verifyEmailUseCase.execute(
      verifyEmailSchema.parse(request.body),
    );

    response.status(200).json(result);
  };

  signUp: RequestHandler = async (request, response) => {
    const result = await this.signUpUseCase.execute(
      signUpSchema.parse(request.body),
    );

    response.status(201).json(result);
  };

  login: RequestHandler = async (request, response) => {
    const result = await this.loginUseCase.execute(
      loginSchema.parse(request.body),
    );

    response.status(200).json(result);
  };

  forgotPassword: RequestHandler = async (request, response) => {
    await this.forgotPasswordUseCase.execute(
      forgotPasswordSchema.parse(request.body),
    );

    response.status(204).send();
  };

  resetPassword: RequestHandler = async (request, response) => {
    await this.resetPasswordUseCase.execute(
      resetPasswordSchema.parse(request.body),
    );

    response.status(204).send();
  };

  selectCompany: RequestHandler = async (request, response) => {
    const result = await this.selectCompanyUseCase.execute(
      selectCompanySchema.parse(request.body),
      getAuthContext(request),
    );

    response.status(200).json(result);
  };

  me: RequestHandler = async (request, response) => {
    const session = await this.getSessionUseCase.execute(
      getAuthContext(request),
      request.tenant ?? null,
    );

    response.status(200).json(session);
  };

  createCompany: RequestHandler = async (request, response) => {
    const company = await this.createCompanyUseCase.execute(
      createCompanySchema.parse(request.body),
      getAuthContext(request),
    );

    response.status(201).json(company);
  };
}
