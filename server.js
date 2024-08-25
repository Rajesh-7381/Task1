const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 8081;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: "1234",
    port:"3307",
    database: 'airport_db'
});


app.get('/api/airport', (req, res) => {
    const iataCode ='AGR'

    const query = `
        SELECT 
            a.id AS airport_id, a.icao_code, a.iata_code, a.name AS airport_name, 
            a.type, a.latitude_deg, a.longitude_deg, a.elevation_ft,
            c.id AS city_id, c.name AS city_name, c.country_id, c.is_active, 
            c.lat AS city_lat, c.long AS city_long,
            co.id AS country_id, co.name AS country_name, 
            co.country_code_two, co.country_code_three, co.mobile_code, co.continent_id
        FROM 
            airport a
        JOIN 
            city c ON a.city_id = c.id
        LEFT JOIN 
            country co ON c.country_id = co.id
        WHERE 
            a.iata_code = ?;
    `;

    db.query(query, [iataCode], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Airport not found' });
        }

        const result = results[0];

        const response = {
            airport: {
                id: result.airport_id,
                icao_code: result.icao_code,
                iata_code: result.iata_code,
                name: result.airport_name,
                type: result.type,
                latitude_deg: result.latitude_deg,
                longitude_deg: result.longitude_deg,
                elevation_ft: result.elevation_ft,
                address: {
                    city: {
                        id: result.city_id,
                        name: result.city_name,
                        country_id: result.country_id,
                        is_active: !!result.is_active,
                        lat: result.city_lat,
                        long: result.city_long
                    },
                    country: result.country_id ? {
                        id: result.country_id,
                        name: result.country_name,
                        country_code_two: result.country_code_two,
                        country_code_three: result.country_code_three,
                        mobile_code: result.mobile_code,
                        continent_id: result.continent_id
                    } : null
                }
            }
        };

        res.json(response);
    });
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
