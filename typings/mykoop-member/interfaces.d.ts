

declare module mkmember {

  export interface Option {
    duration: number; // in months
    price: number;
  }

  module GetSubcriptionOptions {
    export interface Params {}
    export interface CallbackResult {
      options: Array<Option>;
      membershipFee: number;
    }
    export interface Callback {
      (err: Error, res?: CallbackResult) : void;
    }
  }

  module IsUserAMember {
    export interface Params {
      id: number;
    }
    export interface Callback {
      (err?: Error, result?: {isMember: boolean}) : void;
    }
  }

  module UpdateMemberInfo {
    export interface Params {
      id: number;
      subscriptionChoice: number;
    }
    export interface Callback {
      (err?: Error) : void;
    }
  }
}
