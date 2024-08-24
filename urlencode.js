const fs = require("fs");
const path = require("path");

const filename = process.argv[2];
if (!filename) {
  console.error(`usage: node ${process.argv[1]} filename`);
  process.exit(1);
}

const filePath = path.resolve(filename);
const data = fs.readFileSync(filePath, "utf8");
console.log("javascript:" + encodeURIComponent(data) + "void(0)");
