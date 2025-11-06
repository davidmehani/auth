import path from "path"

export const getPathForLambda = (relativePath: string): string =>
    path.resolve(__dirname, '../../auth-lambda/src/handlers', relativePath);
