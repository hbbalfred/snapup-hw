const puppeteer = require('puppeteer-core');

const PRODUCT_URL = "https://www.vmall.com/product/10086726905036.html";
const CHROME_EXEC = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

(async function main() {
  // function definition

  //
  const initBrowser = async () => {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: CHROME_EXEC,
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);


    return page;
  };

  //
  const checkPurchasable = async () => {
    const opt = {
      waitUntil: "domcontentloaded",
      timeout: 0,
    };

    if (opened) {
      await page.reload(opt);
    } else {
      await page.goto(PRODUCT_URL, opt);
      opened = true;
    }

    const ok = await page.$$eval(".product-buttonmain #pro-operation a", elems => {
      if (elems[1] && elems[1].className.indexOf("product-button02 disabled") !== -1) {
        return false;
      }
      // TODO:
      return true;
    });

    return ok;
  }

  //
  const purchase = async () => { };

  // main loop

  let opened = false;
  const page = await initBrowser();

  while (!(await checkPurchasable())) {
    await sleep(200);
  }

  await purchase();
})()


async function sleep(ms) {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}
