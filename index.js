const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.post("/api/render-html", async (req, res) => {
  let browser;
  try {
    const { html } = req.body;
    browser = await puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // Cực kỳ quan trọng để tiết kiệm RAM
        "--single-process", // Chạy trong 1 tiến trình để giảm tốn tài nguyên
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 800 });
    await page.setContent(html, { waitUntil: "networkidle0" });

    const element = await page.$("body > *");
    const imageBuffer = await element.screenshot({ type: "png" });

    await browser.close();
    res.set("Content-Type", "image/png");
    res.send(imageBuffer);
  } catch (error) {
    if (browser) await browser.close();
    res.status(500).send(error.message);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
