import { isAppRouteAllowed } from "./rbac";

describe("isAppRouteAllowed", () => {
  test("should allow dashboard for all roles", () => {
    expect(isAppRouteAllowed("/app/dashboard", "ADMIN")).toBe(true);
    expect(isAppRouteAllowed("/app/dashboard", "GESTOR")).toBe(true);
    expect(isAppRouteAllowed("/app/dashboard", "OPERADOR")).toBe(true);
    expect(isAppRouteAllowed("/app/dashboard", "LEITOR")).toBe(true);
  });

  test("should allow relatorios for ops group", () => {
    expect(isAppRouteAllowed("/app/relatorios", "ADMIN")).toBe(true);
    expect(isAppRouteAllowed("/app/relatorios", "GESTOR")).toBe(true);
    expect(isAppRouteAllowed("/app/relatorios", "OPERADOR")).toBe(true);
    expect(isAppRouteAllowed("/app/relatorios", "LEITOR")).toBe(false);
  });

  test("should allow aprovacao for ops group", () => {
    expect(isAppRouteAllowed("/app/aprovacao", "ADMIN")).toBe(true);
    expect(isAppRouteAllowed("/app/aprovacao", "GESTOR")).toBe(true);
    expect(isAppRouteAllowed("/app/aprovacao", "OPERADOR")).toBe(true);
    expect(isAppRouteAllowed("/app/aprovacao", "LEITOR")).toBe(false);
  });

  test("should allow certidoes for ops group", () => {
    expect(isAppRouteAllowed("/app/certidoes", "ADMIN")).toBe(true);
    expect(isAppRouteAllowed("/app/certidoes", "GESTOR")).toBe(true);
    expect(isAppRouteAllowed("/app/certidoes", "OPERADOR")).toBe(true);
    expect(isAppRouteAllowed("/app/certidoes", "LEITOR")).toBe(false);
  });

  test("should deny unmapped routes", () => {
    expect(isAppRouteAllowed("/app/non-existent", "ADMIN")).toBe(false);
  });

  test("should allow sub-routes of allowed prefixes", () => {
    expect(isAppRouteAllowed("/app/relatorios/new", "ADMIN")).toBe(true);
  });
});
