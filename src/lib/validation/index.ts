import * as z from "zod";

export const SignupValidation = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50),
  username: z.string().min(2, { message: "Username must be at least 2 characters."}).max(50),
  email: z.string().email(),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export const SigninValidation = z.object({
  email: z.string().email(),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export const PostValidation = z.object({
  caption: z.string().min(5, { message: "Caption must be at least 5 characters." }).max(2200),
  tags: z.string(),
  location: z.string().min(2, { message: "Location must be at least 2 characters." }).max(100),
  file: z.custom<File[]>(),
});

export const UpdateProfileValidation = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50),
  username: z.string().min(2, { message: "Username must be at least 2 characters."}).max(50),
  email: z.string().email(),
  bio: z.string().max(1000),
  file: z.custom<File[]>(),
});
