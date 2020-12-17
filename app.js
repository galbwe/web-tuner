const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('static'))

app.listen(port, () => {
  console.log(`Web Tuner app listening at http://localhost:${port}`)
})
