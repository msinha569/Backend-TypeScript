import { NextFunction, Request, Response, ErrorRequestHandler } from "express";
import { ApiError } from "../utils/ApiError";

const errorMiddleware: ErrorRequestHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            status: err.statusCode,
            success: err.success,
            message: err.message || "no error msg was provided",
            errors: err.errors,
            data: err.data,
        });
        return; // Ensure the function explicitly ends after sending a response
    }

    // Log unexpected errors
    console.error(err);

    res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
};

export default errorMiddleware;
