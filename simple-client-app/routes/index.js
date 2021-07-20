var axios = require('axios');
var express = require('express');

var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index');
});


router.get('/search_taxis', function(req, res, next) {
  axios(`https://dev.api.taxi/taxis?lon=${req.query.lon}&lat=${req.query.lat}`, {
    headers: {
      'X-Api-Key': process.env.API_KEY,
    },
  }).then(({ data }) => {
    res.render('search_taxis', {
      taxis: data.data,
      client: {
        ...req.query
      },
    });
  }).catch(({ response }) => {
    res.render('search_taxis', {
      error: response.data,
      client: {
        ...req.query,
      },
    });
  });
});

router.post('/order', function(req, res, next) {
  const taxiId = req.body.taxi_id;
  const operator = req.body.operator;
  const client = JSON.parse(req.body.client);

  axios(`https://dev.api.taxi/hails`, {
    method: 'post',
    headers: {
      'X-Api-Key': process.env.API_KEY,
      'Content-Type': 'application/json',
    },
    data: {
      data: [{
        customer_address: client.address,
        customer_id: client.customer_id,
        customer_lon: client.lon,
        customer_lat: client.lat,
        customer_phone_number: client.phone_number,
        taxi_id: taxiId,
        operateur: req.body.operator,
      }],
    },
  }).then(({ data }) => {
    const hailId = data.data[0].id;
    res.redirect(`/hail_info?id=${hailId}`);
  }).catch(({ response }) => {
    res.render('order', {
      error: response.data,
      taxiId,
      operator,
      client,
    });
  });
});

router.get('/hail_info', function(req, res, next) {
  axios(`https://dev.api.taxi/hails/${req.query.id}`, {
    headers: {
      'X-Api-Key': process.env.API_KEY,
    },
  }).then(({ data }) => {
    res.render('hail_info', {hail: data.data[0]});
  }).catch(({response }) => {
    res.render('hail_info', { error: response.data });
  });
});

router.post('/hail_info', function(req, res, next) {
  axios(`https://dev.api.taxi/hails/${req.query.id}`, {
    method: 'put',
    headers: {
      'X-Api-Key': process.env.API_KEY,
      'Content-Type': 'application/json',
    },
    data: {
      data: [{
        status: req.body.status,
      }],
    },
  }).then(({ data }) => {
    res.redirect(`/hail_info?id=${req.query.id}`);
  }).catch(({ response }) => {
    res.render('hail_info', {
      id: req.query.id,
      error: response.data,
    });
  });
});

module.exports = router;
