// import { encode as b64encode } from "base-64";
// import { Config } from "@customConfig/config";
// import type { CCustomer } from "@type/interfaces/Customer";

// /**
//  * Mirrors the C# payload:
//  * {
//  *   COM_ID: Constants.COMPANY_ID,
//  *   API_BASE: Constants.BASE_URL_APP,
//  *   CUST_ID: CurrentCustomer.CUST_ID
//  * }
//  * Then base64(JSON) as the QR content.
//  */
// export const buildCustomerQr = (cust?: CCustomer): sng => {
//   if (!cust?.CUST_ID) return "";
//   const payload = {
//     COM_ID: Config.COMPANY_ID,
//     API_BASE: Config.BASE_URL,
//     CUST_ID: cust.CUST_ID,
//   };
//   return b64encode(JSON.stringify(payload));
// };
// dd