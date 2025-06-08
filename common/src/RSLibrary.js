import fs from 'fs/promises';
import os from 'os';
import RSTrack from './RSTrack.js';

class RSLibrary {
  constructor() {
    this.scan_paths = [
      os.homedir() + "/Music",
    ];

    this.tracks = [];
    this.artists = {};
    this.albums = {};
    this.tracks_by_hash = {};

    for(let path of this.scan_paths) {
      this.scan_directory(path);
    }

    console.log(`Scan_paths: ${this.scan_paths}`);
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
        const track = await RSTrack.from_file_path(file_path);
        this.add_track(track);
      }
    }
  }

  add_track(track) {
    if(this.tracks_by_hash[track.hash]) {
      console.warn(`Track ${track.artist} - ${track.title} found multiple times (${track.hash.substring(0, 8)})`);
      return;
    }
    this.tracks_by_hash[track.hash] = track;
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
