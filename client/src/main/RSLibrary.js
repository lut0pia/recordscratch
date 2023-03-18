const fs = require('fs/promises');
const common = require('recordscratch-common');

class RSLibrary {
  constructor() {
    this.scan_paths = [
      process.env.HOME + "/Music",
    ];


    this.tracks = [];
    this.artists = {};
    this.albums = {};

    for(let path of this.scan_paths) {
      this.scan_directory(path);
    }
  }

  async scan_directory(dir_path) {
    let files;
    try {
      files = await fs.readdir(dir_path);
    } catch(e) {
      return;
    }

    for(let file of files) {
      const file_path = `${dir_path}/${file}`;
      const file_stat = await fs.stat(file_path);
      if(file_stat.isDirectory()) {
        await this.scan_directory(file_path);
      } else if(file.match(/\.(mp3|m4a|ogg)$/i) && !this.tracks.find(t => t.file_path == file_path)) {
        const track = await common.RSTrack.from_file_path(file_path);
        this.add_track(track);
      }
    }
  }

  add_track(track) {
    this.tracks.push(track);
    const artist = this.artists[track.artist] = this.artists[track.artist] || {
      albums: {},
    };
    artist.name = track.artist;
    const album = artist.albums[track.album] = artist.albums[track.album] || {
      tracks: [],
    };
    album.name = track.album;
    album.tracks.push(track);
  }
};

export default RSLibrary;
