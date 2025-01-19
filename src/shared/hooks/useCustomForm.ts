import {
  useForm,
  UseFormProps,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodEffects, ZodObject, ZodRawShape } from "zod";

interface UseCustomFormProps<T extends FieldValues> extends UseFormProps<T> {
  schema: ZodObject<ZodRawShape> | ZodEffects<ZodObject<ZodRawShape>>;
}

export function useCustomForm<T extends FieldValues>({
  schema,
  ...formProps
}: UseCustomFormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    ...formProps,
  });

  const errors = form.formState.errors;

  const onSubmit = (
    data: T,
    func: (data: T, form: UseFormReturn<T>) => void,
  ) => {
    return func(data, form);
  };

  return {
    form,
    errors,
    isDirty: form.formState.isDirty,
    isValid: form.formState.isValid,
    isSubmitting: form.formState.isSubmitting,
    handleSubmit: (func: (data: T, form: UseFormReturn<T>) => void) =>
      form.handleSubmit((data) => onSubmit(data, func)),
  };
}
