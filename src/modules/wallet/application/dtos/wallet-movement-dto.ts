import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { WalletMovementProps } from "../../domain/entities/wallet-movement";
import {
  WalletMovementAction,
  WalletMovementDetails,
} from "../../domain/repositories/wallet-repository";

export interface WalletMovementDto extends WalletMovementProps {
  createdBy: { id: string; name: string } | null;
  commercialAction: WalletMovementAction | null;
}

export function toWalletMovementDto(
  { movement, createdBy, commercialAction }: WalletMovementDetails,
  context: TenantContext,
): WalletMovementDto {
  return {
    ...movement,
    createdBy,
    commercialAction: context.permissions.includes(PERMISSIONS.COMMERCIAL_ACTIONS_READ)
      ? commercialAction
      : null,
  };
}
