require("dotenv").config();

const express = require("express");
const mariadb = require("mariadb");
const cors = require("cors");

const app = express();
app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());

//Basic HTTPS/API Security
const helmet = require("helmet");

app.use(helmet());

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100
});

app.use("/api", limiter);

//Create db connection
const db = mariadb.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        ca: require("fs").readFileSync(process.env.DB_SSL_CA)
    },

    connectionLimit: 5,
    connectTimeout: 10000,
    acquireTimeout: 15000,

    timezone: "America/New_York"
});

//Return running message for trobuleshooting
app.get("/", (req, res) => {
    res.send("Fishing server is running");
});

//fetch rod info for diagram
app.get("/api/rods", async (req, res) => {
    let connection;

    try {
        connection = await db.getConnection();

        const rows = await connection.query(`
            SELECT
                rod_id,
                name,
                bait_id,
                color_id,
                weight_id,
                notes,
                x,
                y
            FROM rods
        `);

        res.json(rows);
    } catch (error) {
        console.error("Database error:", error);

        res.status(500).json({
            error: "Failed to get rods"
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

//Update rod position in edit mode
app.put("/api/rods/:id/position", async (req, res) => {
    let connection;

    try {
        const rodId = Number(req.params.id);
        const { x, y } = req.body;

        connection = await db.getConnection();

        await connection.query(
            `
            UPDATE rods
            SET x = ?, y = ?
            WHERE rod_id = ?
            `,
            [x, y, rodId]
        );

        res.json({
            success: true,
            rod_id: rodId,
            x: x,
            y: y
        });

    } catch (error) {
        console.error("Failed to update rod position:", error);

        res.status(500).json({
            error: "Failed to update rod position"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Add new rod
app.post("/api/rods", async (req, res) => {
    try {
        const {
            name = "New Rod",
            bait_id = null,
            color_id = null,
            weight_id = null,
            notes = null,
            x = 0,
            y = 0
        } = req.body;

        const result = await db.query(
            `
            INSERT INTO rods (
                name,
                bait_id,
                color_id,
                weight_id,
                notes,
                x,
                y
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                name,
                bait_id,
                color_id,
                weight_id,
                notes,
                x,
                y
            ]
        );

        res.status(201).json({
            rod_id: Number(result.insertId),
            name,
            bait_id,
            color_id,
            weight_id,
            notes,
            x,
            y
        });

    } catch (error) {
        console.error("Failed to add rod:", error);

        res.status(500).json({
            error: "Failed to add rod"
        });
    }
});

// Delete rod
app.delete("/api/rods/:id", async (req, res) => {
    try {
        const rodId = Number(req.params.id);

        if (!rodId) {
            return res.status(400).json({
                error: "Invalid rod ID"
            });
        }

        const result = await db.query(
            `
            DELETE FROM rods
            WHERE rod_id = ?
            `,
            [rodId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Rod not found"
            });
        }

        res.json({
            success: true,
            message: "Rod deleted successfully"
        });

    } catch (error) {
        console.error("Failed to delete rod:", error);

        res.status(500).json({
            error: "Failed to delete rod"
        });
    }
});

//get baits
app.get("/api/baits", async (req, res) => {
    let connection;

    try {
        connection = await db.getConnection();

        const rows = await connection.query(`
            SELECT bait_id, name
            FROM baits
            ORDER BY name
        `);

        res.json(rows);

    } catch (error) {
        console.error("Failed to get baits:", error);
        res.status(500).json({
            error: "Failed to get baits"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
});

//get colors
app.get("/api/colors", async (req, res) => {
    let connection;

    try {
        connection = await db.getConnection();

        const rows = await connection.query(`
            SELECT color_id, name
            FROM colors
            ORDER BY name
        `);

        res.json(rows);

    } catch (error) {
        console.error("Failed to get colors:", error);
        res.status(500).json({
            error: "Failed to get colors"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
});

//get weights
app.get("/api/weights", async (req, res) => {
    let connection;

    try {
        connection = await db.getConnection();

        const rows = await connection.query(`
            SELECT weight_id, name
            FROM weights
            ORDER BY name
        `);

        res.json(rows);

    } catch (error) {
        console.error("Failed to get weights:", error);
        res.status(500).json({
            error: "Failed to get weights"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
});

//get species
app.get("/api/species", async (req, res) => {
    try {
        const rows = await db.query(`
            SELECT species_id, name
            FROM species
            ORDER BY species_id
        `);

        console.log("Species rows:", rows);

        res.json(rows);

    } catch (error) {
        console.error("Species error:", error);

        res.status(500).json({
            error: "Failed to get species"
        });
    }
});

// Add bait
app.post("/api/baits", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                error: "Bait name is required"
            });
        }

        const result = await db.query(
            `
            INSERT INTO baits (name)
            VALUES (?)
            `,
            [name.trim()]
        );

        res.status(201).json({
            bait_id: Number(result.insertId),
            name: name.trim()
        });

    } catch (error) {
        console.error("Failed to add bait:", error);

        res.status(500).json({
            error: "Failed to add bait"
        });
    }
});

// Delete bait
app.delete("/api/baits/:id", async (req, res) => {
    try {
        const baitId = Number(req.params.id);

        if (!baitId) {
            return res.status(400).json({
                error: "Invalid bait ID"
            });
        }

        const result = await db.query(
            `
            DELETE FROM baits
            WHERE bait_id = ?
            `,
            [baitId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Bait not found"
            });
        }

        res.json({
            success: true,
            message: "Bait deleted successfully"
        });

    } catch (error) {
        console.error("Failed to delete bait:", error);

        res.status(500).json({
            error: "Failed to delete bait"
        });
    }
});

// Add color
app.post("/api/colors", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                error: "Color name is required"
            });
        }

        const result = await db.query(
            `
            INSERT INTO colors (name)
            VALUES (?)
            `,
            [name.trim()]
        );

        res.status(201).json({
            color_id: Number(result.insertId),
            name: name.trim()
        });

    } catch (error) {
        console.error("Failed to add color:", error);

        res.status(500).json({
            error: "Failed to add color"
        });
    }
});

// Delete color
app.delete("/api/colors/:id", async (req, res) => {
    try {
        const colorId = Number(req.params.id);

        if (!colorId) {
            return res.status(400).json({
                error: "Invalid color ID"
            });
        }

        const result = await db.query(
            `
            DELETE FROM colors
            WHERE color_id = ?
            `,
            [colorId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Color not found"
            });
        }

        res.json({
            success: true,
            message: "Color deleted successfully"
        });

    } catch (error) {
        console.error("Failed to delete color:", error);

        res.status(500).json({
            error: "Failed to delete color"
        });
    }
});

// Add weight
app.post("/api/weights", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                error: "Weight name is required"
            });
        }

        const result = await db.query(
            `
            INSERT INTO weights (name)
            VALUES (?)
            `,
            [name.trim()]
        );

        res.status(201).json({
            weight_id: Number(result.insertId),
            name: name.trim()
        });

    } catch (error) {
        console.error("Failed to add weight:", error);

        res.status(500).json({
            error: "Failed to add weight"
        });
    }
});

// Delete weight
app.delete("/api/weights/:id", async (req, res) => {
    try {
        const weightId = Number(req.params.id);

        if (!weightId) {
            return res.status(400).json({
                error: "Invalid weight ID"
            });
        }

        const result = await db.query(
            `
            DELETE FROM weights
            WHERE weight_id = ?
            `,
            [weightId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Weight not found"
            });
        }

        res.json({
            success: true,
            message: "Weight deleted successfully"
        });

    } catch (error) {
        console.error("Failed to delete weight:", error);

        res.status(500).json({
            error: "Failed to delete weight"
        });
    }
});

// Add species
app.post("/api/species", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                error: "Species name is required"
            });
        }

        const result = await db.query(
            `
            INSERT INTO species (name)
            VALUES (?)
            `,
            [name.trim()]
        );

        res.status(201).json({
            species_id: Number(result.insertId),
            name: name.trim()
        });

    } catch (error) {
        console.error("Failed to add species:", error);

        res.status(500).json({
            error: "Failed to add species"
        });
    }
});

// Delete species
app.delete("/api/species/:id", async (req, res) => {
    try {
        const speciesId = Number(req.params.id);

        if (!speciesId) {
            return res.status(400).json({
                error: "Invalid species ID"
            });
        }

        const result = await db.query(
            `
            DELETE FROM species
            WHERE species_id = ?
            `,
            [speciesId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Species not found"
            });
        }

        res.json({
            success: true,
            message: "Species deleted successfully"
        });

    } catch (error) {
        console.error("Failed to delete species:", error);

        res.status(500).json({
            error: "Failed to delete species"
        });
    }
});

//update rod info
app.put("/api/rods/:id", async (req, res) => {
    let connection;

    try {
        const rodId = req.params.id;

        const {
            name,
            bait_id,
            color_id,
            weight_id,
            notes
        } = req.body;

        connection = await db.getConnection();

        await connection.query(`
            UPDATE rods
            SET
                name = ?,
                bait_id = ?,
                color_id = ?,
                weight_id = ?,
                notes = ?
            WHERE rod_id = ?
        `, [
            name,
            bait_id,
            color_id,
            weight_id,
            notes,
            rodId
        ]);

        res.json({
            success: true
        });

    } catch (error) {
        console.error("Failed to update rod:", error);

        res.status(500).json({
            error: "Failed to update rod"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
});

//FISH ON!
app.post("/api/fish", async (req, res) => {
    try {
        const {
            rod_id,
            bait_id,
            color_id,
            weight_id,
            species_id,
            size,
            latitude,
            longitude
        } = req.body;

        if (!rod_id || !species_id || !size) {
            return res.status(400).json({
                error: "Rod, species, and length are required"
            });
        }

        const result = await db.query(`
            INSERT INTO fish (
                rod_id,
                bait_id,
                color_id,
                weight_id,
                species_id,
                fish_size,
                latitude,
                longitude
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,[
            rod_id,
            bait_id || null,
            color_id || null,
            weight_id || null,
            species_id,
            size,
            latitude,
            longitude
        ]);

        res.status(201).json({
            fish_id: Number(result.insertId),
            message: "Fish recorded successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to record fish"
        });
    }
});

//get all fish
//get all fish
app.get("/api/fish", async (req, res) => {
    try {
        const rows = await db.query(`
            SELECT
                f.fish_id,
                f.caught_at,

                f.species_id,
                s.name AS species,

                f.fish_size,
                f.latitude,
                f.longitude,

                f.rod_id,
                r.name AS rod_name,

                f.bait_id,
                b.name AS bait_name,

                f.color_id,
                c.name AS color_name,

                f.weight_id,
                w.name AS weight_name

            FROM fish f

            LEFT JOIN species s
                ON f.species_id = s.species_id

            LEFT JOIN rods r
                ON f.rod_id = r.rod_id

            LEFT JOIN baits b
                ON f.bait_id = b.bait_id

            LEFT JOIN colors c
                ON f.color_id = c.color_id

            LEFT JOIN weights w
                ON f.weight_id = w.weight_id

            ORDER BY f.caught_at DESC
        `);

        res.json(rows);

    } catch (error) {
        console.error("Error fetching fish:", error);

        res.status(500).json({
            error: "Failed to fetch fish"
        });
    }
});

// Delete fish
app.delete("/api/fish/:id", async (req, res) => {
    try {
        const fishId = Number(req.params.id);

        if (!fishId) {
            return res.status(400).json({
                error: "Invalid fish ID"
            });
        }

        const result = await db.query(
            `
            DELETE FROM fish
            WHERE fish_id = ?
            `,
            [fishId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Fish not found"
            });
        }

        res.json({
            success: true,
            message: "Fish deleted successfully"
        });

    } catch (error) {
        console.error("Failed to delete fish:", error);

        res.status(500).json({
            error: "Failed to delete fish"
        });
    }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});