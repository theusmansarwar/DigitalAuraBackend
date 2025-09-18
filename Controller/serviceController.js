
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Services = require("../Models/serviceModel");
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Multer Upload Middleware
const upload = multer({ storage: storage, fileFilter: fileFilter });


const createservice = async (req, res) => {
  try {
    const {
      title,
      description,
      short_description,
      metaDescription,
      slug,
      detail,
      published,
    } = req.body;

    const missingFields = [];
    const isPublished = published === "true" || published === true;

    // ✅ Validate required fields only if published
    if (isPublished) {
      if (!title) missingFields.push({ name: "title", message: "Title is required" });
      if (!description) missingFields.push({ name: "description", message: "Description is required" });
      if (!short_description) missingFields.push({ name: "short_description", message: "Short description is required" });
      if (!metaDescription) missingFields.push({ name: "metaDescription", message: "Meta description is required" });
      if (!slug) missingFields.push({ name: "slug", message: "Slug is required" });
      if (!detail) missingFields.push({ name: "detail", message: "Detail is required" });
    }

    // ✅ If any required fields are missing, stop
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }

    // ✅ Check duplicate title & slug
    const [existingTitle, existingSlug] = await Promise.all([
      title ? Services.findOne({ title }) : null,
      slug ? Services.findOne({ slug }) : null,
    ]);

    if (existingTitle) {
      missingFields.push({ name: "title", message: "Service title already exists" });
    }
    if (existingSlug) {
      missingFields.push({ name: "slug", message: "Service slug already exists" });
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed!",
        missingFields,
      });
    }

    // ✅ Create new service
    const newService = await Services.create({
      title,
      description,
      short_description,
      metaDescription,
      slug,
      detail,
      published: isPublished,
    });

    res.status(201).json({
      status: 201,
      message: "Service created successfully",
      service: newService,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = { createservice };

const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      short_description,
      metaDescription,
      slug,
      detail,
      published,
      faqs,
      how_we_delivered,
      portfolio,
      video,
    } = req.body;

    const missingFields = [];
    const isPublished = published === "true" || published === true;

    // 🔍 Validation for top-level publish
    if (isPublished) {
      if (!title) missingFields.push({ name: "title", message: "Title is required" });
      if (!description) missingFields.push({ name: "description", message: "Description is required" });
      if (!metaDescription) missingFields.push({ name: "metaDescription", message: "Meta description is required" });
      if (!slug) missingFields.push({ name: "slug", message: "Slug is required" });
    }

    // 🔍 Validation for FAQs section
    if (faqs && (faqs.published === "true" || faqs.published === true)) {
      if (!faqs.title) missingFields.push({ name: "faqs.title", message: "FAQs title is required" });
      if (!faqs.description) missingFields.push({ name: "faqs.description", message: "FAQs description is required" });
    }

    // 🔍 Validation for How We Delivered section
    if (how_we_delivered && (how_we_delivered.published === "true" || how_we_delivered.published === true)) {
      if (!how_we_delivered.description) missingFields.push({ name: "how_we_delivered.description", message: "Description is required" });
      if (!how_we_delivered.image) missingFields.push({ name: "how_we_delivered.image", message: "Image is required" });
    }

    // 🔍 Validation for Video section
    if (video && (video.published === "true" || video.published === true)) {
      if (!video.description) missingFields.push({ name: "video.description", message: "Video description is required" });
      if (!video.url) missingFields.push({ name: "video.url", message: "Video URL is required" });
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }

    // ✅ Prepare update fields
    const updateFields = {
      title,
      description,
      short_description,
      metaDescription,
      slug,
      detail,
      published: isPublished,
    };

    if (faqs) {
      updateFields.faqs = {
        title: faqs.title,
        description: faqs.description,
        published: faqs.published === "true" || faqs.published === true,
      };
    }

    if (how_we_delivered) {
      updateFields.how_we_delivered = {
        description: how_we_delivered.description,
        image: how_we_delivered.image,
        published: how_we_delivered.published === "true" || how_we_delivered.published === true,
      };
    }

    if (portfolio) {
      updateFields.portfolio = {
        items: portfolio.items || [],
        published: portfolio.published === "true" || portfolio.published === true,
      };
    }

    if (video) {
      updateFields.video = {
        description: video.description,
        url: video.url,
        published: video.published === "true" || video.published === true,
      };
    }

    // 🔄 Update in DB
    const updatedService = await Services.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({
      status: 200,
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = { updateService };


const listserviceAdmin = async (req, res) => {
  try {
    const { title } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let filter = {};
    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    const servicesList = await Services.find(filter)
      .select("title short_description published createdAt") // ✅ Only required fields
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalServices = await Services.countDocuments(filter);

    return res.status(200).json({
      totalServices,
      totalPages: Math.ceil(totalServices / limit),
      currentPage: page,
      limit,
      services: servicesList,
    });
  } catch (error) {
    console.error("Error fetching services (Admin):", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const listservice = async (req, res) => {
  try {
    const { title } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let filter = { published: true }; // ✅ Only published services
    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    const servicesList = await Services.find(filter)
      .select("title short_description createdAt") // ✅ Keep published too if you want to show status
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalServices = await Services.countDocuments(filter);

    return res.status(200).json({
      totalServices,
      totalPages: Math.ceil(totalServices / limit),
      currentPage: page,
      limit,
      services: servicesList,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};





const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Services.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({
      status: 200,
      message: "Service fetched successfully",
      service,
    });
  } catch (error) {
    console.error("Error fetching service by ID:", error);
    res.status(500).json({ error: error.message });
  }
};
const getServiceBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const service = await Services.findOne({ slug, published: true })
      // .populate("faqs.items", "question answer")        // populate faq items
      // .populate("portfolio.items", "title description image url") // populate portfolio items
      .exec();

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({
      status: 200,
      message: "Service fetched successfully",
      service,
    });
  } catch (error) {
    console.error("Error fetching service by slug:", error);
    res.status(500).json({ error: error.message });
  }
};



const deleteAllservices = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid request. Provide ServiceCategory IDs." });
    }
 
   

    

    await Services.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      status: 200,
      message: "Categories Delete successfully.",
   
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const getservicesSlugs = async (req, res) => {
  try {
    const serviceslist = await Services.find({ published: true })
      .select("slug _id title")
      .sort({ publishedDate: -1 });

    const totalServices = await Services.countDocuments({ published: true });

    res.status(200).json({
      totalServices,
      slugs: serviceslist,
    });
  } catch (error) {
    console.error("Error fetching blog slugs:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};



module.exports = {
  createservice,
    updateService: [upload.single("image"), updateService],

  listserviceAdmin,getServiceById,deleteAllservices,getServiceBySlug,getservicesSlugs,listservice
};
