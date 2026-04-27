import { Button, Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../../state/AuthContext";
import { type DisplayTheme, useDisplay } from "../../state/DisplayContext";

const THEME_OPTIONS: Array<{ value: DisplayTheme; label: string }> = [
  { value: "system", label: "시스템 따르기" },
  { value: "light", label: "라이트" },
  { value: "dark", label: "다크" },
];

export function SettingsScreen() {
  const { signOut, isSubmitting } = useAuth();
  const { theme, resolvedTheme, fontScale, source, setTheme, setFontScaleOverride, resetToSystem } =
    useDisplay();
  const isDark = resolvedTheme === "dark";
  const colors = isDark
    ? {
        background: "#030712",
        text: "#f9fafb",
        subText: "#d1d5db",
        selectedRow: "#111827",
        border: "#6b7280",
        accent: "#e5e7eb",
        badgeBg: "#1f2937",
      }
    : {
        background: "#ffffff",
        text: "#111827",
        subText: "#374151",
        selectedRow: "#f3f4f6",
        border: "#6b7280",
        accent: "#111827",
        badgeBg: "#e5e7eb",
      };

  const MIN_FONT_SCALE = 0.85;
  const MAX_FONT_SCALE = 1.5;
  const STEP = 0.05;
  const canDecrease = fontScale > MIN_FONT_SCALE;
  const canIncrease = fontScale < MAX_FONT_SCALE;

  const stepTo = (direction: -1 | 1) => {
    const next = Math.min(
      MAX_FONT_SCALE,
      Math.max(MIN_FONT_SCALE, Number((fontScale + direction * STEP).toFixed(2))),
    );
    void setFontScaleOverride(next);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>표시 설정</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>테마</Text>
        {THEME_OPTIONS.map((option) => {
          const selected = option.value === theme;
          return (
            <Pressable
              key={option.value}
              style={[styles.radioRow, selected && { backgroundColor: colors.selectedRow }]}
              onPress={() => {
                void setTheme(option.value);
              }}
            >
              <View
                style={[
                  styles.radioOuter,
                  { borderColor: colors.border },
                  selected && { borderColor: colors.accent },
                ]}
              >
                {selected ? <View style={[styles.radioInner, { backgroundColor: colors.accent }]} /> : null}
              </View>
              <Text style={[styles.radioLabel, { color: colors.text }]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.section}>
        <View style={styles.fontHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>폰트 스케일</Text>
          <Text
            style={[
              styles.badge,
              {
                color: colors.subText,
                backgroundColor: colors.badgeBg,
              },
            ]}
          >
            {source === "override" ? "수동 오버라이드" : "시스템"}
          </Text>
        </View>
        <View style={styles.scaleControlRow}>
          <Pressable
            style={[
              styles.stepButton,
              { borderColor: colors.border, backgroundColor: colors.selectedRow },
              !canDecrease && styles.stepButtonDisabled,
            ]}
            disabled={!canDecrease}
            onPress={() => stepTo(-1)}
          >
            <Text style={[styles.stepButtonText, { color: colors.text }]}>-</Text>
          </Pressable>
          <Text style={[styles.scaleLabel, { color: colors.subText }]}>{fontScale.toFixed(2)}x</Text>
          <Pressable
            style={[
              styles.stepButton,
              { borderColor: colors.border, backgroundColor: colors.selectedRow },
              !canIncrease && styles.stepButtonDisabled,
            ]}
            disabled={!canIncrease}
            onPress={() => stepTo(1)}
          >
            <Text style={[styles.stepButtonText, { color: colors.text }]}>+</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.actions}>
        <Button title="시스템 설정으로 초기화" onPress={() => void resetToSystem()} />
      </View>

      <Button title={isSubmitting ? "로그아웃 중..." : "로그아웃"} onPress={() => void signOut()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    padding: 20,
    paddingTop: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#6b7280",
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioLabel: {
    fontSize: 16,
  },
  fontHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    fontSize: 12,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  scaleControlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepButton: {
    width: 42,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stepButtonDisabled: {
    opacity: 0.35,
  },
  stepButtonText: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 22,
  },
  scaleLabel: {
    fontSize: 16,
    minWidth: 64,
    textAlign: "center",
  },
  actions: {
    marginTop: 4,
  },
});
