// Type definitions for module v0.0.0
// Project: https://github.com/my-koop/service.website
// Definitions by: Michael Ferris <https://github.com/Cellule/>
// Definitions: https://github.com/my-koop/type.definitions

/// <reference path="../mykoop/mykoop.d.ts" />
declare module mkmember {


  interface Option {
    name: string;
    value: string;
  }
  export interface MKOption {
    options: Array<Option>;
    price: number;
  }

  export interface UpdateMember {
    id: number;
    subPrice: number;
    feePrice: number;
  }

  export interface Module extends mykoop.IModule {
    getSubcriptionOptions(
      callback: (err: Error, ret: mkmember.MKOption) => void
    ): void;

    getIsUserAMember(
      id,
      callback: (err: Error, res ?: boolean) => void
    ): void;

    updateMemberInfo(
      updateInfo: mkmember.UpdateMember,
      callback: (err: Error) =>void
    ): void;
  }
}

