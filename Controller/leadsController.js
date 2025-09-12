const Leads = require("../Models/leadsModel");
const {sendEmailToCompany} = require("./emailverification");
const axios = require('axios');

const CreateLeads = async (req, res) => {
  const { name, lastname, email, phone, subject, query, 
    // captchaToken,
    budget } = req.body;
  const missingFields = [];

  // Validate required fields
  if (!name) missingFields.push({ name: "name", message: "Name field is required" });
  if (!lastname) missingFields.push({ name: "lastname", message: "LastName field is required" });
  if (!email) {
    missingFields.push({ name: "email", message: "Email field is required" });
  } else if (!email.includes("@")) {
    missingFields.push({ name: "email", message: "Email must contain @" });
  }
  if (!phone) {
    missingFields.push({ name: "phone", message: "Phone field is required" });
  } else if (phone.trim().length < 6) {
    missingFields.push({ name: "phone", message: "Phone is incomplete" });
  }
  if (!subject) missingFields.push({ name: "subject", message: "Subject field is required" });
  if (!query) missingFields.push({ name: "query", message: "Query field is required" });
  // if (!captchaToken) {
  //   missingFields.push({ name: "captchaToken", message: "Please fill Captcha" });
  // }
  if (subject?.toLowerCase() === "penetration testing" && !budget) {
    missingFields.push({ name: "budget", message: "Budget field is required for Penetration Testing" });
  }


  if (missingFields.length > 0) {
    return res.status(400).json({
      status: 400,
      message: "Some fields are missing!",
      missingFields,
    });
  }

  // // Verify reCAPTCHA token
  // try {
  //   const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  //   const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;

  //   const response = await axios.post(verificationURL);
  //   const { success } = response.data;

  //   if (!success) {
  //     return res.status(400).json({
  //       status: 400,
  //       message: "reCAPTCHA verification failed. Please try again.",
  //     });
  //   }
  // } catch (error) {
  //   console.error("reCAPTCHA verification error:", error);
  //   return res.status(500).json({
  //     status: 500,
  //     message: "Internal server error during CAPTCHA verification",
  //   });
  // }

  // Proceed with lead creation
  try {
    const LeadsCreated = await Leads.create({
      name,
      lastname,
      email,
      phone,
      subject,
      query,
      budget
    });

    sendEmailToCompany({ email, name, lastname, subject, phone, query ,budget}, res);

    if (!LeadsCreated) {
      return res.status(500).json({
        status: 500,
        message: "Internal server error",
      });
    }

    return res.status(201).json({
      status: 201,
      message: "Request Sent Successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};


const LeadsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalLeads = await Leads.countDocuments();

    const leads = await Leads.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    return res.status(200).json({
      status: 200,
      message: "Leads fetched successfully",
      leads:leads,
      totalLeads,
      totalPages: Math.ceil(totalLeads / limit),
      currentPage: page,
      limit:limit,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

const GetLeadById = async (req, res) => {
  try {
    const { id } = req.params; // Get lead ID from request parameters

    const lead = await Leads.findById(id);

    if (!lead) {
      return res.status(404).json({
        status: 404,
        message: "Lead not found",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Lead fetched successfully",
      lead,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

const DeleteLeads = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({status: 400, message: "Invalid request. Provide Lead IDs." });
    }

    // ✅ Check if leads exist before deleting
    const existingLeads = await Leads.find({ _id: { $in: ids } });

    if (existingLeads.length === 0) {
      return res.status(404).json({status: 400, message: "No leads found with the given IDs." });
    }

    // ✅ Delete leads
    await Leads.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      status: 200,
      message: "Leads deleted successfully.",
      deletedLeads: ids
    });

  } catch (error) {
    console.error("Error deleting leads:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


module.exports = {
  CreateLeads,
  LeadsList,
  GetLeadById,
  DeleteLeads
};
