import { Button, Pressable, StyleSheet, Text, View } from "react-native";
import { getColorTokens } from "@booklog/design-tokens";

import { useAuth } from "../../hooks/useAuth";
import { useDisplay } from "../../hooks/useDisplay";
import { DisplayTheme } from "../../state/displayContext/constants";

const THEME_OPTIONS: Array<{ value: DisplayTheme; label: string }> = [
  { value: "system", label: "시스템 따르기" },
  { value: "light", label: "라이트" },
  { value: "dark", label: "다크" },
];

export function SettingsScreen() {
  const { signOut, isSubmitting } = useAuth();
  const { theme, resolvedTheme, fontScale, source, setTheme, setFontScaleOverride, resetToSystem } =
    useDisplay();
  const colors = getColorTokens(resolvedTheme);

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
    <View style={[styles.container, { backgroundColor: colors.surface.canvas }]}>
      <Text style={[styles.title, { color: colors.text.primary }]}>표시 설정</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>테마</Text>
        {THEME_OPTIONS.map((option) => {
          const selected = option.value === theme;
          return (
            <Pressable
              key={option.value}
              style={[styles.radioRow, selected && { backgroundColor: colors.surface.selected }]}
              onPress={() => {
                void setTheme(option.value);
              }}
            >
              <View
                style={[
                  styles.radioOuter,
                  { borderColor: colors.border.default },
                  selected && { borderColor: colors.brand.primary },
                ]}
              >
                {selected ? <View style={[styles.radioInner, { backgroundColor: colors.brand.primary }]} /> : null}
              </View>
              <Text style={[styles.radioLabel, { color: colors.text.primary }]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.section}>
        <View style={styles.fontHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>폰트 스케일</Text>
          <Text
            style={[
              styles.badge,
              {
                color: colors.text.secondary,
                backgroundColor: colors.surface.subtle,
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
              { borderColor: colors.border.default, backgroundColor: colors.surface.selected },
              !canDecrease && styles.stepButtonDisabled,
            ]}
            disabled={!canDecrease}
            onPress={() => stepTo(-1)}
          >
            <Text style={[styles.stepButtonText, { color: colors.text.primary }]}>-</Text>
          </Pressable>
          <Text style={[styles.scaleLabel, { color: colors.text.secondary }]}>{fontScale.toFixed(2)}x</Text>
          <Pressable
            style={[
              styles.stepButton,
              { borderColor: colors.border.default, backgroundColor: colors.surface.selected },
              !canIncrease && styles.stepButtonDisabled,
            ]}
            disabled={!canIncrease}
            onPress={() => stepTo(1)}
          >
            <Text style={[styles.stepButtonText, { color: colors.text.primary }]}>+</Text>
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
