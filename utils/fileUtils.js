const fs = require("fs");
const path = require("path");

// Function to move file from source to destination
const moveFile = async (src, dest) => {
  return new Promise((resolve, reject) => {
    fs.rename(src, dest, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

// Function to create directory recursively
const mkdirSyncRecursive = (directory) => {
  const pathParts = directory.split("/");
  for (let i = 1; i <= pathParts.length; i++) {
    const segment = pathParts.slice(0, i).join("/");
    if (!fs.existsSync(segment)) {
      fs.mkdirSync(segment);
    }
  }
};

//export the helper functions
module.exports = { moveFile, mkdirSyncRecursive };
