export type AzureClaims = {
    exp: number;
    iat: number;
    nbf: number;
    sub: string;
      given_name: string;
      unique_name: string; // email
      oid: string;
  }