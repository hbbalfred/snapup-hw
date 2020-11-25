const puppeteer = require("puppeteer-core");

const PRODUCT_URL = "https://www.vmall.com/product/10086375798519.html";
const CHROME_EXEC = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SNAPUP_TIME = "10:08:00";
const SORRY_URL = "https://sale.vmall.com/rush";

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
  const ready = async () => {
    const [ h, m, s ] = SNAPUP_TIME.split(":").map(e => parseInt(e, 10));
    const countdown = new Date().setHours(h, m, s);
    const now = Date.now();
    if (countdown < now) {
      console.log("It's over");
      return false;
    }

    const readyTime = 5000;
    const df = countdown - Date.now();

    if (df > readyTime) {
      console.log("Ready...", (df / 1000).toFixed(3), "seconds");
      return false;
    }
    
    await page.reload(openPageOptions);
    console.log("FOR THE HORDE!!!!");
    return true;
  }

  //
  const snapup = async () => {
    console.log("Reload page to snap up....")
    console.log(page.url());
    console.log(PRODUCT_URL);
    
    const ok = await page.$$eval(".product-buttonmain #pro-operation a", elems => {
      if (elems[0]) {
        if (elems[0].className.indexOf("product-button02 disabled") !== -1) {
          return false;
        }
        if (elems[0].innerHTML.indexOf("立即申购") !== -1) {
          return true;
        }
      }
      return false;
    });

    if (ok) {
      const btns = await page.$$(".product-buttonmain #pro-operation a");
      await btns[0].click();
    }

    return ok;
  }

  //
  const inqueue = async () => {
    // FIXME:
    if (page.url().indexOf(PRODUCT_URL) !== -1) {
      if (page.url().indexOf(SORRY_URL) !== -1) {
        const btn = await page.$(".box-ct #boxButton a");
        await btn.click();
        await loop(snapup, 0);
        return false;
      }
    }
    // TODO:
    return false;
  };

  //
  const purchase = async () => {
    console.log("Purchase...");
    const btn = await page.$$("#checkoutSubmit");
    await btn.click();
    return true;
  };

  // ::: main loop
  const openPageOptions = {
    waitUntil: "domcontentloaded",
    timeout: 0,
  };

  const page = await initBrowser();
  await page.goto(PRODUCT_URL, openPageOptions);

  await loop(login, 5000);
  await loop(ready, 1000);
  await loop(snapup, 1);
  await loop(inqueue, 1);
  await loop(purchase, 1);

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
  if (ms < 100) {
    return new Promise((resolve) => resolve());
  } else {
    return new Promise((resolve) => setTimeout(() => resolve(), ms));
  }
}
