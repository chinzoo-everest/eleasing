import AsyncStorage from '@react-native-async-storage/async-storage';
import {LoanRequestData, LoanType} from '../types/LoanRequest';

const STORAGE_KEYS = {
  CAR_LOAN_PROGRESS: 'car_loan_request_progress',
  DEPOSIT_LOAN_PROGRESS: 'deposit_loan_request_progress',
} as const;

// Storage keys are customer-specific
const getStorageKey = (baseKey: string, custId: string): string => {
  return `${baseKey}_${custId}`;
};

// Get the appropriate storage key for loan type
const getBaseStorageKey = (loanType: LoanType): string => {
  return loanType === 'car'
    ? STORAGE_KEYS.CAR_LOAN_PROGRESS
    : STORAGE_KEYS.DEPOSIT_LOAN_PROGRESS;
};

/**
 * Save loan request progress
 */
export const saveLoanRequestProgress = async (
  loanType: LoanType,
  data: LoanRequestData,
  custId: string,
): Promise<void> => {
  try {
    const baseKey = getBaseStorageKey(loanType);
    const storageKey = getStorageKey(baseKey, custId);

    // Add timestamp and customer ID to data
    const dataWithMetadata = {
      ...data,
      custId,
      timestamp: Date.now(),
    };

    const jsonData = JSON.stringify(dataWithMetadata);
    await AsyncStorage.setItem(storageKey, jsonData);
  } catch (error) {
    console.error('Error saving loan request progress:', error);
    throw error;
  }
};

/**
 * Get saved loan request progress
 */
export const getLoanRequestProgress = async (
  loanType: LoanType,
  custId: string,
): Promise<LoanRequestData | null> => {
  try {
    const baseKey = getBaseStorageKey(loanType);
    const storageKey = getStorageKey(baseKey, custId);

    const jsonData = await AsyncStorage.getItem(storageKey);

    if (!jsonData) {
      return null;
    }

    const data: LoanRequestData = JSON.parse(jsonData);

    // Validate customer ID matches
    if (data.custId !== custId) {
      console.warn(
        `Customer ID mismatch. Expected: ${custId}, Found: ${data.custId}. Clearing data.`,
      );
      await clearLoanRequestProgress(loanType, custId);
      return null;
    }

    // Convert date strings back to Date objects for deposit loan
    if (loanType === 'deposit' && 'depositType' in data) {
      if (data.certDate && typeof data.certDate === 'string') {
        data.certDate = new Date(data.certDate);
      }
      if (data.useDate && typeof data.useDate === 'string') {
        data.useDate = new Date(data.useDate);
      }
    }
    return data;
  } catch (error) {
    console.error('Error getting loan request progress:', error);
    // If there's an error parsing, clear the corrupted data
    await clearLoanRequestProgress(loanType, custId);
    return null;
  }
};

/**
 * Clear loan request progress
 */
export const clearLoanRequestProgress = async (
  loanType: LoanType,
  custId: string,
): Promise<void> => {
  try {
    const baseKey = getBaseStorageKey(loanType);
    const storageKey = getStorageKey(baseKey, custId);

    await AsyncStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Error clearing loan request progress:', error);
    throw error;
  }
};

/**
 * Check if loan request exists
 */
export const hasLoanRequestProgress = async (
  loanType: LoanType,
  custId: string,
): Promise<boolean> => {
  try {
    const data = await getLoanRequestProgress(loanType, custId);
    return data !== null;
  } catch (error) {
    console.error('Error checking loan request progress:', error);
    return false;
  }
};

/**
 * Clear all loan request data (for account switch only)
 */
export const clearAllLoanRequestProgress = async (): Promise<void> => {
  try {
    // Get all AsyncStorage keys
    const allKeys = await AsyncStorage.getAllKeys();

    // Filter keys that match our loan request patterns
    const loanRequestKeys = allKeys.filter(
      key =>
        key.includes(STORAGE_KEYS.CAR_LOAN_PROGRESS) ||
        key.includes(STORAGE_KEYS.DEPOSIT_LOAN_PROGRESS),
    );

    // Remove all loan request data
    if (loanRequestKeys.length > 0) {
      await AsyncStorage.multiRemove(loanRequestKeys);
    }
  } catch (error) {
    console.error('Error clearing all loan request progress:', error);
    throw error;
  }
};

/**
 * Get all loan request progress for debugging
 */
export const getAllLoanRequestProgress = async (): Promise<{
  [key: string]: any;
}> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const loanRequestKeys = allKeys.filter(
      key =>
        key.includes(STORAGE_KEYS.CAR_LOAN_PROGRESS) ||
        key.includes(STORAGE_KEYS.DEPOSIT_LOAN_PROGRESS),
    );

    const results: {[key: string]: any} = {};

    for (const key of loanRequestKeys) {
      const data = await AsyncStorage.getItem(key);
      if (data) {
        try {
          results[key] = JSON.parse(data);
        } catch {
          results[key] = data; // Keep raw data if parsing fails
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Error getting all loan request progress:', error);
    return {};
  }
};
