import express, { type Application, type NextFunction, type Request, type Response } from "express";
import request from "supertest";
import * as auctionController from "../../src/controllers/auctionController";
import auctionRoutes from "../../src/routes/auctionRoutes";

// Mock dependencies
jest.mock("../../src/controllers/auctionController");
jest.mock("../../src/middleware/chainIdValidator", () => ({
  validateChainId: (_req: Request, _res: Response, next: NextFunction) => next(),
}));

describe("Auction Routes", () => {
  let app: Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/auction", auctionRoutes);

    // Reset mocks
    jest.clearAllMocks();

    // Setup mock implementations
    (auctionController.getNextAuction as jest.Mock).mockImplementation((_req, res) => {
      res.status(200).json({ success: true });
    });

    (auctionController.handleAuctionWebhook as jest.Mock).mockImplementation((_req, res) => {
      res.status(200).json({ success: true });
    });
  });

  describe("POST /auction/next", () => {
    it("should return 200 and call getNextAuction", async () => {
      const response = await request(app).post("/auction/next").send({ chainId: 1 });

      expect(response.status).toBe(200);
      expect(auctionController.getNextAuction).toHaveBeenCalled();
    });
  });

  describe("POST /auction/webhook", () => {
    it("should return 200 and call handleAuctionWebhook", async () => {
      const response = await request(app).post("/auction/webhook").send({ chainId: 1 });

      expect(response.status).toBe(200);
      expect(auctionController.handleAuctionWebhook).toHaveBeenCalled();
    });
  });
});
