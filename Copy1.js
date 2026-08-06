
//copyfiles and folder
const fs = require("fs");
const path = require("path");

const folder = "C:\\Users\\jacky\\Desktop\\test";

const allowedExtensions = [
    ".txt",
    ".csv",
    ".json",
    ".pdf",
    ".zip",
    ".xls",
    ".xlsx"
];

const files = fs.readdirSync(folder);

files.forEach(file => {
    const fullPath = path.join(folder, file);

    if (!fs.statSync(fullPath).isFile()) return;

    const ext = path.extname(file).toLowerCase();

    if (allowedExtensions.includes(ext)) {
        console.log(`Found: ${file}`);

        // Read as binary (Buffer)
        const data = fs.readFileSync(fullPath);

        console.log(`Size: ${data.length} bytes`);
    }
});