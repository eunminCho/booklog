import { LogoutButton } from "@/src/components/auth/logout-button";
import { Container, Page, Stack } from "@/components/ui/layout";
import { Heading, Text } from "@/components/ui/text";

export default function LogoutPage() {
  return (
    <Page style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <Container style={{ maxWidth: 360 }}>
        <Stack gap={8}>
          <Heading level={1}>로그아웃</Heading>
          <Text size="sm" tone="secondary">현재 세션을 종료합니다.</Text>
        </Stack>
      </Container>
      <LogoutButton />
    </Page>
  );
}
