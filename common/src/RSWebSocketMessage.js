export default class RSWebSocketMessage {
  static encoder = new TextEncoder();
  static decoder = new TextDecoder();
  static from_object(obj) {
    let buffer_size = 4; // 4 first bytes for the size of the obj buffer
    let raw_buffers = [];
    for(let key in obj) {
      if(obj[key] instanceof Uint8Array) {
        const raw_buffer_index = raw_buffers.length;
        const raw_buffer = obj[key];
        raw_buffers.push(raw_buffer);
        obj[key] = `RAW_BUFFER_${raw_buffer_index}_${raw_buffer.byteLength}`;
        buffer_size += raw_buffer.byteLength;
      }
    }

    const obj_buffer = this.encoder.encode(JSON.stringify(obj));
    buffer_size += obj_buffer.byteLength;

    const buffer = new ArrayBuffer(buffer_size);
    const buffer_view = new DataView(buffer);
    const array = new Uint8Array(buffer);
    buffer_view.setUint32(0, obj_buffer.byteLength);
    array.set(obj_buffer, 4);

    let raw_buffer_offset = obj_buffer.byteLength + 4;
    for(let raw_buffer of raw_buffers) {
      array.set(raw_buffer, raw_buffer_offset);
      raw_buffer_offset += raw_buffer.byteLength;
    }

    return array;
  }

  static to_object(array) {
    if(!(array instanceof Uint8Array)) {
      console.error(`Incorrect type`);
    }
    // We have to account for byteOffset because the array we're given does not start at the beginning of its buffer
    const buffer_view = new DataView(array.buffer, array.byteOffset);
    const obj_buffer_size = buffer_view.getUint32(0);
    const obj_array = new Uint8Array(array.buffer, array.byteOffset + 4, obj_buffer_size);
    const obj_str = this.decoder.decode(obj_array);
    const obj = JSON.parse(obj_str);

    let raw_buffer_offset = obj_buffer_size + 4;
    for(let key in obj) {
      const value = obj[key];
      if(!(typeof value === 'string' || value instanceof String)) {
        continue;
      }
      const match = value.match(/^RAW_BUFFER_(\d+)_(\d+)$/);
      if(!match) {
        continue;
      }
      const raw_buffer_index = parseInt(match[1]);
      const raw_buffer_size = parseInt(match[2]);

      obj[key] = new Uint8Array(array.buffer, array.byteOffset + raw_buffer_offset, raw_buffer_size);
      raw_buffer_offset += raw_buffer_size;
    }

    return obj;
  }
};
