
require("dotenv").config();
const cors = require("cors");
const express = require("express");
const path = require("path");
const connectDB = require("./utils/db");

const app = express();
const port = process.env.PORT || 4000;
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5176",
  "http://localhost:3001",
  "https://aurafrontend.ztesting.site",
  "https://digitalaura.se",
  "https://auraadmin.ztesting.site",
  "https://admin.digitalaura.se"
 
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed for this origin: " + origin));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
};


app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

app.use(express.json());
const userRouter = require("./Routes/userRoutes");
const blogRouter = require("./Routes/blogRoutes");
const commentRouter = require("./Routes/commentRoutes");
const categoryRouter = require("./Routes/categoryRoutes");
const UsertypeRouter = require("./Routes/typeRoutes");
const testimonialRouter = require("./Routes/testimonialRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const viewsRouter = require("./Routes/viewsRoutes");
const applicationRoutes = require("./Routes/applicationRoutes");
const newsletterRoutes = require("./Routes/newsletterRoutes");

app.use("/", userRouter);
app.use("/admin", adminRoutes);
app.use("/blog", blogRouter);
app.use("/comment", commentRouter);
app.use("/category", categoryRouter);
app.use("/usertype", UsertypeRouter);
app.use("/testimonial", testimonialRouter);
app.use("/views", viewsRouter);
app.use("/applications", applicationRoutes);
app.use("/newsletter", newsletterRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const multer = require("multer");
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// after all routes
app.use((err, req, res, next) => {
  console.error("Error middleware caught:", err);

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      status: 413,
      message: "File too large! Please upload smaller files.",
    });
  }

  // Body size exceeded (express / nginx)
  if (err.status === 413) {
    return res.status(413).json({
      status: 413,
      message: "Request entity too large! Please reduce file size or request payload.",
    });
  }

  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || "Internal Server Error",
  });
});

app.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const fileUrl = `https://digitalaura.se/backend/api/uploads/${req.file.filename}`;
  res.json({
    files: [fileUrl],
    isSuccess: true,
    messages: ["Image uploaded successfully"],
  });
});

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server is running on Port: ${port}`);
  });
});
