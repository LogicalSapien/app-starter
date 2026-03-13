/**
 * Tests for health check endpoints.
 */

import { describe, it, expect } from "@jest/globals";
import request from "supertest";
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
  const app = createTestApp();

  describe("GET /health", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: "ok",
          timestamp: expect.any(String),
          uptime: expect.any(Number),
        }),
      );
    });

    it("should include timestamp in ISO format", async () => {
      const response = await request(app).get("/health");

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.toISOString()).toBe(response.body.timestamp);
    });

    it("should include positive uptime", async () => {
      const response = await request(app).get("/health");

      expect(response.body.uptime).toBeGreaterThan(0);
    });
  });
});
