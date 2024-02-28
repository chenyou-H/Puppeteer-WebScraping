const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

async function runWebScrapping(city) {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  const context = browser.defaultBrowserContext();
  // Get rid of location request and go to google home page
  await context.overridePermissions("https://www.google.com", ["geolocation"]);

  const page = await browser.newPage();
  let data = [];

  try {
    await performGoogleSearch(page);
    await clickOnHomesLink(page);
    await searchHomesInCity(page, city);
    data = await extractHomesData(page);
  } catch (error) {
    console.error("An error occured:", error);
  } finally {
    // await page.screenshot({ path: "performGoogleSearch.png", fullPage: true });
    // const currentURL = page.url();
    // console.log(`Current URL: ${currentURL}`);
    await browser.close();
    return data;
  }
}

// runWebScrapping("london");

async function performGoogleSearch(page) {
  await page.goto("https://www.google.com/", { waitUntil: 'networkidle0' });
  await page.setViewport({ width: 1080, height: 1024 });
  const searchQuery = "top home listing websites";
  const googleSearchBoxSelector = 'textarea[aria-label="Search"]';
  await page.type(googleSearchBoxSelector, searchQuery);
  await page.keyboard.press("Enter");
  await page.waitForNavigation();
}

// Function to keep scrolling until the next page button appears
async function scrollDown(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      const distance = window.innerHeight; // Scroll the height of the viewport
      let totalHeight = 0;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });
}

// find homes
async function clickOnHomesLink(page) {
  let nextPageButtonFound = true;

  while (nextPageButtonFound) {
    const homesLinkSelector = 'a[href*="www.homes.com"]';
    const homesLink = await page.$(homesLinkSelector);

    if (homesLink) {
      await homesLink.click();
      await page.waitForNavigation();
      break;
    } else {
      await scrollDown(page);
    }
    // Scroll to trigger loading of more content

    // Check if the "Next" button is still present
    nextPageButtonFound = await page.evaluate(() => {
      const nextButton = document.querySelector('a[aria-label="More results"]');
      if (nextButton) {

        nextButton.click(); // Clicking to load next page
        return true;
      }
      return false;
    });
  }
}

async function searchHomesInCity(page, city) {
  const searchBoxSelector =
    'input[aria-label="Place, Neighborhood, School or Agent"]';
  try {
    await page.waitForSelector(searchBoxSelector);
    await page.type(searchBoxSelector, city);
    await page.keyboard.press("Enter");
    await page.waitForNavigation();
  } catch (error) {
    console.error(`Error: Input box not found or navigation failed.`);
  }
}


async function extractHomesData(page) {
  let results = [];
  const searchResultsSelector = ".search-placards-container > ul > li";

  await scrollDown(page);

  try {
    await page.waitForSelector(searchResultsSelector);
    results = await page.$$eval(searchResultsSelector, (lis) => {
      return lis.map((li) => {
        const price = li.querySelector(".price-container").textContent.trim();
        const address = li.querySelector("address").textContent.trim();

        return {
          price,
          address,
        };
      });
    });

  } catch (error) {
    console.error("Error: <ul> or <li> elements not found or timeout reached.");
  }
  return results;
}

module.exports = {
  runWebScrapping,
};
