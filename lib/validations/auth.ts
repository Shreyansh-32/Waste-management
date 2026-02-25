import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email({ message: "Enter a valid email." }),
  password: z.string().min(8, { message: "Use at least 8 characters." }),
});

export const signUpSchema = signInSchema
  .extend({
    name: z.string().min(2, { message: "Add your full name." }),
    confirmPassword: z.string().min(8, { message: "Confirm your password." }),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }
  });
