require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/album-details", async (req, res) => {
  const { idGenius } = req.body;

  try {
    const albumInfo = await fetchGeniusApi(idGenius);

    res.json(albumInfo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch lyrics or translate." });
  }
});

app.post("/api/search-song", async (req, res) => {
  const { query } = req.body;

  try {
    const searchResult = await searchSong(query);
    res.json(searchResult);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to search song." });
  }
});


async function fetchGeniusApi(query) {
  const headers = {
    Authorization: `Bearer ${process.env.GENIUS_API_TOKEN}`,
  };

  const details = await axios.get(
    `https://api.genius.com/songs/${query}`,
    { headers }
  );

  return {
    title: details.data.response.song.title,
    artist: details.data.response.song.primary_artist.name,
    albumThumb: details.data.response.song.song_art_image_url ?? "Unknown Album",
    album: details.data.response.song.album ?? "Unknown Album",
    url: details.data.response.song.media.find(item => item.provider === "youtube")?.url ?? "https://www.youtube.com/watch?v=Unknown",
    releaseDate: details.data.response.song.release_date_for_display ?? "Unknown Release Date",
    primaryColor: details.data.response.song.song_art_primary_color ?? "#FFFFFF",
    secondaryColor: details.data.response.song.song_art_secondary_color ?? "#FFFFFF",
  };
}

async function searchSong(query) {
  const headers = {
    Authorization: `Bearer ${process.env.GENIUS_API_TOKEN}`,
  };

  const searchDetails = await axios.get(
    `https://api.genius.com/search?q=${query}`,
    { headers }
  );

  return searchDetails.data?.response;
}

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));