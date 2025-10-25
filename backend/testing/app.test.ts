import request from "supertest";
import app from "../app";

describe("API Tests", () => {
  it("should return Date from API", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "yo" });
  });
});
