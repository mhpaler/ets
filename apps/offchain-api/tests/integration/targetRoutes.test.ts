import express, { type Application, type NextFunction, type Request, type Response } from "express";
import request from "supertest";
import * as targetController from "../../src/controllers/targetController";
import targetRoutes from "../../src/routes/targetRoutes";

// Mock dependencies
jest.mock("../../src/controllers/targetController");
jest.mock("../../src/middleware/chainIdValidator", () => ({
  validateChainId: (_req: Request, _res: Response, next: NextFunction) => next(),
}));

describe("Target Routes", () => {
  let app: Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/target", targetRoutes);

    // Reset mocks
    jest.clearAllMocks();

    // Setup mock implementations
    (targetController.processTarget as jest.Mock).mockImplementation((_req, res) => {
      res.status(200).json({ success: true });
    });
  });

  describe("POST /target/enrich", () => {
    it("should return 200 and call processTarget", async () => {
      const response = await request(app).post("/target/enrich").send({ chainId: 1 });

      expect(response.status).toBe(200);
      expect(targetController.processTarget).toHaveBeenCalled();
    });
  });
});
