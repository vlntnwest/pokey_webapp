import app from "../app";
import request from "supertest";

const BEFORE_ALL_TIMEOUT = 30000;

describe("get user by id", () => {
  const userId = "b849667c-e871-4bea-8f94-cc9227f71b69";
  let response;

  beforeAll(async () => {
    response = await request(app).get(`/api/auth/users/${userId}`);
  }, BEFORE_ALL_TIMEOUT);

  test("should return 200", () => {
    expect(response.status).toBe(200);
  });

  test("should return user", () => {
    expect(response.body.user).toBeDefined();
    expect(response.body.user.id).toBe(userId);
  });
});
