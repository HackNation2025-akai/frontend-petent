import type { PropsWithChildren } from "react";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { ToastProvider } from "@/shared/ui/ToastProvider";

export default function AppProviders({ children }: PropsWithChildren) {
  return (
    <Theme>
      <ToastProvider>{children}</ToastProvider>
    </Theme>
  );
}

