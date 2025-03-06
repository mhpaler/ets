import * as sdkCore from "@ethereum-tag-service/sdk-core";
import type { NextFunction, Request, Response } from "express";
import { getNextAuction } from "../../../src/controllers/auctionController";
import { tagService } from "../../../src/services/auction/tagService";

// Mock the SDK core module
jest.mock("@ethereum-tag-service/sdk-core", () => ({
  createAccessControlsClient: jest.fn().mockReturnValue({
    getPlatformAddress: jest.fn().mockResolvedValue("0x1234567890abcdef1234567890abcdef12345678"),
  }),
}));

// Mock the tagService
jest.mock("../../../src/services/auction/tagService", () => ({
  tagService: {
    findNextCTAG: jest.fn().mockResolvedValue({
      tagId: "123",
      tagDisplay: "test-tag",
    }),
  },
}));

describe("Auction Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let responseObject: any;

  beforeEach(() => {
    responseObject = {};
    mockRequest = {
      body: { chainId: 31337 }, // Use a valid chain ID
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result) => {
        responseObject = result;
        return mockResponse;
      }),
    };
    mockNext = jest.fn();

    // Clear all mock calls before each test
    jest.clearAllMocks();
  });

  describe("getNextAuction", () => {
    it("should process next auction request", async () => {
      await getNextAuction(mockRequest as Request, mockResponse as Response, mockNext);

      // Verify the response
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();

      // Check the response content
      expect(responseObject).toEqual(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            chainId: 31337,
            hasEligibleTag: true,
            tagId: "123",
            tagDisplay: "test-tag",
          }),
        }),
      );

      // Verify that the SDK was called with the correct chain ID
      expect(sdkCore.createAccessControlsClient).toHaveBeenCalledWith({ chainId: 31337 });
    });

    it("should return no eligible tags when tagService returns null", async () => {
      // Override the mock for this test case only
      (tagService.findNextCTAG as jest.Mock).mockResolvedValueOnce(null);

      await getNextAuction(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            chainId: 31337,
            hasEligibleTag: false,
          }),
        }),
      );
    });
  });
});
