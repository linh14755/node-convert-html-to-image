const express = require("express");
const cors = require("cors"); // 1. Import thư viện
const app = express();

// 2. Cấu hình CORS
app.use(
  cors({
    origin: [process.env.FE_URL ?? "http://localhost:3000"], // Cho phép Frontend của bạn truy cập
    methods: ["GET", "POST"], // Các phương thức được phép
    allowedHeaders: ["Content-Type"], // Các Header được phép
  }),
);

// Tăng limit để nhận ảnh base64
app.use(express.json({ limit: "10mb" }));

app.post("/process-image", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).send("No image data");

    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    // Trả về file ảnh
    res.setHeader("Content-Type", "image/png");
    res.send(imageBuffer);
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

const PORT = process.env.PORT || 3232;
app.listen(PORT, "0.0.0.0", () => console.log(`Server chạy tại port ${PORT}`));
