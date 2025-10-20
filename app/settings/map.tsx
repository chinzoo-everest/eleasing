import React, { useCallback, useEffect, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import { TouchableOpacity, View, Image, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Header from "@components/Header";
import { router } from "expo-router";
import { CBranch } from "@type/interfaces/Basic";
import { getBranchList } from "@services/api/basic";
import { checkResponse } from "@utils/checkResponse";
import { showToast } from "@utils/showToast";
import { handleErrorExpo } from "@utils/handleErrorOnExpo";
import BranchCard from "@components/BranchCard";

export default function Map() {
  const insets = useSafeAreaInsets();
  const [branches, setBranches] = useState<CBranch[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [layout, setLayout] = useState<string>("map");
  const [region, setRegion] = useState({
    latitude: 47.9221,
    longitude: 106.9155,
    latitudeDelta: 0.003,
    longitudeDelta: 0.003,
  });
  const handleBranchPress = (branch: CBranch) => {
    setRegion({
      latitude: parseFloat(branch.LAT.toString()),
      longitude: parseFloat(branch.LON.toString()),
      latitudeDelta: 0.003,
      longitudeDelta: 0.003,
    });
    handleLayoutChange("map");
  };
  const loadBranches = useCallback(async () => {
    if (isSubmitting || branches.length > 0) return;
    setIsSubmitting(true);
    try {
      const response = await getBranchList();
      if (!(await checkResponse(response))) return;
      const jsonResponse = await JSON.parse(response.data);
      const newBranches: CBranch[] = jsonResponse.map(
        (branch: any, index: number) => ({
          ...branch,
          INDEX: index + 1,
        })
      );
      setBranches(newBranches);
      if (newBranches.length > 0) {
        setRegion({
          latitude: parseFloat(newBranches[0].LAT.toString()),
          longitude: parseFloat(newBranches[0].LON.toString()),
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        });
      } else {
        showToast("Анхааруулга", "Салбарын байршил олдсонгүй.", "error");
      }
    } catch (error) {
      handleErrorExpo(error, "loadBranches");
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, branches.length]);

  const handleLayoutChange = (chosenLayout: string) => {
    setLayout(chosenLayout);
  };

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <Header
        title="Салбарын байршил"
        onBack={() => router.back()}
        showBottomLine={false}
        textColor="#1B3C69"
        bgColor="#fff"
      />
      <View className="mx-4 mt-4 flex-row rounded-full bg-white">
        <TouchableOpacity
          className={`flex-1 items-center justify-center py-3 ${layout === "map" ? " rounded-full bg-[#2A45C4]" : ""}`}
          onPress={() => handleLayoutChange("map")}
        >
          <Text
            className={`font-Inter text-md  font-bold ${layout === "map" ? "text-white" : "text-[#1B3C69] opacity-50"}`}
          >
            Газрын зураг
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 items-center justify-center py-3 ${layout === "list" ? "rounded-full bg-[#2A45C4]" : ""}`}
          onPress={() => handleLayoutChange("list")}
        >
          <Text
            className={`font-Inter text-md font-bold ${layout === "list" ? "text-white" : "text-[#1B3C69] opacity-50"}`}
          >
            Жагсаалтаар
          </Text>
        </TouchableOpacity>
      </View>

      {layout === "map" ? (
        <MapView
          style={{ flex: 1, marginTop: 20 }}
          region={region}
          onRegionChangeComplete={setRegion}
        >
          {branches.map((branch) => (
            <Marker
              key={branch.INDEX}
              coordinate={{
                latitude: parseFloat(branch.LAT.toString()),
                longitude: parseFloat(branch.LON.toString()),
              }}
              title={branch.NAME}
              description={branch.ADDR}
            >
              <Image
                source={require("@assets/images/branch_pin.png")}
                style={{ width: 25, height: 25 }}
                resizeMode="contain"
              />
            </Marker>
          ))}
        </MapView>
      ) : (
        <ScrollView className="flex-1 px-4 pt-5">
          {branches.length > 0 ? (
            branches.map((branch) => (
              <BranchCard
                key={branch.INDEX}
                branch={branch}
                onPress={handleBranchPress}
              />
            ))
          ) : (
            <Text className="text-center text-gray-400">
              Салбарын мэдээлэл байхгүй байна.
            </Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}
