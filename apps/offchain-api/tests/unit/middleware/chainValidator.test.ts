import type { NextFunction, Request, Response } from "express";
import { validateChainId } from "../../../src/middleware/chainIdValidator";
import { AppError } from "../../../src/utils/errorHandler";

describe("Chain ID Validator Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it("should call next with error when chainId is missing", () => {
    mockRequest = {
      body: {},
    };

    validateChainId(mockRequest as Request, mockResponse as Response, nextFunction);

    // Check that next was called with an error
    expect(nextFunction).toHaveBeenCalled();

    // Get the error and cast it to AppError to fix the TypeScript error
    const error = nextFunction.mock.calls[0][0] as unknown as AppError;
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Chain ID is required");
  });
  it("should call next without arguments when chainId is valid", () => {
    mockRequest = {
      body: { chainId: 31337 },
    };

    // Mock config.chains.isChainSupported to return true for testing
    jest.mock("../../../src/config", () => ({
      config: {
        chains: {
          isChainSupported: jest.fn().mockReturnValue(true),
          availableChainIds: [1, 2, 3],
        },
      },
    }));

    validateChainId(mockRequest as Request, mockResponse as Response, nextFunction);

    // Should just call next() without arguments for valid chainId
    expect(nextFunction).toHaveBeenCalledWith();
  });
});
