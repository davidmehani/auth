import path from "path";

export const getPathForLambda = (relativePath: string): string =>
  path.resolve(process.cwd(), "../auth-lambda/src/handlers", relativePath);
