require("dotenv").config();
const axios = require("axios");

async function getAllRepos() {
    try {
        let repos = [];
        let page = 1;

        while (true) {
            const res = await axios.get(
                `https://api.github.com/user/repos?per_page=100&page=${page}`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.TOKEN}`,
                        Accept: "application/vnd.github+json"
                    }
                }
            );

            if (res.data.length === 0) break;

            repos.push(...res.data);
            page++;
        }

        console.log(
            repos.map(repo => repo.full_name)
        );

        console.log(`Total repos: ${repos.length}`);
    } catch (err) {
        console.log(err.response?.data || err.message);
    }
}

getAllRepos();