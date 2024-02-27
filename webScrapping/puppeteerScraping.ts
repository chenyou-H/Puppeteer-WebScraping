const puppeteer = require("puppeteer");

async function runWebScrapping(city) {
  // Launch the browser and open a new blank page
  // const browser = await puppeteer.launch();
  const browser = await puppeteer.launch({ headless: false });
  const context = browser.defaultBrowserContext();
  // Get rid of location request and go to google home page
  await context.overridePermissions("https://www.google.com", ["geolocation"]);

  const page = await browser.newPage();

  try {
    // 1) Search for "top home listing websites"
    await googleSearch(page);

    // 2) Choose one of them, say Zillow
    await findZillowFrom(page);

    // 3) Look for homes in a city
    await searchCity(page, city);
  } catch (error) {
    console.error("An error occured:", error);
  } finally {
    await page.screenshot({ path: "googleSearch.png" });
    const currentURL = page.url();
    console.log(`Current URL: ${currentURL}`);
    await browser.close();
  }

  // console.log("Zillow not found on any page.");

  // await browser.close();
}

runWebScrapping("london");

// async function lookForHomesIn(page, city) {
//   let inputSelector = "input[placeholder]"; //locate search box

//   try {

// Function to keep scrolling until the next page button appears
async function scrollToNextPage(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      const distance = 1000; // Distance to scroll
      let totalHeight = 0;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 200); // Scroll every 200 milliseconds
    });
  });
}

// google search
async function googleSearch(page) {
  // Navigate the page to a URL
  await page.goto("https://www.google.com/");

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  //Type into search box
  const searchQuery = "top home listing websites";
  //locate google search box
  const textAreaSelector = 'textarea[aria-label="Search"]';
  await page.type(textAreaSelector, searchQuery);

  // Press Enter to perform the search
  await page.keyboard.press("Enter");
  // await page.waitForNavigation();
  await page.waitForNavigation();
}

// find zillow
async function findZillowFrom(page) {
  let zillowLink = "zillow.com";
  let nextPageButtonFound = true;

  while (nextPageButtonFound) {
    const zillowLinkSelector = 'a[href*="zillow.com"]';
    const zillowLink = await page.$(zillowLinkSelector);

    if (zillowLink) {
      await zillowLink.click();
      // Wait for the Zillow page to load
      await page.waitForSelector("h1");
      // Extract and print the title of the Zillow page
      const zillowTitle = await page.$eval(
        "h1",
        (element) => element.textContent
      );
      console.log(`Title of the Zillow page: ${zillowTitle}`);
      // await browser.close();
    } else {
      console.log(`Zillow is not found from current results, scroll down`);
      await scrollToNextPage(page);
    }
    // Scroll to trigger loading of more content

    // Check if the "Next" button is still present
    nextPageButtonFound = await page.evaluate(() => {
      const nextButton = document.querySelector('a[aria-label="More results"]');
      if (nextButton) {
        nextButton.click(); // Clicking to load next page
        console.log(`Zillow is not found from current page, go to next page`);
        return true;
      }
      return false;
    });
  }
}

async function searchCity(page, city) {
  await page.waitForNavigation();
  const searchBoxSelector = "input[placeholder]";
  // await page.waitForSelector(searchBoxSelector);
  await page.type(searchBoxSelector, city);
  // Press Enter to perform the search
  await page.keyboard.press("Enter");
}
