const express = require("express");
const cors = require("cors"); // 1. Import thư viện
const app = express();
const fs = require("fs");
const path = require("path");
const satori = require("satori").default;
const { Resvg } = require("@resvg/resvg-js");

const EMPTY_STRING = "-";
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

// Load fonts
const fontRegular = fs.readFileSync(
  path.join(__dirname, "fonts", "Roboto-Regular.ttf"),
);
const fontBold = fs.readFileSync(
  path.join(__dirname, "fonts", "Roboto-Bold.ttf"),
);

app.post("/api/generate-receipt", async (req, res) => {
  try {
    const {
      from,
      to,
      studentName,
      classTypeLabel,
      tutionNumber,
      totalAttendance,
      totalMoney,
      attendanceDates,
      bankName,
      bankAccountNumber,
    } = req.body;

    // Chuyển đổi dữ liệu ngày: Đảm bảo là mảng
    const datesArray = Array.isArray(attendanceDates) ? attendanceDates : [];

    const svg = await satori(
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            flexDirection: "column",
            width: "375px", // Fix chiều rộng chuẩn mobile
            backgroundColor: "#fff",
            fontFamily: "Roboto",
            // KHÔNG set height ở đây để nó tự giãn
          },
          children: [
            // Header
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  backgroundColor: "#4db6ac",
                  padding: "15px",
                  color: "#fff",
                },
                children: [
                  {
                    type: "div",
                    props: {
                      children: "LỚP TOÁN CÔ HẢO",
                      style: { fontSize: "13px", fontWeight: "bold" },
                    },
                  },
                  {
                    type: "div",
                    props: {
                      children: "PHIẾU HỌC PHÍ",
                      style: {
                        fontSize: "24px",
                        fontWeight: "bold",
                        margin: "4px 0",
                      },
                    },
                  },
                  {
                    type: "div",
                    props: {
                      children: `${from ?? "?"} - ${to ?? "?"}`,
                      style: { fontSize: "12px" },
                    },
                  },
                ],
              },
            },
            // Info Section
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  padding: "16px",
                  gap: "10px",
                },
                children: [
                  renderRow("Học sinh", studentName || EMPTY_STRING, true),
                  renderRow(
                    `Học phí / ${classTypeLabel}`,
                    tutionNumber || EMPTY_STRING,
                  ),
                  renderRow(
                    "Số buổi học",
                    `${totalAttendance || EMPTY_STRING} buổi`,
                  ),
                  {
                    type: "div",
                    props: {
                      style: {
                        borderBottom: "1px dashed #ddd",
                        marginTop: "4px",
                      },
                    },
                  },
                ],
              },
            },
            // Total Box
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  margin: "0 16px",
                  padding: "12px",
                  backgroundColor: "#f0f9f8",
                  borderRadius: "12px",
                  border: "1px solid #b2dfdb",
                },
                children: [
                  {
                    type: "div",
                    props: {
                      children: "TỔNG HỌC PHÍ",
                      style: { color: "#757575", fontSize: "13px" },
                    },
                  },
                  {
                    type: "div",
                    props: {
                      children: totalMoney || EMPTY_STRING,
                      style: {
                        color: "#00796b",
                        fontSize: "28px",
                        fontWeight: "bold",
                      },
                    },
                  },
                ],
              },
            },
            // Study Dates Section
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginTop: "12px",
                  padding: "0 16px",
                },
                children: [
                  {
                    type: "div",
                    props: {
                      children: "NGÀY ĐI HỌC",
                      style: {
                        color: "#9e9e9e",
                        fontSize: "11px",
                        marginBottom: "6px",
                      },
                    },
                  },
                  {
                    type: "div",
                    props: {
                      style: {
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: "6px",
                      },
                      children: datesArray.map((date) => ({
                        type: "div",
                        props: {
                          style: {
                            backgroundColor: "#e0f2f1",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            color: "#00796b",
                            fontSize: "12px",
                          },
                          children: date,
                        },
                      })),
                    },
                  },
                ],
              },
            },
            // QR Section
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  margin: "16px",
                  padding: "12px",
                  border: "1px solid #eee",
                  borderRadius: "10px",
                },
                children: [
                  {
                    type: "img",
                    props: {
                      src: `https://img.vietqr.io/image/${bankName}-${bankAccountNumber}-print.png`,
                      style: { width: "240px", height: "310" },
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        width: 375, // Chiều rộng fix 375px
        // KHÔNG set height ở đây để tự động giãn theo nội dung
        fonts: [
          { name: "Roboto", data: fontRegular, weight: 400 },
          { name: "Roboto", data: fontBold, weight: 700 },
        ],
      },
    );

    const resvg = new Resvg(svg, { background: "white" });
    res.setHeader("Content-Type", "image/png");
    res.send(resvg.render().asPng());
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Helper function để vẽ dòng thông tin
function renderRow(label, value, isBold = false) {
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
        fontSize: "15px",
      },
      children: [
        {
          type: "div",
          props: { children: label, style: { color: "#616161" } },
        },
        {
          type: "div",
          props: {
            children: value,
            style: {
              fontWeight: isBold ? "bold" : "normal",
              color: "#212121",
              fontSize: isBold ? "18px" : "15px",
            },
          },
        },
      ],
    },
  };
}

const PORT = process.env.PORT || 3232;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`),
);
