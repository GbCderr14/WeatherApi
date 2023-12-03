const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors=require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.post('/getWeather', async (req, res) => {
    try {
        const { cities } = req.body;
        console.log(req.body);

        if (!cities || !Array.isArray(cities)) {
            return res.status(400).json({ error: 'Invalid input. Please provide an array of cities.' });
        }

        const weatherData = await Promise.all(cities.map(async city => {
            try {
                const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=6e8bfe462e49a8161172ae48d9b28daf`);
                const temperature = response.data.main.temp;
                // Assuming the temperature is returned in Kelvin, convert it to Celsius
                const temperatureCelsius = Math.round(temperature - 273.15);
                return { [city]: `${temperatureCelsius} C` };
            } catch (error) {
                return { [city]: 'N/A' }; // Handle the case when weather data is not available
            }
        }));

        const result = { weather: {} };
        weatherData.forEach(data => Object.assign(result.weather, data));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
