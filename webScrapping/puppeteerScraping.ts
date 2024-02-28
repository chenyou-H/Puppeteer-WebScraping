const puppeteer = require("puppeteer");

async function runWebScrapping(city) {
  // Launch the browser and open a new blank page
  // const browser = await puppeteer.launch();
  const browser = await puppeteer.launch({});
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

// find zillow
async function findZillowFrom(page) {
  let nextPageButtonFound = true;

  while (nextPageButtonFound) {
    const zillowLinkSelector = 'a[href*="www.zillow.com"]';
    const zillowLink = await page.$(zillowLinkSelector);

    if (zillowLink) {
      await zillowLink.click();
      // Wait for the Zillow page to load
      await page.waitForNavigation();
      break;
      await page.waitForSelector("h1");
      // Extract and print the title of the Zillow page
      const zillowTitle = await page.$eval(
        "h1",
        (element) => element.textContent
      );
      console.log(`Title of the Zillow page: ${zillowTitle}`);
      // await browser.close();
    } else {
      console.log(`Zillow is not found from current scope, scroll down`);
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
  const searchBoxSelector = "input[placeholder]";
  // await page.waitForSelector(searchBoxSelector);
  await page.type(searchBoxSelector, city);

  // Press Enter to perform the search
  await page.keyboard.press("Enter");
  await page.waitForNavigation();

  //skip the zillow question for rent or sale
  const buttonText = "Skip this question";

  // Use the text selector to find the button with the specified text
  const buttonSelector = `button ::-p-text("${buttonText}")`;
  // await page.waitForSelector(buttonSelector);

  // Click the button
  try {
    // Wait for the button to be present based on the text selector
    await page.waitForSelector(buttonSelector, { timeout: 5000 });

    // Click the button
    await page.click(buttonSelector);

    console.log(`Clicked the button with text: ${buttonText}`);
  } catch (error) {
    console.error(`Error: Button with text "${buttonText}" not found.`);
  }

  // const searchResultsSelector = "#grid-search-results > ul > li";
  // await page.waitForSelector(searchResultsSelector);
}
