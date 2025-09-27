import { useEffect, useState, useRef } from "react";
import ReactPlayer from "react-player/youtube";
import { Heart, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume1, Volume2 } from "lucide-react";
import { lyricsMusic } from "./assets/lyrics.js"
import { formatTime, parseTimeToSeconds } from "./utils/formatTime.js";
import { fetchSongDetails, getLyrics, searchSong } from "./services/albumInfo.js";
import { isDarkColor, lightenColor } from "./utils/colorContrast.js";

const personalized = {
  id: "9249219",
  title: "",
  color: "",
  albumName: "",
  artistName: "",
  customLyrics: false,
  showFilter: false,
  delay: 41,
  backgroundImage: "",
  isCustomVideo: false,
  customVideoUrl: "",
  videoStart: 0,
}

export default function App() {
  const [lyrics, setLyrics] = useState([] as any);
  const [musicDetails, setMusicDetails] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [detailsColor, setDetailsColor] = useState("#FFFFFF");
  const playerRef = useRef<any>(null);

  const fetchAlbumInfo = async (idSong?: string) => {
    try {
      const albumInfo = await fetchSongDetails(idSong ?? personalized.id);

      fetchLyrics(albumInfo.title, albumInfo.artist);
      setMusicDetails(albumInfo);
      setDetailsColor(personalized.color ? personalized.color : isDarkColor(albumInfo.primaryColor) ? lightenColor(albumInfo.primaryColor) : albumInfo.primaryColor);
    } catch (err) {
      console.error("Erro ao buscar letras:", err);
    }
  };

  const handleSearch = async (query: string) => {
    try {
      const res = await searchSong(query);
      setSearchResults(res.hits || []);
    } catch (error) {
      console.error("Erro ao buscar música:", error);
    }
  };

  const selectedSong = async (song: string) => {
    fetchAlbumInfo(song)
    setQuery("");
    setSearchResults([]);
  }

  const fetchLyrics = async (title: string, artist: string) => {
    const response = personalized.customLyrics ? lyricsMusic : await getLyrics(`${title} ${artist}`);

    const parsedLyrics = response.map((line: any) => ({
      ...line,
      time: parseTimeToSeconds(line.time) + personalized.delay,
    }));

    setLyrics(parsedLyrics);
  };

  const handleProgress = (state: any) => {
    setPlayedSeconds(state.playedSeconds);

    const current = state.playedSeconds;
    const index = lyrics.findIndex((line: any, i: number) => {
      const next = lyrics[i + 1];
      return current >= line.time && (!next || current < next.time);
    });

    if (index !== -1 && index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const handleChangeRange = (e: any) => {
    const value = parseFloat(e.target.value);
    setPlayedSeconds(value);
    playerRef.current?.seekTo(value, "seconds");
  };

  const handleSeek = (e: any) => {
    const time = parseFloat(e.target.value);
    playerRef.current?.seekTo(time, "seconds");
  };

  const lyricsRefs = useRef<any[]>([]);

  useEffect(() => {
    if (lyricsRefs.current[currentIndex]) {
      lyricsRefs.current[currentIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentIndex]);


  useEffect(() => {
    fetchAlbumInfo();
  }, []);

  return (
    <div className="relative h-[100vh] w-full flex items-center justify-center">
      <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${personalized.backgroundImage ? personalized.backgroundImage : musicDetails?.albumThumb}')` }} />

      <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-md" />
      {
        personalized.showFilter && (
          <div className="absolute z-50 w-[450px] bg-[#2b2b2b] rounded-[10px] left-0 top-0 m-6">
            <input
              type="text"
              value={query}
              id="search-input"
              onChange={(e) => {
                setQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              placeholder="Buscar música..."
              className="w-full px-6 py-2 rounded-lg text-white"
            />

            <div className="mt-2 w-[450px] overflow-hidden scroll-smooth max-h-[250px] overflow-y-auto bg-[#252525] rounded-[15px] shadow-lg absolute z-20">
              {searchResults.map((result: any) => {
                const song = result.result;
                return (
                  <div
                    key={song.id}
                    onClick={() => selectedSong(song.id)}
                    className="flex items-center gap-3 p-2 hover:bg-gray-200 cursor-pointer"
                  >
                    <img src={song.song_art_image_thumbnail_url} alt={song.title} className="w-10 h-10 rounded" />
                    <div className="text-sm">
                      <p className="font-bold">{song.title}</p>
                      <p className="text-gray-500">{song.primary_artist.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      }

      <div className="relative z-20 scale-[1.6]">
        <div className="w-[450px] backdrop-blur-md bg-[#171717d4] px-[25px] py-[22px] rounded-[20px]">
          <div className="flex justify-center items-center bg-[#6f6f6f]/15 rounded-[15px] py-1.5 mb-[15px] bg-opacity-[15%]">
            <span
              className={`h-[17px] font-bold text-sm text-shadow-[0px_0px_8px_#67a9ff59]`}
              style={{ color: detailsColor }}
            >
              {personalized.albumName ? personalized.albumName : musicDetails?.album?.name} • {musicDetails?.releaseDate.split(", ")[1]}
            </span>
          </div>

          <div className="relative overflow-hidden h-[450px] rounded-[15px]" style={{ boxShadow: `0px 0px 20px ${detailsColor}19` }}>

            <div className="bg-black w-full h-full z-10">
              <div className="absolute top-0 left-0 w-full h-full scale-[2.3] origin-center opacity-40">
                 <ReactPlayer
                    ref={playerRef}
                    url={musicDetails?.url}
                    playing={playing}
                    controls={false}
                    volume={volume}
                    progressInterval={100}
                    width="100%"
                    height="100%"
                    onProgress={handleProgress}
                    onDuration={(dur) => setDuration(dur)}
                    config={{
                      playerVars: {
                        autoplay: 0,
                        modestbranding: 0,
                        controls: 0,
                        rel: 0,
                      }
                    }}
                    className={personalized.isCustomVideo ? "hidden" : ""}
                  />

                  {
                    personalized.isCustomVideo && (
                      <ReactPlayer
                        playing={playing}
                        url={personalized.customVideoUrl}
                        muted={true}
                        width="100%"
                        height="100%"
                        config={{
                          playerVars: {
                            start: personalized.videoStart,
                          }
                        }}
                      />
                    )
                  }
              </div>
              <div className="absolute inset-0 z-10 backdrop-blur-[3px]" />
            </div>


            <div className="absolute inset-0 z-20 overflow-visible flex items-center justify-center">
              <div className="h-full w-full overflow-visible relative flex items-center justify-center">
                <div
                  className="transition-transform ease-in-out flex flex-col items-center gap-[3px] w-[310px]"
                >
                  {playedSeconds >= lyrics[0]?.time && [currentIndex - 1, currentIndex, currentIndex + 1].map((i, _) => {
                    const line = lyrics[i];

                    return (
                      <div
                        key={i}
                        className={`flex relative items-center justify-center text-center transition-all duration-600 text-[20px] ${i === currentIndex
                          ? "font-semibold text-white text-shadow-[0px_0px_10px_#fff] w-full wave-text"
                          : "text-[#808080bd] scale-[0.8] w-full max-h-[48px]"
                          }`}
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {line?.text || ""}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-between items-center mt-2">
            <div>
              <h3 className="w-[270px] text-[35px] text-white font-bold relative leading-[35px] truncate mt-3">{personalized.title ? personalized.title : musicDetails?.title?.split(" ").slice(0, 3).join(" ")}</h3>

              <div className="flex items-center relative">
                <p className={`text-[15px] font-semibold`} style={{ color: detailsColor }}>{personalized.artistName ? personalized.artistName : musicDetails?.artist}</p>
                <Heart className="h-[15px] ml-1" style={{ fill: detailsColor, color: detailsColor }} />
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex items-center gap-2 bg-[#6f6f6f]/15 rounded-full px-5 py-[5px]">
                <img className="w-[10px]" src="/icons/bluetooth.png" alt="bluetooth icon" />
                <span className="text-white font-thin text-[14px]">Bunns</span>
              </div>
            </div>
          </div>

          <div>
            <div className="mt-8 flex flex-col gap-3">
              <div>
                <input
                  type="range"
                  min={0}
                  max={duration}
                  value={playedSeconds}
                  onChange={(e) => handleChangeRange(e)}
                  onMouseUp={(e) => handleSeek(e)}
                  onTouchEnd={(e) => handleSeek(e)}
                  className="w-full inputRange"
                  style={{
                    background: `linear-gradient(to right, #d9d9d9 ${((playedSeconds / duration) * 100).toFixed(2)}%, #8D8D8D ${((playedSeconds / duration) * 100).toFixed(2)}%)`
                  }}
                />

                <div className="flex items-center justify-between w-full text-[#CFCFCF] text-[13px] font-bold">
                  <span>{formatTime(playedSeconds)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center gap-6 text-white text-xl">
                <button>
                  <Shuffle />
                </button>
                <button>
                  <SkipBack className="h-8 w-8 fill-white" />
                </button>
                <button onClick={() => setPlaying(!playing)} className="text-2xl cursor-pointer">
                  {playing ? <Pause className="h-12 w-12 fill-white" /> : <Play className="h-12 w-12 fill-white" />}
                </button>
                <button>
                  <SkipForward className="h-8 w-8 fill-white" />
                </button>
                <button>
                  <Repeat />
                </button>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <Volume1 className="h-5 w-5 fill-white mr-3" />

                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full inputRange"
                  style={{
                    background: `linear-gradient(to right, #d9d9d9 ${(volume * 100).toFixed(0)}%, #8D8D8D ${(volume * 100).toFixed(0)}%)`,
                  }}
                />

                <Volume2 className="h-5 w-5 fill-[#dddddd] ml-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}