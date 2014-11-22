

declare module mkmember {

  export interface Option {
    name: string;
    value: string;
  }

  module GetSubcriptionOptions {
    export interface Params {}
    export interface Callback {
      (err: Error, res?: {
        options: Array<Option>;
        price: number;
      }) : void;
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
      subPrice: number;
      feePrice: number;
    }
    export interface Callback {
      (err?: Error) : void;
    }
  }
}
