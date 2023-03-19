import { createHash } from 'crypto';
import { parseFile, parseBuffer } from 'music-metadata';

export default class RSTrack {
  static async from_buffer(buffer) {
    return this.from_metadata(await parseBuffer(buffer))
  }

  static async from_file_path(file_path) {
    const track = this.from_metadata(await parseFile(file_path));
    track.file_path = file_path;
    return track;
  }

  static from_metadata(metadata) {
    return {
      title: metadata.common.title || 'Unknown',
      artist: metadata.common.artist || metadata.common.albumartist || 'Unknown',
      album: metadata.common.album || 'Unknown',
      duration: metadata.format.duration,
    };
  }

  static get_hash_from_buffer(buffer) {
    return createHash('sha256').update(buffer).digest('hex');
  }
};
