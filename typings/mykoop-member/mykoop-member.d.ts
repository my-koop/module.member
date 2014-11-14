// Type definitions for module v0.0.0
// Project: https://github.com/my-koop/service.website
// Definitions by: Michael Ferris <https://github.com/Cellule/>
// Definitions: https://github.com/my-koop/type.definitions

/// <reference path="../mykoop/mykoop.d.ts" />
declare module mkmember {

  export interface MKOption {
    value: string;
    name: string;
    type: string;
  }
  export interface MemberInfo {
    isActive: boolean;
    isMember: boolean;
    activeUntil: Date;
  }

  export interface UpdateMember {
    id: number;
    isMember: boolean;
    subPrice: number;
    feePrice: number;
  }

  export interface Module extends mykoop.IModule {
    getSubOptions(
      callback: (err: Error, ret: mkmember.MKOption[]) => void
    ): void;

    getMemberInfo(
      id,
      callback: (err: Error, res ?: mkmember.MemberInfo) => void
    ): void;

    updateMemberInfo(
      updateInfo: mkmember.UpdateMember,
      callback: (err: Error) =>void
    ): void;
  }
}

