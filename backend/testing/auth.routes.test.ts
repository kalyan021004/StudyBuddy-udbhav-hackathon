import request from "supertest";
import app from "../app";
import { User } from "../models/user.model";

describe("Auth Routes", () => {
  // 🧹 Clean up test user before running tests
  beforeAll(async () => {
    await User.deleteOne({ email: "jest-test+something@backend.server" });
  });

  it("Successful Registration Unit Testing (new user register)", async () => {
    const validPayload = {
     username:"UnitTesting",
     email: "jest-test+something@backend.server",
     password:"123456"
    };

    const response = await request(app)
      .post("/auth/register")
      .send(validPayload);
    
    console.log("Response Body:", response.body);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("message");
  });

  it("Unsuccessful Registration Unit Testing (creating existing user)", async () => {
    const validExistingPayload = {
     username:"UnitTesting",
     email: "jest-test+something@backend.server",
     password:"123456"
    };

    const response = await request(app)
      .post("/auth/register")
      .send(validExistingPayload);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message");
  });

  it("Successful Login Unit Testing (user login)", async () => {
    const validPayload = {
     email: "jest-test+something@backend.server",
     password:"123456"
    };

    const response = await request(app)
      .post("/auth/login")
      .send(validPayload);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("message");
  });

  it("Unsuccessful Login Unit Testing (wrong password)", async () => {
    const validExistingPayload = {
     email: "jest-test+something@backend.server",
     password:"1234567890"
    };

    const response = await request(app)
      .post("/auth/login")
      .send(validExistingPayload);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message");
  });

  // 🧹 Clean up test user after running tests
  afterAll(async () => {
    await User.deleteOne({ email: "jest-test+something@backend.server" });
  });
});
