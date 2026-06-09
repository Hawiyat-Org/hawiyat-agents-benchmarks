import { describe, it, expect } from "vitest";
import app from "../src/app.js";

const testClient = async (url: string, init?: RequestInit) => {
  const headers = new Headers(init?.headers);
  if (!headers.has("Authorization")) {
    headers.set("Authorization", "Bearer test-token");
  }
  const req = new Request(`http://localhost${url}`, { ...init, headers });
  return app.fetch(req);
};

const testClientNoAuth = async (url: string, init?: RequestInit) => {
  const req = new Request(`http://localhost${url}`, init);
  return app.fetch(req);
};

const getUsers = async () => {
  const res = await testClient("/api/v1/users");
  const body = await res.json();
  return body.users;
};

describe("Health", () => {
  it("returns ok", async () => {
    const res = await testClient("/api/v1/health");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
  });
});

describe("Users", () => {
  it("lists users without auth", async () => {
    const res = await testClientNoAuth("/api/v1/users");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.users).toBeDefined();
  });

  it("returns 404 for missing user", async () => {
    const res = await testClient("/api/v1/users/nonexistent");
    expect(res.status).toBe(404);
  });

  it("creates a user with 201 and returns user object", async () => {
    const email = `test-${Date.now()}@example.com`;
    const res = await testClient("/api/v1/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name: "Test" }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.user.email).toBe(email);
    expect(body.user.id).toBeDefined();
  });

  it("searches users by email", async () => {
    const res = await testClient("/api/v1/users/search?email=alice@example.com");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.users.length).toBeGreaterThan(0);
  });

  it("returns all users when searching without email", async () => {
    const res = await testClient("/api/v1/users/search");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.users.length).toBeGreaterThan(0);
  });

  it("handles concurrent user creation safely", async () => {
    const email = `concurrent-${Date.now()}@example.com`;
    const [r1, r2] = await Promise.all([
      testClient("/api/v1/users/concurrent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }),
      testClient("/api/v1/users/concurrent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }),
    ]);
    const codes = [r1.status, r2.status].sort();
    expect(codes).toContain(201);
    expect(codes).toContain(409);
  });
});

describe("Posts", () => {
  it("lists posts with pagination", async () => {
    const res = await testClient("/api/v1/posts?page=1&limit=10");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.posts).toBeDefined();
  });

  it("returns post with author", async () => {
    const postsRes = await testClient("/api/v1/posts?page=1&limit=1");
    const postsBody = await postsRes.json();
    const postId = postsBody.posts[0]?.id;
    if (!postId) return;
    const res = await testClient(`/api/v1/posts/${postId}/with-author`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.post.author).toBeDefined();
  });

  it("creates a post with 201", async () => {
    const users = await getUsers();
    const authorId = users[0]?.id;
    if (!authorId) return;
    const res = await testClient("/api/v1/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test Post",
        status: "draft",
        authorId,
      }),
    });
    expect(res.status).toBe(201);
  });
});

describe("Benchmarks", () => {
  it("lists benchmarks", async () => {
    const res = await testClient("/api/v1/benchmarks");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.benchmarks).toBeDefined();
  });

  it("creates a benchmark with 201", async () => {
    const res = await testClient("/api/v1/benchmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test", score: 50 }),
    });
    expect(res.status).toBe(201);
  });
});

describe("Orders", () => {
  it("creates an order and sends email", async () => {
    const users = await getUsers();
    const userId = users[0]?.id;
    if (!userId) return;
    const res = await testClient("/api/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, total: 100 }),
    });
    expect(res.status).toBe(201);
  });
});

describe("Organizations", () => {
  it("lists organizations with members", async () => {
    const res = await testClient("/api/v1/organizations");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.organizations).toBeDefined();
  });

  it("creates bulk members safely", async () => {
    const orgsRes = await testClient("/api/v1/organizations");
    const orgsBody = await orgsRes.json();
    const orgId = orgsBody.organizations[0]?.id;
    if (!orgId) return;
    const users = await getUsers();
    const userId = users[0]?.id;
    if (!userId) return;
    const res = await testClient(`/api/v1/organizations/${orgId}/bulk-members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([
        { userId, role: "admin" },
      ]),
    });
    expect(res.status).toBe(201);
  });
});

describe("Dashboard", () => {
  it("returns dashboard data", async () => {
    const res = await testClient("/api/v1/dashboard");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.users).toBeDefined();
    expect(body.posts).toBeDefined();
    expect(body.benchmarks).toBeDefined();
  });
});

describe("Analytics", () => {
  it("returns posts with authors", async () => {
    const res = await testClient("/api/v1/analytics/posts-with-authors");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.posts).toBeDefined();
    expect(body.posts[0].author).toBeDefined();
  });
});

describe("Transfer", () => {
  it("transfers balance correctly", async () => {
    const users = await getUsers();
    const fromUserId = users[0]?.id;
    const toUserId = users[1]?.id;
    if (!fromUserId || !toUserId) return;
    const res = await testClient("/api/v1/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromUserId, toUserId, amount: 10 }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});

describe("Auth", () => {
  it("protects admin routes without auth", async () => {
    const res = await testClientNoAuth("/api/v1/admin/stats");
    expect(res.status).toBe(401);
  });

  it("allows public routes without auth", async () => {
    const res = await testClientNoAuth("/api/v1/public/info");
    expect(res.status).toBe(200);
  });

  it("handles auth wildcard route without auth", async () => {
    const res = await testClientNoAuth("/api/auth/login");
    expect(res.status).toBe(200);
  });
});

describe("Client", () => {
  it("lists users per request", async () => {
    const res = await testClient("/api/v1/users-per-request");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.users).toBeDefined();
  });
});
