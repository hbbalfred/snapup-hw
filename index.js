const puppeteer = require("puppeteer-core");

const PRODUCT_URL = "https://www.vmall.com/product/10086726905036.html";
const CHROME_EXEC = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

(async function main() {
  // ::: function definition

  //
  const initBrowser = async () => {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: CHROME_EXEC,
      userDataDir: "./udata",
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    page.on("console", (msg) => {
      if (msg.type() === "log") {
        console.log("[Console]", msg.text());
      }
    });

    return page;
  };

  //
  const login = async () => {
    console.log(page.url());

    const login = await page.$eval("#login_status", el => el.style.display);
    if (login) {
      console.log("Login...");

    } else {
      console.log("Not login");
    }
    return !!login;
  };

  //
  const snapup = async () => {
    await page.reload(openPageOptions);
    console.log("Reload page to snap up....")
    console.log(page.url());
    console.log(PRODUCT_URL);
    
    const ok = await page.$$eval(".product-buttonmain #pro-operation a", elems => {
      if (elems[1]) {
        if (elems[1].className.indexOf("product-button02 disabled") !== -1) {
          return false;
        }
        if (elems[1].innerHTML.indexOf("立即申购") !== -1) {
          return true;
        }
      }
      return false;
    });

    if (ok) {
      const btns = await page.$$(".product-buttonmain #pro-operation a");
      await btns[1].click();
    }

    return ok;
  }

  //
  const inqueue = async () => {
    const ok = page.url().indexOf(PRODUCT_URL) !== -1;
    console.log("In queue...");
    return ok;
  };

  //
  const purchase = async () => {
    console.log("Purchase...");
    const btn = await page.$$("#checkoutSubmit");
    await btn.click();
  };

  // ::: main loop
  const openPageOptions = {
    waitUntil: "domcontentloaded",
    timeout: 0,
  };

  const page = await initBrowser();
  await page.goto(PRODUCT_URL, openPageOptions);

  await loop(login, 5000);
  await loop(snapup, 1000);
  await loop(inqueue, 100);
  await loop(purchase, 100);

  console.log("Congratulation!");
})()

async function loop(fn, interval) {
  while (true) {
    try {
      const ok = await fn();
      if (ok) {
        return;
      }
    } catch (ex) { }
    await sleep(interval);
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}
