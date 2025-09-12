const NewsLetter  = require("../Models/newsletterModel");

const addEmail = async (req, res) => {
  try {
    let { email } = req.body;

   

    if (!email) {
      return res.status(400).json({
        status: 400,
        message: "Email is required",
       
      });
    }
    else if (!email.includes("@")) {
   return res.status(400).json({
        status: 400,
        message: "Email must contain @",
       
      });
  }

    email = email.trim().toLowerCase();

   
    const alreadySubscribed = await NewsLetter.findOne({ email });
    if (alreadySubscribed) {
      return res.status(409).json({
        status: 409,
        message: "This email is already subscribed.",
      });
    }

    const newsletter = new NewsLetter({ email });
    await newsletter.save();

    return res.status(201).json({
      status: 201,
      message: "Subscribed Successfully",
      newsletter,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Failed to Subscribe",
      error: error.message,
    });
  }
};

module.exports = { addEmail };
