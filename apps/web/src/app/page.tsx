import { redirect } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { Container, Inline, Page, Stack, Surface } from "@/components/ui/layout";
import { Heading, Text } from "@/components/ui/text";
import { getCurrentUser } from "@/src/lib/auth/current-user";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/library");
  }

  return (
    <Page style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Container style={{ maxWidth: 560 }}>
        <Surface>
          <Stack gap={12}>
            <Heading level={1}>BookLog</Heading>
            <Text size="sm" tone="secondary">
              이메일/비밀번호 인증 흐름을 테스트할 수 있습니다.
            </Text>
            <Inline gap={12} wrap style={{ marginTop: 12 }}>
              <ButtonLink href="/signup">회원가입</ButtonLink>
              <ButtonLink href="/login" variant="outline">
                로그인
              </ButtonLink>
            </Inline>
          </Stack>
        </Surface>
      </Container>
    </Page>
  );
}
