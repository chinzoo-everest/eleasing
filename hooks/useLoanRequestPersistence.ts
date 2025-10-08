import {GlobalContext} from '@context/GlobalContext';
import {handleErrorExpo} from '@utils/handleErrorOnExpo';
import {useCallback, useContext} from 'react';
import {
  clearLoanRequestProgress,
  getLoanRequestProgress,
  hasLoanRequestProgress,
  saveLoanRequestProgress,
} from '../services/loanRequestStorage.service';
import {LoanRequestData, LoanType} from '../types/LoanRequest';

export const useLoanRequestPersistence = (loanType: LoanType) => {
  const context = useContext(GlobalContext);
  const custId = context?.state.currentUser?.CUST_ID?.toString() || '';

  const saveProgress = useCallback(
    async (data: LoanRequestData): Promise<boolean> => {
      if (!custId) {
        console.warn('Cannot save loan progress: Customer ID not available');
        return false;
      }

      try {
        await saveLoanRequestProgress(loanType, data, custId);
        return true;
      } catch (error) {
        handleErrorExpo(
          error,
          `useLoanRequestPersistence.saveProgress.${loanType}`,
        );
        return false;
      }
    },
    [loanType, custId],
  );

  const loadProgress =
    useCallback(async (): Promise<LoanRequestData | null> => {
      if (!custId) {
        console.warn('Cannot load loan progress: Customer ID not available');
        return null;
      }

      try {
        const data = await getLoanRequestProgress(loanType, custId);
        return data;
      } catch (error) {
        handleErrorExpo(
          error,
          `useLoanRequestPersistence.loadProgress.${loanType}`,
        );
        return null;
      }
    }, [loanType, custId]);

  const clearProgress = useCallback(async (): Promise<boolean> => {
    if (!custId) {
      console.warn('Cannot clear loan progress: Customer ID not available');
      return false;
    }

    try {
      await clearLoanRequestProgress(loanType, custId);
      return true;
    } catch (error) {
      handleErrorExpo(
        error,
        `useLoanRequestPersistence.clearProgress.${loanType}`,
      );
      return false;
    }
  }, [loanType, custId]);

  const hasProgress = useCallback(async (): Promise<boolean> => {
    if (!custId) {
      return false;
    }

    try {
      const exists = await hasLoanRequestProgress(loanType, custId);
      return exists;
    } catch (error) {
      handleErrorExpo(
        error,
        `useLoanRequestPersistence.hasProgress.${loanType}`,
      );
      return false;
    }
  }, [loanType, custId]);

  return {
    saveProgress,
    loadProgress,
    clearProgress,
    hasProgress,
    custId,
    isReady: !!custId,
  };
};
