import { z } from "zod";

/** 브릿지 프로토콜 버전(양방향 공통). */
export const BRIDGE_VERSION = 1 as const;

/** 언제: 모든 메시지 공통 / 방향: Web <-> Native / 기대 응답: 파싱 기준점(v=1). */
export const MessageVersionSchema = z.literal(BRIDGE_VERSION);
/** 언제: 모든 메시지 공통 / 방향: Web <-> Native / 기대 응답: type별 라우팅. */
export const MessageTypeSchema = z.string();
/** 언제: 요청-응답 추적 필요 시 / 방향: Web <-> Native / 기대 응답: 동일 id로 상관관계 매칭. */
export const MessageIdSchema = z.string();
/** 언제: type별 추가 데이터 전달 시 / 방향: Web <-> Native / 기대 응답: type별 payload 스키마로 재검증. */
export const MessagePayloadSchema = z.unknown();

/** 언제: 모든 메시지 기본 형태 / 방향: Web <-> Native / 기대 응답: type 기반 분기 처리. */
export const BridgeMessageCommonSchema = z.object({
  v: MessageVersionSchema,
  type: MessageTypeSchema,
  id: MessageIdSchema.optional(),
  payload: MessagePayloadSchema.optional(),
});

/** 언제: 인증 동기화 시 / 방향: Native -> Web(SET_AUTH) 또는 bootstrap / 기대 응답: 세션 반영. */
export const AuthPayloadSchema = z.object({
  /** 언제: 인증 확립 시 / 방향: Native -> Web / 기대 응답: 인증된 API 요청 가능. */
  token: z.string().min(1),
  /** 언제: 사용자 식별 필요 시 / 방향: Native -> Web / 기대 응답: 사용자 컨텍스트 확정. */
  userId: z.string().min(1),
});

/** 언제: 테마 동기화 시 / 방향: Native -> Web(SET_THEME) 또는 bootstrap / 기대 응답: UI 테마 적용. */
export const ThemePayloadSchema = z.object({
  /** 언제: 테마 변경 시 / 방향: Native -> Web / 기대 응답: light/dark/system 반영. */
  theme: z.enum(["light", "dark", "system"]),
});

/** 언제: 폰트 배율 동기화 시 / 방향: Native -> Web / 기대 응답: 텍스트 스케일 반영. */
export const FontScalePayloadSchema = z.object({
  /** 언제: 접근성 설정 변경 시 / 방향: Native -> Web / 기대 응답: 가독성 조정. */
  fontScale: z.number(),
});

/** 언제: 웹 라우팅 지시 시 / 방향: Native -> Web / 기대 응답: 지정 경로로 이동. */
export const NavigatePayloadSchema = z.object({
  /** 언제: 특정 화면 이동 필요 시 / 방향: Native -> Web / 기대 응답: 라우터 navigate 수행. */
  path: z.string().min(1),
});

/** 언제: 연결 헬스체크 시 / 방향: Web <-> Native / 기대 응답: PONG으로 왕복 확인. */
export const PingPayloadSchema = z.object({
  /** 언제: ping 전송 시점 기록 / 방향: Web <-> Native / 기대 응답: 지연 시간 계산 가능. */
  ts: z.number(),
});

/** 언제: ping 응답 시 / 방향: Web <-> Native / 기대 응답: ping 루프 종료. */
export const PongPayloadSchema = z.object({
  /** 언제: pong 응답 시점 기록 / 방향: Web <-> Native / 기대 응답: 헬스체크 완료 확인. */
  ts: z.number(),
});

/** 언제: 네이티브 화면 전환 요청 시 / 방향: Web -> Native / 기대 응답: 네이티브 내비게이션 수행. */
export const OpenNativeScreenPayloadSchema = z.object({
  /** 언제: 대상 화면 지정 시 / 방향: Web -> Native / 기대 응답: screen 라우팅 수행. */
  screen: z.string().min(1),
  /** 언제: 화면 진입 파라미터 필요 시 / 방향: Web -> Native / 기대 응답: 화면 초기 상태 구성. */
  params: z.record(z.string(), z.unknown()).optional(),
});

/** 언제: 외부 링크 열기 요청 시 / 방향: Web -> Native / 기대 응답: 시스템 브라우저/딥링크 실행. */
export const OpenExternalPayloadSchema = z.object({
  /** 언제: 외부 이동 URL 전달 시 / 방향: Web -> Native / 기대 응답: 링크 오픈 처리. */
  url: z.string().url(),
});

/** 언제: 햅틱 피드백 요청 시 / 방향: Web -> Native / 기대 응답: 단말 진동 패턴 실행. */
export const HapticPayloadSchema = z.object({
  /** 언제: 피드백 강도/종류 선택 시 / 방향: Web -> Native / 기대 응답: 대응 햅틱 실행. */
  style: z.enum(["light", "medium", "heavy", "success", "warning", "error"]),
});

/** 언제: 웹 로그 전달 시 / 방향: Web -> Native / 기대 응답: 네이티브 로거 기록. */
export const LogPayloadSchema = z.object({
  /** 언제: 로그 심각도 지정 시 / 방향: Web -> Native / 기대 응답: 레벨 기반 필터링. */
  level: z.enum(["debug", "info", "warn", "error"]),
  /** 언제: 로그 메시지 전달 시 / 방향: Web -> Native / 기대 응답: 사람이 읽을 수 있는 로그 보존. */
  message: z.string().min(1),
  /** 언제: 추가 디버그 정보 필요 시 / 방향: Web -> Native / 기대 응답: 후속 분석 보조. */
  context: z.unknown().optional(),
});

