require("dotenv").config();
const axios = require("axios");

axios.get("https://api.github.com/user/repos", {
    headers: {
        Authorization: `Bearer ${process.env.TOKEN}`,
        Accept: "application/vnd.github+json"
    }
})
.then(res => {
    console.log(res.data.map(repo => repo.full_name));
})
.catch(err => {
    console.log(err.response?.data || err.message);
});