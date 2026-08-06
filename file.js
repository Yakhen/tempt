require("dotenv").config();

const axios = require("axios");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const OWNER = "Yakhen";
const REPO = "tempt";

const sourceFolder = String.raw`C:\Users\jacky\Desktop\test`;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


function confirm(message) {
    return new Promise(resolve => {
        rl.question(message, answer => {
            resolve(answer.toLowerCase() === "y");
        });
    });
}


// Files/folders that should never upload
const ignoredFiles = [
    ".env",
    ".git",
    "node_modules",
    ".DS_Store"
];


function shouldIgnore(name) {
    return ignoredFiles.includes(name);
}


// Recursively collect files
function getFiles(folder, base = folder) {

    let results = [];

    fs.readdirSync(folder).forEach(file => {

        if (shouldIgnore(file)) {
            return;
        }


        const fullPath = path.join(folder, file);

        const relativePath = path
            .relative(base, fullPath)
            .replace(/\\/g, "/");


        const stats = fs.statSync(fullPath);


        if (stats.isDirectory()) {

            results = results.concat(
                getFiles(fullPath, base)
            );

        } else {

            results.push({

                name: file,

                path: fullPath,

                githubPath: relativePath,

                size: stats.size

            });

        }

    });


    return results;

}


// Upload one file
async function uploadFile(file) {


    const url =
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${file.githubPath}`;


    const content = fs.readFileSync(file.path)
        .toString("base64");


    let sha = null;


    // Check if file already exists
    try {

        const existing = await axios.get(url, {

            headers: {

                Authorization:
                    `Bearer ${process.env.TOKEN}`,

                Accept:
                    "application/vnd.github+json"

            }

        });


        sha = existing.data.sha;


    } catch (error) {

        // New file
    }



    const body = {

        message:
            `Upload ${file.githubPath}`,

        content

    };


    // Required when updating existing file
    if (sha) {

        body.sha = sha;

    }



    await axios.put(url, body, {

        headers: {

            Authorization:
                `Bearer ${process.env.TOKEN}`,

            Accept:
                "application/vnd.github+json"

        }

    });


    console.log(
        `✔ Uploaded: ${file.githubPath}`
    );

}



// Main function
async function uploadFolder() {

    try {


        if (!process.env.TOKEN) {

            throw new Error(
                "GitHub TOKEN missing in .env"
            );

        }



        if (!fs.existsSync(sourceFolder)) {

            throw new Error(
                `Folder does not exist: ${sourceFolder}`
            );

        }



        const files = getFiles(sourceFolder);



        console.log("\nFiles found:");
        console.log("----------------");


        files.forEach((file, index) => {

            console.log(
                `${index + 1}. ${file.githubPath} (${file.size} bytes)`
            );

        });


        console.log("----------------");

        console.log(
            `Total files: ${files.length}`
        );



        const approved = await confirm(
            "\nUpload these files to GitHub? (y/n): "
        );



        if (!approved) {

            console.log("Cancelled.");

            rl.close();

            return;

        }



        console.log("\nUploading...\n");



        for (const file of files) {

            await uploadFile(file);

        }



        console.log(
            "\n✅ Upload complete!"
        );



        rl.close();



    } catch (error) {


        console.error(
            "\nUpload failed:"
        );


        console.error(
            error.response?.data || error.message
        );


        rl.close();

    }

}



uploadFolder();