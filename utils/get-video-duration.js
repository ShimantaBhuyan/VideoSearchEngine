export const getVideoDuration = (duration) => {
  if (duration == undefined) {
    return undefined;
  }
  const match = duration.match(/PT(\d+)M(\d+)S/);

  if (match) {
    const minutes = match[1];
    const seconds = match[2];
    const formattedDuration = `${minutes}:${seconds.padStart(2, "0")}`;
    return formattedDuration;
  } else {
    console.log("Invalid duration format");
    return undefined;
  }
};
