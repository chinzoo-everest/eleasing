import {useState, useEffect, useCallback} from 'react';
import {fetchLoanRequestList} from '@services/depositLoan.service';
import {LoanRequest} from '@type/interfaces/DepositLoan';
import {CCustProd} from '@type/interfaces/Customer';
import {parseResponseData} from '@utils/parseResponseData';
import {handleErrorExpo} from '@utils/handleErrorOnExpo';

interface UseLoanRequestProps {
  prodType: number;
  product?: string;
}

interface LoanRequestHookResult {
  loanRequest?: LoanRequest;
  custProd?: CCustProd;
  isLoading: boolean;
}

export function useLoanRequest({
  prodType,
  product,
}: UseLoanRequestProps): LoanRequestHookResult {
  const [loanRequest, setLoanRequest] = useState<LoanRequest>();
  const [custProd, setCustProd] = useState<CCustProd>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchRequestList = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchLoanRequestList();
      if (result) {
        const loanRequest = result.filter(
          item => item.APP_PROD_TYPE === prodType && item.STATUS_ID === 1,
        );
        setLoanRequest(loanRequest[0]);
      }
      if (product) {
        setCustProd(parseResponseData<CCustProd>(product as string));
      }
    } catch (error) {
      handleErrorExpo(error, 'fetchRequestList');
    } finally {
      setIsLoading(false);
    }
  }, [prodType, product]);

  useEffect(() => {
    fetchRequestList();
  }, [fetchRequestList]);

  return {loanRequest, custProd, isLoading};
}
