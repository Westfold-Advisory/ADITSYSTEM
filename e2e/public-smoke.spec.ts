import { expect, test } from "@playwright/test";

test.describe("Superficie pública", () => {
  test("listado de eventos carga el encabezado", async ({ page }) => {
    await page.goto("/eventos");
    await expect(
      page.getByRole("heading", { name: "Eventos públicos" }),
    ).toBeVisible();
  });

  test("mapa público carga la shell", async ({ page }) => {
    await page.goto("/mapa");
    await expect(page.locator("#public-main-content")).toBeVisible();
  });

  test("login administrativo muestra el formulario", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: "Acceso administrativo" }),
    ).toBeVisible();
    await expect(page.getByLabel("Correo electrónico")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Iniciar sesión" }),
    ).toBeVisible();
  });
});
