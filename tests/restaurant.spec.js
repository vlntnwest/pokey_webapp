const { default: axios } = require("axios");
const request = require("supertest");
const app = require("../app");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const TIMEOUT = 30000;

const testEmail = `test-resto-${Date.now()}@example.com`;
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

const validRestaurant = {
  name: "Test Restaurant",
  address: "123 Rue de Test",
  zipCode: "75001",
  city: "Paris",
  phone: "06 12 34 56 78",
  email: "resto@test.com",
  imageUrl: "https://example.com/image.jpg",
};

describe("RESTAURANT CRUD", () => {
  let token;
  let restaurantId;

  // ─── 0. AUTH SETUP ──────────────────────────────────────
  beforeAll(async () => {
    await supabaseAuth("signup", {
      email: testEmail,
      password: testPassword,
    });

    const loginResponse = await supabaseAuth("token?grant_type=password", {
      email: testEmail,
      password: testPassword,
    });

    token = loginResponse.data.access_token;
  }, TIMEOUT);

  // ─── 1. CREATE RESTAURANT ──────────────────────────────
  describe("Create restaurant", () => {
    let response;

    beforeAll(async () => {
      response = await authRequest("post", "/api/restaurants", token).send(
        validRestaurant,
      );
      restaurantId = response.body.response?.id;
    }, TIMEOUT);

    test("should return 201", () => {
      expect(response.status).toBe(201);
    });

    test("should return restaurant object", () => {
      expect(response.body.response).toBeDefined();
    });

    test("should return the correct name", () => {
      expect(response.body.response.name).toBe(validRestaurant.name);
    });

    test("should return the correct address", () => {
      expect(response.body.response.address).toBe(validRestaurant.address);
    });

    test("should return the correct city", () => {
      expect(response.body.response.city).toBe(validRestaurant.city);
    });
  });

  // ─── 1b. CREATE RESTAURANT – validation errors ─────────
  describe("Create restaurant - validation", () => {
    test(
      "should reject missing name",
      async () => {
        const { name, ...rest } = validRestaurant;
        const response = await authRequest(
          "post",
          "/api/restaurants",
          token,
        ).send(rest);
        expect(response.status).toBe(400);
      },
      TIMEOUT,
    );

    test(
      "should reject invalid zipCode",
      async () => {
        const response = await authRequest(
          "post",
          "/api/restaurants",
          token,
        ).send({ ...validRestaurant, zipCode: "123" });
        expect(response.status).toBe(400);
      },
      TIMEOUT,
    );

    test(
      "should reject invalid phone",
      async () => {
        const response = await authRequest(
          "post",
          "/api/restaurants",
          token,
        ).send({ ...validRestaurant, phone: "invalid" });
        expect(response.status).toBe(400);
      },
      TIMEOUT,
    );

    test(
      "should reject invalid email",
      async () => {
        const response = await authRequest(
          "post",
          "/api/restaurants",
          token,
        ).send({ ...validRestaurant, email: "not-an-email" });
        expect(response.status).toBe(400);
      },
      TIMEOUT,
    );
  });

  // ─── 2. UPDATE RESTAURANT ──────────────────────────────
  describe("Update restaurant", () => {
    let response;

    beforeAll(async () => {
      response = await authRequest(
        "put",
        `/api/restaurants/${restaurantId}`,
        token,
      ).send({ name: "Updated Restaurant" });
    }, TIMEOUT);

    test("should return 200", () => {
      expect(response.status).toBe(200);
    });

    test("should return updated name", () => {
      expect(response.body.response.name).toBe("Updated Restaurant");
    });

    test("should keep unchanged fields", () => {
      expect(response.body.response.city).toBe(validRestaurant.city);
    });
  });

  // ─── 2b. UPDATE RESTAURANT – validation errors ─────────
  describe("Update restaurant - validation", () => {
    test(
      "should reject empty body",
      async () => {
        const response = await authRequest(
          "put",
          `/api/restaurants/${restaurantId}`,
          token,
        ).send({});
        expect(response.status).toBe(400);
      },
      TIMEOUT,
    );

    test(
      "should reject invalid zipCode",
      async () => {
        const response = await authRequest(
          "put",
          `/api/restaurants/${restaurantId}`,
          token,
        ).send({ zipCode: "abc" });
        expect(response.status).toBe(400);
      },
      TIMEOUT,
    );

    test(
      "should reject invalid phone",
      async () => {
        const response = await authRequest(
          "put",
          `/api/restaurants/${restaurantId}`,
          token,
        ).send({ phone: "invalid" });
        expect(response.status).toBe(400);
      },
      TIMEOUT,
    );

    test(
      "should return 403 for restaurant user is not member of",
      async () => {
        const fakeId = "00000000-0000-0000-0000-000000000000";
        const response = await authRequest(
          "put",
          `/api/restaurants/${fakeId}`,
          token,
        ).send({ name: "Nope" });
        expect(response.status).toBe(403);
      },
      TIMEOUT,
    );
  });

  // ─── 3. DELETE RESTAURANT ───────────────────────────────
  describe("Delete restaurant", () => {
    let response;

    beforeAll(async () => {
      response = await authRequest(
        "delete",
        `/api/restaurants/${restaurantId}`,
        token,
      );
    }, TIMEOUT);

    test("should return 200", () => {
      expect(response.status).toBe(200);
    });

    test("should return success message", () => {
      expect(response.body.response).toBe("Restaurant deleted successfully");
    });
  });

  // ─── 3b. DELETE RESTAURANT – errors ─────────────────────
  describe("Delete restaurant - errors", () => {
    test(
      "should return 403 for restaurant user is not member of",
      async () => {
        const fakeId = "00000000-0000-0000-0000-000000000000";
        const response = await authRequest(
          "delete",
          `/api/restaurants/${fakeId}`,
          token,
        );
        expect(response.status).toBe(403);
      },
      TIMEOUT,
    );
  });

  // ─── 4. AUTH ERRORS ────────────────────────────────────
  describe("Authentication errors", () => {
    test("should return 401 without token", async () => {
      const response = await request(app)
        .post("/api/restaurants")
        .send(validRestaurant);
      expect(response.status).toBe(401);
    });

    test("should return 401 with invalid token", async () => {
      const response = await authRequest(
        "post",
        "/api/restaurants",
        "invalid-token",
      ).send(validRestaurant);
      expect(response.status).toBe(401);
    });
  });

  // ─── 5. CLEANUP ────────────────────────────────────────
  afterAll(async () => {
    try {
      await authRequest("delete", "/api/user/me", token);
    } catch (e) {
      // cleanup best effort
    }
  }, TIMEOUT);
});
