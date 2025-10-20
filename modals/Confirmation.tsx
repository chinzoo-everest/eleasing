import React, { useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  BackHandler,
  Platform,
  Dimensions,
} from "react-native";
import Modal from "react-native-modal";
import Svg, { Defs, Mask, Rect, Ellipse } from "react-native-svg";

type Props = {
  title: string;
  description: string;
  isVisible: boolean;
  onClose: () => void;
  isConfirmation?: boolean;
  buttonOnPress?: () => void;
  callBack?: () => void;
  envelopeSource?: any;
};

const Confirmation: React.FC<Props> = ({
  title,
  description,
  isVisible,
  onClose,
  isConfirmation = false,
  buttonOnPress,
  callBack,
  envelopeSource = require("@assets/images/envelope.png"),
}) => {
  useEffect(() => {
    const backAction = () => {
      if (isVisible) {
        onClose();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => sub.remove();
  }, [isVisible, onClose]);

  const run = (fn?: () => void) => typeof fn === "function" && fn();

  const H_MARGIN = 24;
  const { width: screenW } = Dimensions.get("window");
  const CARD_W = screenW - H_MARGIN * 2;
  const CARD_RADIUS = 28;
  const NOTCH_W = 112;
  const NOTCH_H = 70;
  const NOTCH_OVERLAP = 32;
  const CARD_BG = "#FFFFFF";

  const SVG_H = 160;

  return (
    <View className="absolute h-full w-full">
      <Modal
        isVisible={isVisible}
        onBackdropPress={onClose}
        onSwipeComplete={onClose}
        swipeDirection="down"
        backdropColor="rgba(0,0,0,0.7)"
        useNativeDriver
        useNativeDriverForBackdrop
        style={{ justifyContent: "center", margin: 0 }}
      >
        <View className="px-6">
          <View
            className="relative w-full rounded-[28px] px-0 pb-9 pt-16"
            style={{
              backgroundColor: CARD_BG,
              shadowColor: "#000",
              shadowOpacity: 0.12,
              shadowOffset: { width: 0, height: 10 },
              shadowRadius: 18,
              elevation: 12,
              borderRadius: CARD_RADIUS,
              overflow: "visible",
            }}
          >
            <View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                height: SVG_H,
              }}
              pointerEvents="none"
            >
              <Svg width={CARD_W} height={SVG_H}>
                <Defs>
                  <Mask id="cutMask">
                    <Rect
                      x={0}
                      y={0}
                      width={CARD_W}
                      height={SVG_H}
                      rx={CARD_RADIUS}
                      ry={CARD_RADIUS}
                      fill="#ffffff"
                    />

                    <Ellipse
                      cx={CARD_W / 2}
                      cy={NOTCH_OVERLAP}
                      rx={NOTCH_W / 2}
                      ry={NOTCH_H / 2}
                      fill="#000000"
                    />
                  </Mask>
                </Defs>

                <Rect
                  x={0}
                  y={0}
                  width={CARD_W}
                  height={SVG_H}
                  rx={CARD_RADIUS}
                  ry={CARD_RADIUS}
                  fill={CARD_BG}
                  mask="url(#cutMask)"
                />
              </Svg>
            </View>

            <View
              style={{
                top: NOTCH_OVERLAP - NOTCH_H / 2 - 50,
                left: CARD_W / 2 - NOTCH_W / 2,
                width: NOTCH_W,
                height: NOTCH_W,
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
              }}
            >
              <View
                style={{
                  position: "absolute",
                  width: NOTCH_W,
                  height: NOTCH_W,
                  borderRadius: NOTCH_W / 2,
                  backgroundColor: "#D7DDE6",
                  shadowColor: "#000",
                  shadowOpacity: 0.18,
                  shadowOffset: { width: 0, height: 8 },
                  shadowRadius: 12,
                  elevation: 10,
                }}
              />

              <View
                style={{
                  width: NOTCH_W,
                  height: NOTCH_W,
                  borderRadius: NOTCH_W / 2,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 5,
                  borderColor: "#FFFFFF",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOpacity: 0.1,
                  shadowOffset: { width: 0, height: 4 },
                  shadowRadius: 10,
                  elevation: 8,
                }}
              >
                <Image
                  source={envelopeSource}
                  resizeMode="contain"
                  style={{ width: 46, height: 46 }}
                />
              </View>
            </View>

            <Text className="mt-2 text-center text-xl font-extrabold uppercase text-[#0B1B3B]">
              {title}
            </Text>
            <Text className="mt-3 px-5 text-center text-base text-[#22324D]">
              {description}
            </Text>

            {isConfirmation ? (
              <View className="mt-7 w-full flex-row px-6">
                <TouchableOpacity
                  onPress={onClose}
                  activeOpacity={0.85}
                  className="flex-1 items-center justify-center rounded-2xl py-4"
                  style={{
                    backgroundColor: "#EEF0F4",
                    ...(Platform.OS === "android"
                      ? { elevation: 2 }
                      : {
                          shadowColor: "#000",
                          shadowOpacity: 0.06,
                          shadowOffset: { width: 0, height: 2 },
                          shadowRadius: 6,
                        }),
                  }}
                >
                  <Text className="text-[#111827] font-medium">Үгүй</Text>
                </TouchableOpacity>
                <View className="w-3" />
                <TouchableOpacity
                  onPress={() => {
                    run(callBack);
                    run(buttonOnPress);
                  }}
                  activeOpacity={0.85}
                  className="flex-1 items-center justify-center rounded-2xl py-4"
                  style={{ backgroundColor: "#2A45C4" }}
                >
                  <Text className="text-white font-semibold">Тийм</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.9}
                className="mt-8 self-center"
              >
                <View
                  style={{
                    width: 118,
                    height: 96,
                    borderRadius: 20,
                    backgroundColor: "#EEF1F6",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: "#E6E9F2",
                    shadowColor: "#0B1320",
                    shadowOpacity: 0.15,
                    shadowOffset: { width: 4, height: 6 },
                    shadowRadius: 10,
                    elevation: 6,
                  }}
                >
                  {Platform.OS === "ios" && (
                    <View
                      pointerEvents="none"
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: 20,
                        shadowColor: "#FFFFFF",
                        shadowOpacity: 1,
                        shadowOffset: { width: -3, height: -3 },
                        shadowRadius: 8,
                      }}
                    />
                  )}
                  <Text className="text-2xl text-[#0B1B3B]">✕</Text>
                  <Text className="mt-1 text-base font-medium text-[#0B1B3B]">
                    Хаах
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Confirmation;
