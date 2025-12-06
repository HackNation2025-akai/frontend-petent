import type { useForm } from "@tanstack/react-form";
import type { FormValues } from "./form";

export type FormInstance = ReturnType<typeof useForm<FormValues>>;

