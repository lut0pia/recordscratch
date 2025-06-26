import fs from 'fs';

export default (fs && fs.promises) || {
  is_fake: true,
  readFile(file) {
    const file_contents = localStorage.getItem(file);
    if(file_contents === null) {
      throw new Error(`File ${file} does not exist`);
    }
    return file_contents ;
  },
  writeFile(file, data) {
    localStorage.setItem(file, data);
  },
};
