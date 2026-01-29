const { default: axios } = require("axios");
const request = require("supertest");
const app = require("../app");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const TIMEOUT = 30000;

const testEmail = `test-${Date.now()}@example.com`;
const testPassword = "Test1234!";

const supabaseAuth = (path, body) =>
  axios.post(`${SUPABASE_URL}/auth/v1/${path}`, body, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
  });

const authRequest = (method, path, token) =>
  request(app)
    [method](path)
    .set({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });

describe("USER CRUD", () => {
  let token;

  // ─── 1. SIGNUP ───────────────────────────────────────────
  describe("Signup", () => {
    let response;

    beforeAll(async () => {
      response = await supabaseAuth("signup", {
        email: testEmail,
        password: testPassword,
      });
    }, TIMEOUT);

    test("should return 200", () => {
      expect(response.status).toBe(200);
    });

    test("should return user id", () => {
      expect(response.data.user.id).toBeDefined();
    });

    test("should return the correct email", () => {
      expect(response.data.user.email).toBe(testEmail);
    });
  });

  // ─── 2. LOGIN ────────────────────────────────────────────
  describe("Login", () => {
    let response;

    beforeAll(async () => {
      response = await supabaseAuth("token?grant_type=password", {
        email: testEmail,
        password: testPassword,
      });
      token = response.data.access_token;
    }, TIMEOUT);

    test("should return 200", () => {
      expect(response.status).toBe(200);
    });

    test("should return a valid access token", () => {
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });

    test("should return a refresh token", () => {
      expect(response.data.refresh_token).toBeDefined();
    });
  });

  // ─── 3. GET USER ─────────────────────────────────────────
  describe("Get user data", () => {
    let response;

    beforeAll(async () => {
      response = await authRequest("get", "/api/user/me", token);
    }, TIMEOUT);

    test("should return 200", () => {
      expect(response.status).toBe(200);
    });

    test("should return user object", () => {
      expect(response.body.user).toBeDefined();
    });

    test("should return the correct email", () => {
      expect(response.body.user.email).toBe(testEmail);
    });
  });

  // ─── 4. UPDATE USER ──────────────────────────────────────
  describe("Update user data", () => {
    let response;

    beforeAll(async () => {
      response = await authRequest("put", "/api/user/me", token).send({
        fullName: "Test User",
        phone: "06 12 34 56 78",
        role: "CLIENT",
      });
    }, TIMEOUT);

    test("should return 200", () => {
      expect(response.status).toBe(200);
    });

    test("should return updated fullName", () => {
      expect(response.body.user.fullName).toBe("Test User");
    });

    test("should return updated phone", () => {
      expect(response.body.user.phone).toBe("06 12 34 56 78");
    });

    test("should return updated role", () => {
      expect(response.body.user.role).toBe("CLIENT");
    });
  });

  // ─── 4b. UPDATE USER – validation errors ─────────────────
  describe("Update user data - validation", () => {
    test(
      "should reject invalid phone number",
      async () => {
        const response = await authRequest("put", "/api/user/me", token).send({
          phone: "invalid",
        });
        expect(response.status).toBe(400);
      },
      TIMEOUT,
    );

    test(
      "should reject fullName exceeding 50 chars",
      async () => {
        const response = await authRequest("put", "/api/user/me", token).send({
          fullName: "a".repeat(51),
        });
        expect(response.status).toBe(400);
      },
      TIMEOUT,
    );

    test(
      "should reject invalid role",
      async () => {
        const response = await authRequest("put", "/api/user/me", token).send({
          role: "SUPERADMIN",
        });
        expect(response.status).toBe(400);
      },
      TIMEOUT,
    );
  });

  // ─── 5. DELETE USER ──────────────────────────────────────
  describe("Delete user", () => {
    let response;

    beforeAll(async () => {
      response = await authRequest("delete", "/api/user/me", token);
    }, TIMEOUT);

    test("should return 200", () => {
      expect(response.status).toBe(200);
    });

    test("should return success message", () => {
      expect(response.body.message).toBe("Utilisateur supprimé");
    });
  });

  // ─── 6. VERIFY DELETION ─────────────────────────────────
  describe("After deletion", () => {
    test(
      "should not be able to access user data",
      async () => {
        const response = await authRequest("get", "/api/user/me", token);
        expect(response.status).not.toBe(200);
      },
      TIMEOUT,
    );
  });

  // ─── 7. AUTH ERRORS ──────────────────────────────────────
  describe("Authentication errors", () => {
    test("should return 401 without token", async () => {
      const response = await request(app).get("/api/user/me");
      expect(response.status).toBe(401);
    });

    test("should return 401 with invalid token", async () => {
      const response = await authRequest(
        "get",
        "/api/user/me",
        "invalid-token",
      );
      expect(response.status).toBe(401);
    });
  });
});
