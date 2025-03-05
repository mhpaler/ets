import type { NextFunction, Request, Response } from "express";
import { config } from "../config";
import { AppError } from "../utils/errorHandler";

export const validateChainId = (req: Request, _res: Response, next: NextFunction) => {
  const { chainId } = req.body;

  if (!chainId) {
    return next(new AppError("Chain ID is required", 400));
  }

  // Ensure chainId is a number
  const chainIdNumber = Number(chainId);
  if (Number.isNaN(chainIdNumber)) {
    return next(new AppError("Chain ID must be a valid number", 400));
  }

  // Check if chainId is supported
  if (!config.chains.isChainSupported(chainIdNumber)) {
    const validChains = config.chains.availableChainIds.join(", ");
    return next(new AppError(`Unsupported chain ID. Supported chains are: ${validChains}`, 400));
  }

  // Attach the validated chainId as a number to the request
  req.body.chainId = chainIdNumber;

  next();
};
