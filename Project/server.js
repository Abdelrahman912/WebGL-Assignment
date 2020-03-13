const express = require("express");
const app = express();
app.get('/', (req, res) => {
    res.send('hello world')
});
app.use(express.static("public/html/"));
app.use(express.static("public/js"));

app.use(express.static("public/css"));
app.listen(3000);