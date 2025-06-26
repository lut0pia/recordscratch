import fs from './RSFileSystem.js';

export default class RSUserSettings {
  static descriptions = {
    name: {
      category: 'identity',
      type: 'text',
      shared: true,
      regexp: /^.{0,24}$/,
    },
    pronouns: {
      category: 'identity',
      type: 'text',
      shared: true,
      regexp: /^.{0,10}$/,
    },
    /*
    scan_paths: {
      category: 'library',
      type: 'path',
    },
    */
  };
  constructor() {
    this.values = {};
  }

  set_value(key, value) {
    this.values[key] = value;
    this.save_to_file();
  }

  get_value(key) {
    return this.values[key];
  }

  save_to_file() {
    fs.writeFile('.settings.json', JSON.stringify(this.values))
    console.log(`Wrote user settings to disk`);
  }

  async load_from_file() {
    try {
      this.values = JSON.parse(await fs.readFile('.settings.json'));
      console.log(`Read user settings from disk`);
      return true;
    } catch(e) {
      console.log(`Couldn't read user settings from disk`);
      return false;
    }
  }
};
