const express = require('express');
const axios = require('axios');
const redis = require('redis');

const app = express();
const client = redis.createClient(6379);

function getCache(req, res, next) {
  let { username } = req.params;
  client.get(username, (err, result) => {
    if (err) {
      res.send('Server Error');
    }
    if (result !== null) {
      res.send(`<h3>${username} has ${result} followers.</h3>`);
    } else {
      next();
    }
  });
}

app.get('/:username', getCache, (req, res) => {
  let { username } = req.params;
  axios
    .get(`https://www.instagram.com/${username}/?__a=1`)
    .then((result) => {
      let fc = result.data.graphql.user.edge_followed_by.count;
      client.setex(username, 3000, fc);
      res.send(`<h3>${username} has ${fc} followers.</h3>`);
    })
    .catch((err) => {
      res.json({ error: 'Server Error' });
    });
});

app.listen(9000, () => {
  console.log('Server is running at port 9000');
});
