import { CameraView, type BarcodeScanningResult, useCameraPermissions } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
      <View style={styles.centered}>
        <Text style={styles.subtitle}>카메라 권한 상태를 확인하는 중입니다.</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>카메라 권한이 필요합니다</Text>
        <Text style={styles.subtitle}>바코드 스캔을 위해 카메라 접근을 허용해 주세요.</Text>
        <Pressable style={styles.primaryButton} onPress={() => void requestPermission()}>
          <Text style={styles.primaryButtonText}>권한 요청</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={handleBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["ean13"] }}
        enableTorch={flashEnabled}
      />
      <View style={styles.overlay}>
        <Text style={styles.title}>책 바코드를 스캔해 주세요</Text>
        <Text style={styles.subtitle}>EAN-13(ISBN)만 인식됩니다.</Text>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <View style={styles.actions}>
          <Pressable
            style={[styles.secondaryButton, flashEnabled && styles.secondaryButtonActive]}
            onPress={() => setFlashEnabled((prev) => !prev)}
          >
            <Text style={styles.secondaryButtonText}>{flashEnabled ? "플래시 끄기" : "플래시 켜기"}</Text>
          </Pressable>

            <Pressable
              style={styles.primaryButton}
              onPress={() => {
                hasCompletedRef.current = true;
                navigation.navigate("Library", {
                  openSearch: true,
                  searchRequestId: `${Date.now()}-manual`,
                });
              }}
            >
              <Text style={styles.primaryButtonText}>수동 입력</Text>
            </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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
    backgroundColor: "rgba(0, 0, 0, 0.55)",
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
    color: "#fff",
  },
  subtitle: {
    color: "#e5e7eb",
  },
  error: {
    color: "#fecaca",
    fontSize: 13,
  },
  actions: {
    marginTop: 4,
    flexDirection: "row",
    gap: 10,
  },
  primaryButton: {
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: "#111827",
    fontWeight: "600",
  },
  secondaryButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#9ca3af",
    backgroundColor: "transparent",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryButtonActive: {
    borderColor: "#fde68a",
    backgroundColor: "rgba(254, 240, 138, 0.25)",
  },
  secondaryButtonText: {
    color: "#f9fafb",
    fontWeight: "600",
  },
});
