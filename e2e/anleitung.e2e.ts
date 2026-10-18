// The screenshots of the guide page (docs/anleitung.md): the tests play the app as a learner does and save what the
// screen shows after each step, at desktop width and at 360 px. The page's pictures are exactly these files, so that
// the guide shows the app as it is; run the tests again after a change of the look and commit the new pictures.
import { expect, test, type Page } from "playwright/test";

const IMAGES = "docs/anleitung/img";

/** Opens the app at a route with the seed whose first throw shows three fours and waits until it is mounted. */
async function open(page: Page, route: string, lang = ""): Promise<void> {
  await page.goto(`./${lang}app/?seed=6#${route}`);
  await expect(page.locator(".interactive-app[data-mounted]")).toBeAttached();
}

/** Saves the screen as a picture of the guide, named after the step and the width (desktop or 360px). */
async function shoot(page: Page, name: string): Promise<void> {
  const project = test.info().project.name;
  await page.screenshot({ path: `${IMAGES}/${name}-${project}.png`, fullPage: true });
}

test.describe("guide pictures", () => {
  test.use({ reducedMotion: "reduce" });

  test("the setup and the first throw with the coach", async ({ page }) => {
    await open(page, "erklaeren");
    await shoot(page, "1-start");
    await page.getByRole("button", { name: /Obere Hälfte/ }).click();
    await page.keyboard.press(" ");
    await expect(page.locator(".kt-coach")).toBeVisible();
    await shoot(page, "2a-coach-nichts-gehalten");
    for (const key of ["1", "3", "5"]) await page.keyboard.press(key);
    await expect(page.locator(".kt-spread")).toBeVisible();
    await shoot(page, "2-coach-chancen");
    await page.getByRole("button", { name: "So geht’s" }).click();
    await shoot(page, "3-coach-baum");
    await page.getByRole("button", { name: "2 Würfe" }).click();
    await shoot(page, "4-coach-zwei-wuerfe");
  });

  test("the joker in its three levels and the feedback", async ({ page }) => {
    await open(page, "joker");
    await page.getByRole("button", { name: /Obere Hälfte/ }).click();
    await page.keyboard.press(" ");
    await page.getByRole("button", { name: /Joker fragen/ }).click();
    await shoot(page, "5-joker-1-leer");
    await page.getByLabel("Chance für eine 4").fill("1/6");
    await page.getByLabel("Chance für eine 4").blur();
    await page.getByLabel("Chance für keine 4").fill("5/6");
    await page.getByLabel("Chance für keine 4").blur();
    await shoot(page, "6-joker-1-ausgefuellt");
    await page.getByRole("button", { name: "2 Äste" }).click();
    await shoot(page, "7-joker-2-aeste");
    await page.getByRole("button", { name: "3 Lösung" }).click();
    await shoot(page, "8-joker-3-loesung");
    await page.keyboard.press(" ");
    await page.getByRole("button", { name: /Vierer eintragen/ }).click();
    await expect(page.locator(".kt-feedback")).toBeVisible();
    await shoot(page, "9-rueckmeldung");
  });

  test("the plain game and its end with the high scores", async ({ page }) => {
    await open(page, "spielen");
    await page.getByRole("button", { name: /Obere Hälfte/ }).click();
    await page.keyboard.press(" ");
    await shoot(page, "10-spielen");
    for (let round = 0; round < 6; round++) {
      if (round > 0) await page.keyboard.press(" ");
      await page.locator(".kt-block tr.open button").first().click();
    }
    await expect(page.getByRole("heading", { name: "Geschafft!" })).toBeVisible();
    await shoot(page, "11-ende");
  });
});
