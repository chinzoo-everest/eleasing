import { AlphaBets } from "@constant/alphabets";
import AlphaBetList from "@modals/AlphabetList";
import { cn } from "@utils/cn";
import React, { useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

type RegInputProps = {
  label: string;
  placeholder?: string;
  prodType?: number;
  backgroundColor?: string;
  focusColor?: string;
  isReadOnly?: boolean;
  onChangeText?: (text: string) => void;
  errorString?: string;
};

const RegInput = ({
  label,
  placeholder,
  prodType,
  backgroundColor = "#FFFFFF",
  focusColor = "#000",
  onChangeText,
  isReadOnly,
  errorString,
}: RegInputProps) => {
  const isFocused = useSharedValue(0);
  const textInputRef = useRef<TextInput>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string>(
    AlphaBets[0].value
  );
  const [selectedLetter2, setSelectedLetter2] = useState<string>(
    AlphaBets[0].value
  );
  const [textInputValue, setTextInputValue] = useState<string>("");
  const [chosenLetter, setChosenLetter] = useState<string>("selectedLetter");

  // animate underline color
  const borderAnimatedStyle = useAnimatedStyle(() => ({
    borderBottomColor: withTiming(isFocused.value ? focusColor : "#CBD2E1", {
      duration: 150,
    }),
  }));

  const handleOpenModal = (mode: string) => {
    setChosenLetter(mode);
    setTimeout(() => setModalVisible(true), 50);
  };

  const handleLetterPress = (letter: string) => {
    setModalVisible(false);
    if (chosenLetter === "selectedLetter") setSelectedLetter(letter);
    else setSelectedLetter2(letter);
  };

  const updateValues = (value1: string, value2: string, value3: string) => {
    setSelectedLetter(value1);
    setSelectedLetter2(value2);
    setTextInputValue(value3);
    onChangeText?.(`${value1}${value2}${value3}`);
  };

  return (
    <View className="mb-6">
      {/* top label */}
      <Text className="mb-2 ml-1 text-sm font-medium text-[#3C4A63]">
        {label}
      </Text>

      <View className="flex-row items-center">
        {/* First letter */}
        <TouchableOpacity
          disabled={isReadOnly}
          className="h-[44px] w-[44px] items-center justify-center border-b border-b-[#CBD2E1]"
          onPress={() => handleOpenModal("selectedLetter")}
        >
          <Text className="text-[18px] text-[#3C4A63]">{selectedLetter}</Text>
        </TouchableOpacity>

        {/* Second letter */}
        <TouchableOpacity
          disabled={isReadOnly}
          className="ml-3 h-[44px] w-[44px] items-center justify-center border-b border-b-[#CBD2E1]"
          onPress={() => handleOpenModal("selectedLetter2")}
        >
          <Text className="text-[18px] text-[#3C4A63]">{selectedLetter2}</Text>
        </TouchableOpacity>

        {/* Inline registration input */}
        <TouchableOpacity
          activeOpacity={1}
          className="flex-1 ml-3"
          onPress={() => textInputRef.current?.focus()}
        >
          <Animated.View
            style={[
              borderAnimatedStyle,
              {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottomWidth: 1,
                height: 44,
              },
            ]}
          >
            {/* Static text label */}
            <Text className="text-sm text-[#768AA4] opacity-80">
              Регистрийн дугаар
            </Text>

            {/* Input number */}
            <TextInput
              ref={textInputRef}
              value={textInputValue}
              editable={!isReadOnly}
              onChangeText={(text) =>
                updateValues(selectedLetter, selectedLetter2, text)
              }
              onFocus={() => (isFocused.value = 1)}
              onBlur={() => (isFocused.value = 0)}
              placeholder={placeholder || ""}
              maxLength={8}
              keyboardType="numeric"
              className={cn(
                "text-right text-[18px] text-[#3C4A63] flex-1 ml-2"
              )}
              selectionColor={focusColor}
              placeholderTextColor="#A0AEC0"
              style={{
                textAlign: "right",
                paddingBottom: 4,
              }}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Error message */}
      {errorString ? (
        <Text className="mt-2 text-xs text-red-500 text-right">
          {errorString}
        </Text>
      ) : null}

      {/* Alphabet modal */}
      <AlphaBetList
        prodType={Number(prodType)}
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onLetterPress={handleLetterPress}
      />
    </View>
  );
};

export default RegInput;
