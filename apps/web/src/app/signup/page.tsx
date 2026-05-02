import { redirect } from "next/navigation";

import { AuthForm } from "@/src/components/auth/auth-form";
import { Container, Page, Stack } from "@/components/ui/layout";
import { Heading, Text } from "@/components/ui/text";
import { getCurrentUser } from "@/src/lib/auth/current-user";

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/library");
  }

  return (
    <Page style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <Container style={{ maxWidth: 360 }}>
        <Stack gap={8}>
          <Heading level={1}>회원가입</Heading>
          <Text size="sm" tone="secondary">새 계정을 만든 뒤 바로 사용을 시작하세요.</Text>
        </Stack>
      </Container>
      <AuthForm mode="signup" />
    </Page>
  );
}
