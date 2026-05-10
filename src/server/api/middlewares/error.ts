import { ORPCError, os, ValidationError } from "@orpc/server"
import z from "zod"
import type { Context } from "../context"

export const o = os.$context<Context>()

export const errorMiddleware = (error: Error) => {
  console.error("ORPC Error protectedProcedure", error)
  if (error instanceof ORPCError && error.code === "BAD_REQUEST" && error.cause instanceof ValidationError) {
    // If you only use Zod you can safely cast to ZodIssue[]
    const zodError = new z.ZodError(error.cause.issues as z.core.$ZodIssue[])

    throw new ORPCError("INPUT_VALIDATION_FAILED", {
      status: 422,
      message: z.prettifyError(zodError),
      data: z.flattenError(zodError),
      cause: error.cause
    })
  }

  if (error instanceof ORPCError && error.code === "INTERNAL_SERVER_ERROR" && error.cause instanceof ValidationError) {
    throw new ORPCError("OUTPUT_VALIDATION_FAILED", {
      cause: error.cause
    })
  }

  if (error instanceof ORPCError) {
    throw error
  }

  throw new ORPCError("INTERNAL_SERVER_ERROR", {
    message: process.env.NODE_ENV === "production" ? "An internal error occurred" : error.message,
    status: 500,
    ...(process.env.NODE_ENV !== "production" && { cause: error })
  })
}
