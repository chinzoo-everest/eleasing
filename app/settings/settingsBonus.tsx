// import BonusCard from "@components/BonusCard";
// import Header from "@components/Header";
// import HomeHeader from "@components/HomeHeader";
// import { useGlobalContext } from "@hooks/useGlobalContext";
// import { useFocusEffect } from "@react-navigation/native";
// import { loadCustomerData } from "@services/home.service";
// import { CCustomer, CCustProd } from "@type/interfaces/Customer";
// import { handleErrorExpo } from "@utils/handleErrorOnExpo";
// import { router } from "expo-router";
// import React, { useCallback, useState } from "react";
// import {
//   ScrollView,
//   Text,
//   View,
//   RefreshControl,
//   SafeAreaView,
//   Platform,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// const Bonus = ({ navigation }: any) => {
//   const { dispatch } = useGlobalContext();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [custProd, setCustProd] = useState<CCustProd[]>([]);
//   const [currentCustomer, setCurrentCustomer] = useState<CCustomer>();
//   const insets = useSafeAreaInsets();

//   const loadData = useCallback(async () => {
//     try {
//       if (isSubmitting) return;
//       setIsSubmitting(true);
//       setCustProd([]);
//       const result = await loadCustomerData(dispatch);
//       if (result?.customer) {
//         setCurrentCustomer(result.customer);
//       }
//       if (result?.cust_prod) {
//         setCustProd(result.cust_prod.filter((item) => item.USE_BONUS === "Y"));
//       }
//     } catch (error) {
//       handleErrorExpo(error, "loadData");
//     } finally {
//       setIsSubmitting(false);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [dispatch]);

//   useFocusEffect(
//     useCallback(() => {
//       loadData();
//     }, [loadData])
//   );

//   return (
//     <View className="flex-1 bg-white " style={{ paddingTop: insets.top }}>
//       <View className={`mt-${Platform.OS === "android" ? "6" : "0"}`}>
//         <Header
//           title="Урамшуулал"
//           bgColor="white"
//           showBottomLine={false}
//           textColor="#1B3C69"
//           onBack={() => router.back()}
//         />
//       </View>

//       <ScrollView
//         className="mt-3 flex-1"
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={isSubmitting}
//             colors={["#34837B"]}
//             onRefresh={loadData}
//           />
//         }
//       >
//         <View className="flex-1">
//           <View className="mx-7 mt-4 flex-col">
//             <Text className="mb-3 text-base font-bold text-tDefault">
//               Таны цуглуулсан оноо
//             </Text>
//             <View className="-mx-3 rounded-lg bg-[#EFF3F2] px-4 py-2">
//               <Text className="text-4xl font-bold">
//                 {currentCustomer?.BONUS || 0}
//               </Text>
//             </View>
//             <Text className="mt-5 text-base font-bold">
//               Зээлийн бүтээгдэхүүн
//             </Text>
//           </View>

//           {custProd.length > 0 ? (
//             custProd.map((item) => (
//               <View key={item.ID} className="mx-4 mt-2.5">
//                 <BonusCard source={item} navigation={navigation} />
//               </View>
//             ))
//           ) : (
//             <View className="flex-1 items-center justify-center">
//               <Text className="mx-auto my-20 text-gray-500">
//                 Зээлийн бүтээгдэхүүн байхгүй байна.
//               </Text>
//             </View>
//           )}
//         </View>
//         <View className="h-40" />
//       </ScrollView>
//     </View>
//   );
// };

// export default Bonus;
