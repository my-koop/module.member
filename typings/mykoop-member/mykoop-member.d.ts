// Type definitions for module v0.0.0
// Project: https://github.com/my-koop/service.website
// Definitions by: Michael Ferris <https://github.com/Cellule/>
// Definitions: https://github.com/my-koop/type.definitions

/// <reference path="../mykoop/mykoop.d.ts" />
/// <reference path="./interfaces.d.ts" />
declare module mkmember {

  export interface Module extends mykoop.IModule {
    getSubcriptionOptions(
      params: GetSubcriptionOptions.Params,
      callback: GetSubcriptionOptions.Callback
    );
    __getSubcriptionOptions(
      connection: mysql.IConnection,
      params: GetSubcriptionOptions.Params,
      callback: GetSubcriptionOptions.Callback
    );

    isUserAMember(
      params: IsUserAMember.Params,
      callback: IsUserAMember.Callback
    );
    __isUserAMember(
      connection: mysql.IConnection,
      params: IsUserAMember.Params,
      callback: IsUserAMember.Callback
    );

    updateMemberInfo(
      params: UpdateMemberInfo.Params,
      callback: UpdateMemberInfo.Callback
    );
    __updateMemberInfo(
      connection: mysql.IConnection,
      params: UpdateMemberInfo.Params,
      callback: UpdateMemberInfo.Callback
    );
  }
}

