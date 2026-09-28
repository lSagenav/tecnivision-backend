import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { authCookieOptions } from "../src/config/auth-cookie.js";

function setEnv(t: TestContext, name: string, value: string) {
  const previous = process.env[name];
  process.env[name] = value;
  t.after(() => { if (previous === undefined) delete process.env[name]; else process.env[name] = previous; });
}
test("local HTTP retains Lax; production and proxy HTTPS allow cross-site cookies", t => {
  setEnv(t, "COOKIE_DOMAIN", "");
  setEnv(t, "NODE_ENV", "development");
  assert.deepEqual(authCookieOptions({ secure: false }), { httpOnly: true, secure: false, sameSite: "lax", path: "/" });
  assert.deepEqual(authCookieOptions({ secure: true }), { httpOnly: true, secure: true, sameSite: "none", path: "/" });
  setEnv(t, "NODE_ENV", "production");
  assert.deepEqual(authCookieOptions({ secure: false }), { httpOnly: true, secure: true, sameSite: "none", path: "/" });
});

test("login and logout share cookie scope and clearCookie expires the same cookie", async t => {
  setEnv(t, "NODE_ENV", "development");
  setEnv(t, "COOKIE_DOMAIN", "");
  const app = express();
  app.set("trust proxy", 1);
  app.post("/login", (req, res) => res.cookie("admin-token", "test-value", { ...authCookieOptions(req), maxAge: 86400000 }).sendStatus(200));
  app.post("/logout", (req, res) => res.clearCookie("admin-token", authCookieOptions(req)).sendStatus(200));
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>(resolve => server.once("listening", resolve));
  t.after(() => new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const base = `http://127.0.0.1:${address.port}`;
  const headers = { "X-Forwarded-Proto": "https" };
  const login = await fetch(`${base}/login`, { method: "POST", headers });
  const loginCookie = login.headers.get("set-cookie") ?? "";
  for (const attribute of ["HttpOnly", "Secure", "SameSite=None", "Path=/", "Max-Age=86400"]) assert.ok(loginCookie.includes(attribute), attribute);
  assert.ok(!loginCookie.includes("Domain="));
  const logout = await fetch(`${base}/logout`, { method: "POST", headers });
  const logoutCookie = logout.headers.get("set-cookie") ?? "";
  for (const attribute of ["admin-token=;", "HttpOnly", "Secure", "SameSite=None", "Path=/", "Expires=Thu, 01 Jan 1970"]) assert.ok(logoutCookie.includes(attribute), attribute);
  assert.ok(!logoutCookie.includes("Max-Age=86400"));
});

test("an explicitly configured cookie domain is shared by login and logout", t => {
  setEnv(t, "COOKIE_DOMAIN", "example.com");
  assert.equal(authCookieOptions({ secure: true }).domain, "example.com");
});
