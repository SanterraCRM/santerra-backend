import { WalletProps } from "../../domain/entities/wallet";
import {
  WalletDetails,
  WalletListItem,
  WalletMember,
} from "../../domain/repositories/wallet-repository";

export interface WalletDetailsDto extends WalletProps {
  member: WalletMember;
}

export interface WalletListItemDto extends WalletDetailsDto {
  actionsCount: number;
}

export function toWalletDetailsDto({ wallet, member }: WalletDetails): WalletDetailsDto {
  return { ...wallet.toObject(), member };
}

export function toWalletListItemDto({ actionsCount, ...details }: WalletListItem): WalletListItemDto {
  return { ...toWalletDetailsDto(details), actionsCount };
}
