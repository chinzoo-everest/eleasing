import { CBannerModel } from "@type/interfaces/Customer";
import { cn } from "@utils/cn";
import React from "react";
import { Dimensions, Image, TouchableOpacity, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";

type Props = {
  data: CBannerModel[];
  className?: string;
};

export const BannerCarousel = ({ data, className, ...rest }: Props) => {
  const windowWidth = Dimensions.get("window").width;
  // Create an array of static images
  const staticImages = [
    require("@assets/images/banner1.jpg"),
    require("@assets/images/banner2.jpg"),
  ];

  return (
    <View className={cn("", className)} {...rest}>
      <Carousel
        loop={false}
        width={windowWidth}
        snapEnabled={false}
        height={windowWidth * 0.65}
        autoPlay={false}
        data={staticImages} // Use static images array
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 1,
          parallaxScrollingOffset: windowWidth * 0.3,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity className="mx-3" delayPressIn={50}>
            <Image
              source={item} // Use the static image directly
              className="rounded-3xl"
              style={{ width: windowWidth * 0.65, height: windowWidth * 0.65 }}
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};
