import fs from './RSFileSystem.js';
import os from 'os';
import RSTrack from './RSTrack.js';

export default class RSLibrary {
  constructor() {
    this.scan_paths = [
      os.homedir() + "/Music",
    ];

    this.tracks = [];
    this.artists = {};
    this.albums = {};
    this.tracks_by_hash = {};
    this.tracks_by_path = {};
    
    if(!fs.is_fake) {
      console.log(`Scan paths: ${this.scan_paths}`);
      this.scan_library();
    }
  }

  save_to_file() {
    if(this.should_save) {
      fs.writeFile('.library.json', JSON.stringify(this.tracks))
      console.log(`Wrote ${this.tracks.length} tracks to disk`);
      this.should_save = false;
    }
  }

  async load_from_file() {
    let saved_tracks = [];
    try {
      saved_tracks = JSON.parse(await fs.readFile('.library.json'));
      console.log(`Read ${saved_tracks.length} tracks from disk`);
    } catch(e) {
      console.log(`Couldn't read library from disk`);
      return;
    }

    for(let saved_track of saved_tracks) {
      this.add_track(saved_track);
    }
  }

  async scan_library() {
    while(true) {
      for(let path of this.scan_paths) {
        await this.scan_directory(path);
      }
      await this.prune_library();
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
      try {
        const file_stat = await fs.stat(file_path);
        if(file_stat.isDirectory()) {
          await this.scan_directory(file_path);
        } else if(file.match(/\.(mp3|m4a|ogg|flac)$/i) && !this.tracks_by_path[file_path]) {
          const track = await RSTrack.from_file_path(file_path);
          this.add_track(track);
        }
      } catch(e) {
        console.log(`Error reading path ${file_path}: ${e}`);
      }
    }
  }

  async prune_library() {
    for(let track of this.tracks) {
      try {
        await fs.access(track.file_path);
      } catch(e) {
        this.remove_track(track);
      }
    }
  }

  add_track(track) {
    if(this.tracks_by_path[track.file_path]) {
      return;
    }
    if(this.tracks_by_hash[track.hash]) {
      console.warn(`Track ${track.artist} - ${track.title} found multiple times (${track.hash.substring(0, 8)})`);
      return;
    }
    this.tracks_by_hash[track.hash] = track;
    this.tracks_by_path[track.file_path] = track;
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
    this.should_save = true;
  }

  remove_track(track) {
    const track_index = this.tracks.findIndex(t => t == track);
    if(track_index >= 0) {
      this.tracks.splice(track_index, 1);
      delete this.tracks_by_hash[track.hash];
      delete this.tracks_by_path[track.file_path];
      this.should_save = true;
    }
  }

  clear() {
    while(this.tracks.length) {
      this.remove_track(this.tracks[0]);
    }
  }
};
