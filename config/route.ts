/* eslint-disable no-unused-vars */
export enum SCREENS {
  // auth
  LOGIN = "auth/login",
  REGISTER = "auth/register",
  RENEW_ACCOUNT = "auth/renewAccount",
  RESET_PASS = "auth/resetPass",
  VERIFY_DEVICE = "auth/verifyDevice",
  VERIFY_OTP = "auth/verifyotp",
  ONBOARDING = "/",

  // settings
  CONTACT = "settings/contact",
  SETTINGS_BONUS = "settings/settingsBonus",
  MODIFY_CONTACT = "settings/modifyContact",
  BANK = "settings/bankAccounts",
  MODIFY_BANK = "settings/modifyBank",
  CHANGE_EMAIL = "settings/changeEmail",
  CHANGE_PHONE = "settings/changePhone",
  CHANGE_PASS = "settings/changePass",
  CHANGE_PIN = "settings/changePin",
  MY_INFO = "settings/myInfo",
  LOGIN_SETTINGS = "settings/loginSettings",
  PERSONAL = "settings/personal",
  FAQ = "settings/faq",
  MAP = "settings/map",
  NOTIFICATION = "settings/notification",
  NOTIFICATION_DETAIL = "settings/notificationDetail",
  TERMS = "settings/terms",
  INVITE_FRIEND = "settings/invite",
  LOAN_ARCHIVE = "settings/archive",
  LOAN_CALCULATOR = "settings/calculator",
  GET_LOAN_MULTIPLE_FORMS = "settings/getloanMultipleForms",

  // contract
  CONTRACT = "contract/contract",
  CONTRACT_MAIN = "contract/contractMainShow",

  // loan
  DEPOSIT = "loan/deposit",
  GET_LOAN = "loan/getLoan",
  GET_LOAN_DETAIL = "loan/getLoanDetail",
  LOAN_DETAIL = "loan/detail",
  LOAN_EXTEND = "loan/loanExtend",
  LOAN_GRAPHIC = "loan/graphic",
  LOAN_SCHEDULE = "loan/schedule",
  LOAN_STATISTIC = "loan/statistics",
  PAYMENT = "loan/payment",
  PIN = "loan/pin",
  QPAY = "loan/qpayRequest",
  RENEW_PAYMENT = "loan/renewpayment",
  TRANSACTION = "loan/transaction",
  UPDATE_LOAN_LIMIT = "loan/updateLoanLimit",
  AMOUNT = "loan/amount",
  REQUEST_LIST = "loan/requestList",
  BANK_STATEMENT = "loan/bankStatement",
  AMT_REQUEST_TYPE = "loan/amtRequestType",
  ADD_CO_CUSTOMER_LOAN = "loan/addCoCustomerLoan",
  // car loan
  CAR_ONBOARD = "carLoan/onBoard",
  CAR_TERMS = "carLoan/terms",
  CAR_CAROUSEL = "carLoan/carousel",
  CAR_DETAIL = "carLoan/detail",
  CAR_UPLOAD = "carLoan/upload",

  // deposit loan
  DEPOSIT_ONBOARD = "depositLoan/onBoard",
  DEPOSIT_TERMS = "depositLoan/terms",
  DEPOSIT_REGISTER = "depositLoan/register",
  DEPOSIT_TYPE = "depositLoan/type",
  DEPOSIT_FORM = "depositLoan/form",
  DEPOSIT_UPLOAD = "depositLoan/upload",
  DEPOSIT_HOUSE_ONBOARD = "depositLoan/houseOnboard",
  DEPOSIT_HOUSE_TERMS = "depositLoan/houseTerms",

  // phone loan
  PHONE_ONBOARD = "phoneLoan/onBoard",
  PHONE_TERMS = "phoneLoan/terms",
  PHONE_INPUT = "phoneLoan/phoneInput",

  // liveness
  LIVENESS = "liveness",
  LIVENESS_RESULT = "liveness/result",
  LIVENESS_PERMISSION_DENIAL = "liveness/permission-denial",

  // tab
  BONUS = "(tabs)/bonus",
  HOME = "(tabs)",
  SETTINGS = "(tabs)/settings",
}
