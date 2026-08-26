require("dotenv").config();

const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const Datastore = require("@seald-io/nedb");

const app = express();
const port = Number(process.env.PORT) || 3000;
const databasePath = path.resolve(
  __dirname,
  process.env.DATABASE_PATH || "./data/contact-messages.db",
);

fs.mkdirSync(path.dirname(databasePath), { recursive: true });
const database = new Datastore({ filename: databasePath, autoload: true });

const insertContact = (contact) =>
  new Promise((resolve, reject) => {
    database.insert(contact, (error, document) => {
      if (error) reject(error);
      else resolve(document);
    });
  });

const updateContact = (id, changes) =>
  new Promise((resolve, reject) => {
    database.update({ _id: id }, { $set: changes }, {}, (error, count) => {
      if (error) reject(error);
      else resolve(count);
    });
  });

app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(express.static(__dirname));

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many messages. Please try again later." },
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE !== "false",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
const smtpConfigured = [
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASS",
  "CONTACT_EMAIL",
].every((key) => process.env[key]);

app.post("/api/contact", contactLimiter, async (req, res) => {
  const { name, email, subject = "Portfolio contact", message } = req.body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res
      .status(400)
      .json({ error: "Name, email, and message are required." });
  }

  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailIsValid) {
    return res
      .status(400)
      .json({ error: "Please provide a valid email address." });
  }

  const contact = {
    name: name.trim(),
    email: email.trim(),
    subject: subject.trim() || "Portfolio contact",
    message: message.trim(),
  };
  const savedContact = await insertContact({
    ...contact,
    deliveryStatus: "pending",
    deliveryError: null,
    createdAt: new Date().toISOString(),
  });

  if (!smtpConfigured) {
    await updateContact(savedContact._id, {
      deliveryStatus: "stored",
      deliveryError: "SMTP is not configured",
    });
    return res.status(200).json({
      message:
        "Message saved successfully. Email notifications are not configured.",
      emailSent: false,
    });
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL,
      replyTo: contact.email,
      subject: contact.subject,
      text: `Name: ${contact.name}\nEmail: ${contact.email}\n\n${contact.message}`,
    });

    await updateContact(savedContact._id, {
      deliveryStatus: "sent",
      deliveredAt: new Date().toISOString(),
    });
    res.status(200).json({ message: "Message sent successfully." });
  } catch (error) {
    await updateContact(savedContact._id, {
      deliveryStatus: "failed",
      deliveryError: error.message,
    });
    console.error("Contact email failed:", error.message);
    res.status(500).json({ error: "Unable to send your message right now." });
  }
});

app.listen(port, () => {
  console.log(`Portfolio server running at http://localhost:${port}`);
});
