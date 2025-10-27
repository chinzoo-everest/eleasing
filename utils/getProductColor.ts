import { Config } from "@customConfig/config";

export const getProductColorByType = (prodType: number) => {
  if (prodType === Config.CAR_PROD_TYPE) {
    return "#00C7EB";
  } else if (prodType === Config.DEPOSIT_PROD_TYPE) {
    return "#FFDA7E";
  } else if (prodType === Config.PHONE_PROD_TYPE) {
    return "#FF594F";
  } else {
    return "#2A45C4";
  }
};

export const getProductTextColorByType = (prodType: number) => {
  if (prodType === Config.DEPOSIT_PROD_TYPE) {
    return "#000";
  } else {
    return "#fff";
  }
};
