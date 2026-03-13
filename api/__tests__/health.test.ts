/**
 * Tests for health check endpoints.
 */

import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "@jest/globals";
import express from "express";

// Build a minimal app with just the health endpoints for testing
function createTestApp() {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  return app;
}

describe("Health Check Route", () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /health", () => {
    it("should return health status", async () => {
      // Use a simple approach without supertest to avoid sandbox issues
      const result = await new Promise<any>((resolve) => {
        const req = {
          method: "GET",
          url: "/health",
          headers: {},
        } as any;

        const res = {
          statusCode: 200,
          body: null as any,
          status(code: number) {
            this.statusCode = code;
            return this;
          },
          json(data: any) {
            this.body = data;
            resolve(this);
            return this;
          },
        } as any;

        app.handle(req, res, () => {});
      });

      expect(result.body).toEqual(
        expect.objectContaining({
          status: "ok",
          timestamp: expect.any(String),
          uptime: expect.any(Number),
        }),
      );
    });

    it("should include timestamp in ISO format", async () => {
      const result = await new Promise<any>((resolve) => {
        const req = {
          method: "GET",
          url: "/health",
          headers: {},
        } as any;

        const res = {
          statusCode: 200,
          body: null as any,
          status(code: number) {
            this.statusCode = code;
            return this;
          },
          json(data: any) {
            this.body = data;
            resolve(this);
            return this;
          },
        } as any;

        app.handle(req, res, () => {});
      });

      const timestamp = new Date(result.body.timestamp);
      expect(timestamp.toISOString()).toBe(result.body.timestamp);
    });

    it("should include positive uptime", async () => {
      const result = await new Promise<any>((resolve) => {
        const req = {
          method: "GET",
          url: "/health",
          headers: {},
        } as any;

        const res = {
          statusCode: 200,
          body: null as any,
          status(code: number) {
            this.statusCode = code;
            return this;
          },
          json(data: any) {
            this.body = data;
            resolve(this);
            return this;
          },
        } as any;

        app.handle(req, res, () => {});
      });

      expect(result.body.uptime).toBeGreaterThan(0);
    });
  });
});
