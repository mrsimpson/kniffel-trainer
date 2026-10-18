// The screenshots of the guide page (docs/anleitung.md): the tests play the app as a learner does and save what the
// screen shows after each step, at desktop width and at 360 px. The page's pictures are exactly these files, so that
// the guide shows the app as it is. After a change of the look run
// LERNAPPS_GUIDE_PICTURES=1 npx playwright test e2e/anleitung.e2e.ts and commit the new pictures.
import { expect, test, type Page } from "playwright/test";

/**
 * Where the pictures go: the guide's folder when LERNAPPS_GUIDE_PICTURES is set, else the test's own output folder.
 * A plain run (the hooks, CI) must not change files that are committed: the same screen differs by a few pixels from
 * one run to the next.
 */
const environment = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};
const IMAGES = environment["LERNAPPS_GUIDE_PICTURES"] === undefined ? undefined : "docs/anleitung/img";

/** Opens the app at a route with the seed whose first throw shows three fours and waits until it is mounted. */
async function open(page: Page, route: string, lang = ""): Promise<void> {
  await page.goto(`./${lang}app/?seed=6#${route}`);
  await expect(page.locator(".interactive-app[data-mounted]")).toBeAttached();
}

/** Saves the screen as a picture of the guide, named after the step and the width (desktop or 360px). */
async function shoot(page: Page, name: string): Promise<void> {
  // no hover state of the last click in the picture
  await page.mouse.move(0, 0);
  const project = test.info().project.name;
  await page.screenshot({
    path: `${IMAGES ?? test.info().outputDir}/${name}-${project}.png`,
    fullPage: true,
    caret: "hide",
    animations: "disabled",
  });
}

test.describe("guide pictures", () => {
  test.use({ reducedMotion: "reduce" });

  test("the setup and the first throw with the coach", async ({ page }) => {
    await open(page, "erklaeren");
    await shoot(page, "1-start");
    await page.getByRole("button", { name: /Obere Hälfte/ }).click();
    await page.keyboard.press(" ");
    await expect(page.locator(".kt-coach")).toBeVisible();
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
    await expect(page.getByLabel("Chance für keine 4")).toHaveClass(/ok/);
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
