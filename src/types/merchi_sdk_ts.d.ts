// merchi_sdk_ts ships without type declarations; declare the minimal surface
// this package uses (the Merchi client and its Job entity).
declare module 'merchi_sdk_ts' {
  export interface MerchiJob {
    fromJson(
      json: Record<string, unknown>,
      options?: { makeDirty?: boolean; arrayValueStrict?: boolean },
    ): MerchiJob;
    getQuote(): Promise<MerchiJob>;
    toJson(): Record<string, unknown>;
  }

  export class Merchi {
    constructor(
      sessionToken?: string,
      clientToken?: string,
      invoiceToken?: string,
      cartToken?: string,
      backendUri?: string,
    );
    Job: new () => MerchiJob;
  }
}
