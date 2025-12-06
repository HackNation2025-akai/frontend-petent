import type { PropsWithChildren } from "react";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";

export default function AppProviders({ children }: PropsWithChildren) {
  return <Theme>{children}</Theme>;
}

