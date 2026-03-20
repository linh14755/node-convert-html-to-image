const express = require("express");
const cors = require("cors"); // 1. Import thư viện
const app = express();
const fs = require("fs");
const path = require("path");
const satori = require("satori").default;
const { Resvg } = require("@resvg/resvg-js");

// 2. Cấu hình CORS
app.use(
  cors({
    origin: process.env.FE_URL
      ? [process.env.FE_URL, "http://localhost:3000"]
      : "http://localhost:3000", // Cho phép Frontend của bạn truy cập
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

const fontPath = path.join(__dirname, "fonts", "Roboto-Regular.ttf");
const fontData = fs.readFileSync(fontPath);

app.post("/generate-bill", async (req, res) => {
  try {
    const { name, amount, date, qrContent } = req.body;

    // 2. Định nghĩa Template bằng Object (Satori)
    const svg = await satori(
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "500px",
            height: "700px",
            backgroundColor: "#f9f9f9",
            padding: "40px",
            fontFamily: "Roboto",
            border: "2px solid #ddd",
            borderRadius: "20px",
          },
          children: [
            {
              type: "h2",
              props: {
                children: "XÁC NHẬN THANH TOÁN",
                style: { color: "#2c3e50", marginBottom: "30px" },
              },
            },
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  gap: "10px",
                },
                children: [
                  {
                    type: "div",
                    props: { children: `Học sinh: ${name || "N/A"}` },
                  },
                  {
                    type: "div",
                    props: {
                      children: `Số tiền: ${amount || "0"} VNĐ`,
                      style: { fontWeight: "bold", fontSize: "24px" },
                    },
                  },
                  {
                    type: "div",
                    props: { children: `Ngày: ${date || "Hôm nay"}` },
                  },
                ],
              },
            },
            // Chèn mã QR
            {
              type: "img",
              props: {
                src: "https://img.vietqr.io/image/970415-113366668888-compact.png",
                style: {
                  width: "180px",
                  height: "180px",
                  marginTop: "40px",
                  borderRadius: "10px",
                },
              },
            },
            {
              type: "div",
              props: {
                children: "Quét mã để kiểm tra",
                style: {
                  marginTop: "10px",
                  color: "#7f8c8d",
                  fontSize: "14px",
                },
              },
            },
          ],
        },
      },
      {
        width: 500,
        height: 700,
        fonts: [{ name: "Roboto", data: fontData, weight: 400 }],
      },
    );

    // 3. Render sang PNG
    const resvg = new Resvg(svg, { background: "white" });
    const pngBuffer = resvg.render().asPng();

    // 4. Trả về file ảnh
    res.setHeader("Content-Type", "image/png");
    res.send(pngBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Lỗi server: " + error.message);
  }
});

const PORT = process.env.PORT || 3232;
app.listen(PORT, "0.0.0.0", () => console.log(`Server chạy tại port ${PORT}`));
