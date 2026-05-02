import type { Metadata } from "next";

export const siteMetadata: Metadata = {
  applicationName: "BookLog",
  title: {
    default: "BookLog",
    template: "%s | BookLog",
  },
  description: "읽고 있는 책과 읽은 책을 기록하고 관리하는 BookLog 서비스",
  keywords: ["BookLog", "독서 기록", "책 관리", "독서 노트"],
};
