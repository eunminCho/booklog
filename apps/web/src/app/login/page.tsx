import { AuthForm } from "@/src/components/auth/auth-form";
import { Container, Page, Stack } from "@/components/ui/layout";
import { Heading, Text } from "@/components/ui/text";

export default function LoginPage() {
  return (
    <Page style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <Container style={{ maxWidth: 360 }}>
        <Stack gap={8}>
          <Heading level={1}>로그인</Heading>
          <Text size="sm" tone="secondary">이메일과 비밀번호로 로그인해 주세요.</Text>
        </Stack>
      </Container>
      <AuthForm mode="login" />
    </Page>
  );
}
