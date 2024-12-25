const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB setup
mongoose.connect('mongodb+srv://ante:anteante@cluster0.7xpar.mongodb.net/heart?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB', err));

// Define the schema for the 'heartRate' collection
const heartRateSchema = new mongoose.Schema({
  bpm: Number,
  spo2: Number,
  timestamp: { type: Date, default: Date.now },
});

// Create the 'HeartRate' model based on the schema
const HeartRate = mongoose.model('HeartRate', heartRateSchema);

// API endpoint for receiving heart rate data
app.post('/api/heart_rate', async (req, res) => {
  const { bpm, spo2 } = req.body;

  if (bpm !== undefined && spo2 !== undefined) {
    try {
      // Save heart rate data to MongoDB
      const newHeartRate = new HeartRate({ bpm, spo2 });
      await newHeartRate.save();

      console.log('Heart rate data saved');
      res.status(200).json({ message: 'Heart rate data saved' });
    } catch (error) {
      console.error('Error saving heart data:', error);
      res.status(500).json({ error: 'Failed to save heart rate data' });
    }
  } else {
    res.status(400).json({ error: 'Invalid data, bpm and spo2 are required' });
  }
});

// Endpoint to fetch the latest heart rate data
app.get('/api/heart_rate', async (req, res) => {
  try {
    const latestData = await HeartRate.find().sort({ timestamp: -1 }).limit(1);
    res.status(200).json(latestData[0] || {});
  } catch (error) {
    console.error('Error fetching heart data:', error);
    res.status(500).json({ error: 'Failed to fetch heart rate data' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
