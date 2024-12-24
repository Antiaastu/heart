const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

// MongoDB connection
const mongoURI =
  "mongodb+srv://ante:anteante@cluster0.7xpar.mongodb.net/heart?retryWrites=true&w=majority";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Mongoose schema and model
const heartRateSchema = new mongoose.Schema({
  bpm: Number,
  spo2: Number,
  timestamp: { type: Date, default: Date.now },
});

const HeartRate = mongoose.model("HeartRate", heartRateSchema);

// Routes
app.post('/api/heart_rate', async (req, res) => {
  try {
    const { bpm, spo2 } = req.body;

    const newHeartRate = new HeartRate({ bpm, spo2 });
    await newHeartRate.save();
    console.log('Heart rate data saved');
    
    res.status(200).json({ message: "Heart rate data saved" });
  } catch (error) {
    console.error('Error saving heart data:', error);
    res.status(500).json({ error: "Failed to save heart rate data" });
  }
});

app.get('/api/heart_rate', async (req, res) => {
  try {
    const latestData = await HeartRate.find().sort({ timestamp: -1 }).limit(1);
    res.status(200).json(latestData[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch heart rate data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
