import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { BaseToastProps } from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";

// Define custom toast components
const Toast = ({
  text1,
  text2,
  gradientColors,
  shadowColor,
  marginTop,
}: {
  text1?: string;
  text2?: string;
  gradientColors: [string, string];
  shadowColor: string;
  marginTop?: boolean;
}) => (
  <View style={styles.container}>
    <View
      style={[
        styles.toastContainer,
        marginTop && styles.marginTop,
        Platform.OS === "ios"
          ? {
              ...styles.shadowIOS,
              shadowColor,
            }
          : {
              ...styles.shadowAndroid,
              shadowColor,
            },
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={styles.gradient}
      >
        {text1 && <Text style={styles.titleText}>{text1}</Text>}
        {text2 && <Text style={styles.messageText}>{text2}</Text>}
      </LinearGradient>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  toastContainer: {
    alignSelf: "stretch",
  },
  marginTop: {
    marginTop: 10,
  },
  gradient: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 8,
    overflow: "hidden",
  },
  shadowIOS: {
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  shadowAndroid: {
    elevation: 18,
  },
  titleText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "black",
  },
  messageText: {
    fontSize: 14,
    color: "black",
    opacity: 0.8,
    marginTop: 5,
  },
});

const toastConfig = {
  success: (props: BaseToastProps) => (
    <Toast
      {...props}
      gradientColors={["#fff", "#fff"]}
      shadowColor="#fff"
      marginTop
    />
  ),
  error: (props: BaseToastProps) => (
    <Toast {...props} gradientColors={["#fff", "#fff"]} shadowColor="#fff" />
  ),
  info: (props: BaseToastProps) => (
    <Toast
      {...props}
      gradientColors={["#0F4250", "#0B0B13"]}
      shadowColor="#0F4250"
      marginTop
    />
  ),
};

export default toastConfig;
