const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');
const cron = require('node-cron');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost/urlShortener');

// Set view engine and middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

// Serve static files for PWA
app.use(express.static('public'));

// Home route: Display all short URLs
app.get('/', async (req, res) => {
    const shortUrls = await ShortUrl.find();
    res.render('index', { shortUrls: shortUrls, request: req }); // <-- request added here
});

// Create a short URL
app.post('/shortUrls', async (req, res) => {
    await ShortUrl.create({ full: req.body.fullUrl });
    res.redirect('/');
});

// Delete a short URL by ID
app.post('/shortUrls/:id/delete', async (req, res) => {
    try {
        await ShortUrl.findByIdAndDelete(req.params.id);
    } catch (err) {
        console.error('Error deleting short URL:', err);
    }
    res.redirect('/');
});

// Redirect to the full URL
app.get('/:shortUrl', async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
    if (shortUrl == null) return res.sendStatus(404);

    shortUrl.clicks++;
    shortUrl.lastAccessed = new Date(); // Update last accessed timestamp
    await shortUrl.save();

    res.redirect(shortUrl.full);
});

// Scheduled job to delete unused URLs
cron.schedule('0 0 * * *', async () => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        await ShortUrl.deleteMany({ lastAccessed: { $lt: sevenDaysAgo } });
        console.log('✅ Deleted URLs not accessed in the past 7 days');
    } catch (error) {
        console.error('❌ Error during scheduled URL deletion:', error);
    }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
