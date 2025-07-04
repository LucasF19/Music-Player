const formatTime = (time: number) => {
  const min = Math.floor(time / 60);
  const sec = Math.floor(time % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
};

const parseTimeToSeconds = (timeStr: string): number => {
  const [min, sec] = timeStr.split(":");
  const [s, ms] = sec.split(".");
  return parseInt(min) * 60 + parseInt(s) + parseInt(ms) / 100;
};

export { formatTime, parseTimeToSeconds };