// backgroundImage from https://4kwallpapers.com/nature/green-landscape-20840.html
import backgroundImage from "./assets/background.jpg";
import youtube from "./assets/apps/youtube.png";
import youtubeBG from "./assets/apps/backgrounds/youtube_background.png";
import stremioBG from "./assets/apps/backgrounds/stremio_background.png";
import steamBG from "./assets/apps/backgrounds/steam_background.png";
import retroarchBG from "./assets/apps/backgrounds/retroarch_background.png";
import steam from "./assets/apps/steam.png";
import music from "./assets/apps/music.png";
import tv from "./assets/apps/tv.png";
import stremio from "./assets/apps/stremio.png";
import retroarch from "./assets/apps/retroarch.png";

const apps = [
  {
    name: "youtube",
    cliCommand: "flatpak run rocks.shy.VacuumTube --fullscreen",
    image: youtube,
    backgroundImage: youtubeBG,
  },
  {
    name: "stremio",
    cliCommand: "flatpak run com.stremio.Stremio",
    image: stremio,
    backgroundImage: stremioBG,
  },
  {
    name: "tv",
    cliCommand:
      "firefox --no-remote -P kiosk --kiosk https://www.vzy.one/en/free-live-tv-channels/list/366802?playlist_type=KTM&ratio=1x1&rail_card_size=NORMAL&page_size=30&meta_demographic=None&partner_cap_value=0&editorial_boost=%5B%7B%22position%22%3A1%2C%22id%22%3A%227712518%22%7D%5D",
    image: tv,
  },
  {
    name: "music",
    cliCommand: "gnome-music",
    image: music,
  },
  {
    name: "steam",
    cliCommand: "steam -gamepadui",
    image: steam,
    backgroundImage: steamBG,
  },
  {
    name: "retroarch",
    cliCommand: "flatpak run org.libretro.RetroArch",
    image: retroarch,
    backgroundImage: retroarchBG,
  },
];

export const config = {
  backgroundImage,
  apps,
  lockCommand: "loginctl lock-session",
  shutDownCommand: "lsof -ti:3000 | xargs kill -9",
};
