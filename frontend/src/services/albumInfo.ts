import axios from "axios";

export async function fetchSongDetails(idGenius: string) {
	try {
		const response = await axios.post("http://localhost:3001/api/album-details", { idGenius });
		return response.data;
	} catch (error) {
		console.error("Error fetching album details:", error);
		throw error;
	}
}

export async function searchSong(query: string) {
	try {
		const response = await axios.post("http://localhost:3001/api/search-song", { query });
		return response.data;
	} catch (error) {
		console.error("Error searching song:", error);
		throw error;
	}
}

export async function getLyrics(nameSong: string) {
	try {
		const response = await axios.get("http://localhost:3001/api/lyrics", { params: { nameSong } });
		return response.data;
	} catch (error) {
		console.error("Error fetching lyrics:", error);
		throw error;
	}
}
