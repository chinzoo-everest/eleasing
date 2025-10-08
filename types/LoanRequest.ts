import {CCarInfo} from '@type/interfaces/DepositLoan';

export interface SavedImage {
  id: string;
  name: string;
  uri: string;
  size: string;
  typeId?: number;
  uploadSuccess?: boolean;
}

export interface CarLoanRequestData {
  // Customer identification
  custId: string;

  // Car selection data
  formType: 'numberedCar' | 'newCar' | 'customsCar';
  plateNumber?: string;
  vinNumber?: string;
  carDetail?: CCarInfo;
  activeIndex?: number; // For carousel position

  // Car detail form data
  mileAge: number;
  edition: string;
  ownerPhone: string;
  carPrice: number;
  prePayment: number;

  // Request metadata
  prodId: string;
  prodType: string;
  productData?: string; // Full product object as JSON string for restart functionality
  requestId?: string;
  depositId?: string;
  loanAmount?: string;
  prePaymentAmount?: string;
  lastSavedStep: 'carousel' | 'detail' | 'upload';
  timestamp: number;

  // Uploaded images
  uploadedImages?: SavedImage[];
}

export interface DepositLoanRequestData {
  // Customer identification
  custId: string;

  // Deposit type selection
  depositType: 'house' | 'car';

  // House form data (if depositType === 'house')
  city?: string;
  district?: string;
  subDistrict?: string;
  buildingNo?: string;
  doorNo?: string;
  certificateNo?: string;
  square?: string;
  intent?: string;
  certDate?: Date;
  useDate?: Date;

  // Car form data (if depositType === 'car')
  formType?: 'numberedCar' | 'newCar' | 'customsCar';
  plateNumber?: string;
  vinNumber?: string;
  carDetail?: CCarInfo;
  mileAge?: number;
  edition?: string;
  ownerPhone?: string;
  carPrice?: number;
  prePayment?: number;
  activeIndex?: number; // For carousel position

  // Request metadata
  prodId: string;
  prodType: string;
  productData?: string; // Full product object as JSON string for restart functionality
  requestId?: string;
  depositId?: string;
  loanAmount?: string;
  lastSavedStep: 'type' | 'form' | 'upload';
  timestamp: number;

  // Uploaded images
  uploadedImages?: SavedImage[];
}

export type LoanRequestData = CarLoanRequestData | DepositLoanRequestData;

export type LoanType = 'car' | 'deposit';
