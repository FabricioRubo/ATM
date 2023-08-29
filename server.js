const app = require("./src/app");
require('dotenv').config();

const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log('This server is running on port:'+ port)
})