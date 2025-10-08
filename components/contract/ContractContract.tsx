import React, {
  forwardRef,
  useContext,
  useEffect,
  useState,
  useImperativeHandle,
} from 'react';
import {View} from 'react-native';
import {GlobalContext} from '@context/GlobalContext';
import {ENDPOINTS} from '@constant/urls';
import HtmlRenderer from '@components/HtmlRenderer';
import {
  DEFAULT_LOADING_CONTENT,
  getContractHtmlContent,
} from '@services/html.service';
import {Config} from '@customConfig/config';

const ContractContract = forwardRef((_, ref) => {
  const context = useContext(GlobalContext);
  const currentCustomer = context?.state.currentUser;
  const [htmlContent, setHtmlContent] = useState<string>(
    DEFAULT_LOADING_CONTENT,
  );

  useImperativeHandle(ref, () => ({
    validateAndSave: async () => {
      return true;
    },
  }));

  useEffect(() => {
    const fetchContract = async () => {
      if (!currentCustomer) return;

      const contractUrl = `${ENDPOINTS.REPORT_PAGE_URL}${Config.CONTRACT_CONTRACT_URL}`;
      const response = await getContractHtmlContent(
        contractUrl,
        String(currentCustomer.CUST_ID),
      );
      setHtmlContent(response.content);
    };

    fetchContract();
  }, [currentCustomer]);

  return (
    <View className="flex-1">
      <HtmlRenderer htmlContent={htmlContent} containerClassName="p-4" />
    </View>
  );
});

ContractContract.displayName = 'ContractContract';
export default ContractContract;