/** 언제: 웹 초기화 완료(READY) 시 / 방향: Web -> Native / 기대 응답: 초기 상태 동기화 완료 처리. */
export const BootstrapPayloadSchema = z.object({
  /** 언제: 앱 시작 bootstrap 시 / 방향: Web -> Native / 기대 응답: 인증 상태 복원. */
  auth: AuthPayloadSchema.nullable(),
  /** 언제: 초기 렌더 전 상태 주입 시 / 방향: Web -> Native / 기대 응답: 테마 일치 렌더링. */
  theme: z.enum(["light", "dark", "system"]),
  /** 언제: 접근성 설정 초기 주입 시 / 방향: Web -> Native / 기대 응답: 텍스트 배율 맞춤. */
  fontScale: z.number(),
  /** 언제: 진단/호환성 확인 시 / 방향: Web -> Native / 기대 응답: 앱 버전 기준 분기 가능. */
  appVersion: z.string().min(1),
  /** 언제: 플랫폼별 처리 필요 시 / 방향: Web -> Native / 기대 응답: ios/android 분기 수행. */
  platform: z.enum(["ios", "android"]),
});

/** 언제: Native -> Web 메시지 검증 시 / 방향: Native -> Web / 기대 응답: type별 안전 파싱. */
export const NativeToWebMessageSchema = z.discriminatedUnion("type", [
  z.object({ v: MessageVersionSchema, type: z.literal("SET_AUTH"), id: MessageIdSchema.optional(), payload: AuthPayloadSchema }),
  z.object({ v: MessageVersionSchema, type: z.literal("CLEAR_AUTH"), id: MessageIdSchema.optional() }),
  z.object({ v: MessageVersionSchema, type: z.literal("SET_THEME"), id: MessageIdSchema.optional(), payload: ThemePayloadSchema }),
  z.object({ v: MessageVersionSchema, type: z.literal("SET_FONT_SCALE"), id: MessageIdSchema.optional(), payload: FontScalePayloadSchema }),
  z.object({ v: MessageVersionSchema, type: z.literal("NAVIGATE"), id: MessageIdSchema.optional(), payload: NavigatePayloadSchema }),
  z.object({ v: MessageVersionSchema, type: z.literal("PING"), id: MessageIdSchema.optional(), payload: PingPayloadSchema }),
  z.object({ v: MessageVersionSchema, type: z.literal("PONG"), id: MessageIdSchema.optional(), payload: PongPayloadSchema }),
]);

/** 언제: Web -> Native 메시지 검증 시 / 방향: Web -> Native / 기대 응답: type별 안전 파싱. */
export const WebToNativeMessageSchema = z.discriminatedUnion("type", [
  z.object({ v: MessageVersionSchema, type: z.literal("READY"), id: MessageIdSchema.optional(), payload: BootstrapPayloadSchema }),
  z.object({ v: MessageVersionSchema, type: z.literal("REQUEST_LOGOUT"), id: MessageIdSchema.optional() }),
  z.object({ v: MessageVersionSchema, type: z.literal("OPEN_NATIVE_SCREEN"), id: MessageIdSchema.optional(), payload: OpenNativeScreenPayloadSchema }),
  z.object({ v: MessageVersionSchema, type: z.literal("OPEN_EXTERNAL"), id: MessageIdSchema.optional(), payload: OpenExternalPayloadSchema }),
  z.object({ v: MessageVersionSchema, type: z.literal("HAPTIC"), id: MessageIdSchema.optional(), payload: HapticPayloadSchema }),
  z.object({ v: MessageVersionSchema, type: z.literal("LOG"), id: MessageIdSchema.optional(), payload: LogPayloadSchema }),
  z.object({ v: MessageVersionSchema, type: z.literal("PING"), id: MessageIdSchema.optional(), payload: PingPayloadSchema }),
  z.object({ v: MessageVersionSchema, type: z.literal("PONG"), id: MessageIdSchema.optional(), payload: PongPayloadSchema }),
]);

export type BridgeMessageCommon = z.infer<typeof BridgeMessageCommonSchema>;
export type AuthPayload = z.infer<typeof AuthPayloadSchema>;
export type ThemePayload = z.infer<typeof ThemePayloadSchema>;
export type FontScalePayload = z.infer<typeof FontScalePayloadSchema>;
export type NavigatePayload = z.infer<typeof NavigatePayloadSchema>;
export type PingPayload = z.infer<typeof PingPayloadSchema>;
export type PongPayload = z.infer<typeof PongPayloadSchema>;
export type OpenNativeScreenPayload = z.infer<typeof OpenNativeScreenPayloadSchema>;
export type OpenExternalPayload = z.infer<typeof OpenExternalPayloadSchema>;
export type HapticPayload = z.infer<typeof HapticPayloadSchema>;
export type LogPayload = z.infer<typeof LogPayloadSchema>;
export type BootstrapPayload = z.infer<typeof BootstrapPayloadSchema>;
export type NativeToWebMessage = z.infer<typeof NativeToWebMessageSchema>;
export type WebToNativeMessage = z.infer<typeof WebToNativeMessageSchema>;
