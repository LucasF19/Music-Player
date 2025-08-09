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

app.get("/api/lyrics", async (req, res) => {
  const { nameSong } = req.query;

  try {
    const lyrics = await fetchLrcLyrics(nameSong);
    res.json(lyrics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar letra sincronizada." });
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

async function fetchLrcLyrics(nameSong) {
  const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(nameSong)}&timestamp=true`;
  const searchRes = await axios.get(searchUrl);

  const firstMatch = searchRes.data[0];
  if (!firstMatch?.syncedLyrics) {
    throw new Error("Letra sincronizada não encontrada.");
  }

  return parseLRC(firstMatch.syncedLyrics);
}

function parseLRC(lrcText) {
  const lines = lrcText.split("\n");
  const result = [];

  for (const line of lines) {
    const match = line.match(/\[(\d{2}:\d{2}\.\d{2})\](.*)/);
    if (match) {
      result.push({
        time: match[1],
        text: match[2].trim(),
      });
    }
  }

  return result;
}

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));