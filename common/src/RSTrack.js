import fs from './RSFileSystem.js';
import { createHash } from 'crypto';
import { parseBuffer } from 'music-metadata';

export default class RSTrack {
  static async from_buffer(buffer, filename) {
    const track = this.from_metadata(await parseBuffer(buffer, {
      path: filename,
    }));
    track.filename = filename;
    track.hash = this.get_hash_from_buffer(buffer);
    if(!track.title && filename) {
      track.title = filename.split('.')[0]
    }
    return track;
  }

  static async from_file_path(file_path) {
    const track_buffer = await fs.readFile(file_path);
    const get_filename = path => path.replace(/^.*[\\/]/, '');
    const track = await this.from_buffer(track_buffer, get_filename(file_path));
    track.file_path = file_path;
    return track;
  }

  static from_metadata(metadata) {
    return {
      title: metadata.common.title,
      artist: metadata.common.artist || metadata.common.albumartist || 'Unknown',
      album: metadata.common.album || 'Unknown',
      duration: metadata.format.duration,
    };
  }

  static get_hash_from_buffer(buffer) {
    return createHash('sha256').update(buffer).digest('hex');
  }
};
