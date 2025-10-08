import { AlphaBets } from "@constant/alphabets";
import { cn } from "@utils/cn";
import React from "react";
import { FlatList, TouchableOpacity, View, Text } from "react-native";
import Modal from "react-native-modal";
import { getProductColorByType } from "utils/getProductColor";

type Props = {
  isVisible: boolean;
  prodType: number;
  onClose: () => void;
  onLetterPress: (letter: string) => void;
};

const AlphaBetList = ({
  isVisible,
  prodType,
  onClose,
  onLetterPress,
}: Props) => {
  return (
    <View className="absolute h-full w-full">
      <Modal
        isVisible={isVisible}
        propagateSwipe={true}
        backdropColor={getProductColorByType(Number(prodType))}
        onBackdropPress={onClose}
        onSwipeComplete={onClose}
        style={{ justifyContent: "flex-end", margin: 0 }}
      >
        <View className="rounded-3xl bg-white px-3 pb-10 py-6">
          <Text className="text-base ml-3 font-bold mb-6 text-[#1B3C69] opacity-80">
            Үсэг сонгох
          </Text>
          <FlatList
            data={AlphaBets}
            scrollEnabled={false}
            numColumns={7}
            renderItem={({ item }) => (
              <View className="flex-1 px-1">
                <TouchableOpacity
                  onPress={() => onLetterPress(item.value)}
                  className={cn(
                    "m-1 h-12 items-center justify-center rounded bg-gray-100"
                  )}
                  style={{
                    borderColor: getProductColorByType(Number(prodType)),
                  }}
                >
                  <Text className="text-xl  text-[#1B3C69]">{item.label}</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </Modal>
    </View>
  );
};

export default AlphaBetList;
