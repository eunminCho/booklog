import { CameraView, type BarcodeScanningResult, useCameraPermissions } from "expo-camera";
import { getColorTokens } from "@booklog/design-tokens";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useDisplay } from "../../hooks/useDisplay";
import type { MainTabParamList } from "../../navigation/MainTabs";


function isValidIsbn13(value: string): boolean {
  if (!/^\d{13}$/.test(value)) {
    return false;
  }

  if (!value.startsWith("978") && !value.startsWith("979")) {
    return false;
  }

  const digits = value.split("").map((digit) => Number.parseInt(digit, 10));
  const checksum = digits
    .slice(0, 12)
    .reduce((sum, digit, index) => sum + digit * (index % 2 === 0 ? 1 : 3), 0);
  const expectedCheckDigit = (10 - (checksum % 10)) % 10;

  return digits[12] === expectedCheckDigit;
}

export function ScanScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList, "Scan">>();
  const { resolvedTheme } = useDisplay();
  const colors = getColorTokens(resolvedTheme);
  const [permission, requestPermission] = useCameraPermissions();
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasCompletedRef = useRef(false);


  const handleBarcodeScanned = useCallback((result: BarcodeScanningResult) => {
    if (hasCompletedRef.current) {
      return;
    }

    const data = result.data.trim();
    if (!isValidIsbn13(data)) {
      setErrorMessage("ISBN 바코드를 찾지 못했어요. 책 바코드를 다시 비춰 주세요.");
      return;
    }

    hasCompletedRef.current = true;
    setErrorMessage(null);
    navigation.navigate("Library", {
      searchQuery: data,
      searchRequestId: `${Date.now()}-${data}`,
    });
  }, [navigation]);

  if (!permission) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.surface.canvas }]}>
        <Text style={[{ color: colors.text.secondary }]}>카메라 권한 상태를 확인하는 중입니다.</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.surface.canvas }]}>
        <Text style={[styles.title, { color: colors.text.primary }]}>카메라 권한이 필요합니다</Text>
        <Text style={[{ color: colors.text.secondary }]}>바코드 스캔을 위해 카메라 접근을 허용해 주세요.</Text>
        <Pressable style={[styles.primaryButton, { backgroundColor: colors.surface.subtle }]} onPress={() => void requestPermission()}>
          <Text style={[styles.primaryButtonText, { color: colors.text.inverse }]}>권한 요청</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface.inverse }]}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={handleBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["ean13"] }}
        enableTorch={flashEnabled}
      />
      <View style={[styles.overlay, { backgroundColor: colors.overlay.scrim }]}>
        <Text style={[styles.title, { color: colors.text.inverse }]}>책 바코드를 스캔해 주세요</Text>
        <Text style={[{ color: colors.text.secondary }]}>EAN-13(ISBN)만 인식됩니다.</Text>
        {errorMessage ? <Text style={[styles.error, { color: colors.feedback.error }]}>{errorMessage}</Text> : null}

        <View style={styles.actions}>
          <Pressable
            style={[
              styles.secondaryButton,
              { borderColor: colors.border.strong },
              flashEnabled && {
                borderColor: colors.feedback.warning,
                backgroundColor: colors.feedback.warningSubtle,
              },
            ]}
            onPress={() => setFlashEnabled((prev) => !prev)}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text.inverse }]}>
              {flashEnabled ? "플래시 끄기" : "플래시 켜기"}
            </Text>
          </Pressable>

            <Pressable
              style={[styles.primaryButton, { backgroundColor: colors.surface.subtle }]}
              onPress={() => {
                hasCompletedRef.current = true;
                navigation.navigate("Library", {
                  openSearch: true,
                  searchRequestId: `${Date.now()}-manual`,
                });
              }}
            >
              <Text style={[styles.primaryButtonText, { color: colors.text.primary }]}>수동 입력</Text>
            </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  error: {
    fontSize: 13,
  },
  actions: {
    marginTop: 4,
    flexDirection: "row",
    gap: 10,
  },
  primaryButton: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryButtonText: {
    fontWeight: "600",
  },
  secondaryButton: {
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "transparent",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    fontWeight: "600",
  },
});
