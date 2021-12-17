var axios = require('axios');
var express = require('express');

var router = express.Router();

const API_URL = 'https://dev.api.taxi';

const headers = {
  'X-Api-Key': process.env.API_KEY,
  'Content-Type': 'application/json',
};

// Store a single hail globally in memory for the sake of this tutorial
var hail = undefined;

function update_hail_status(status, taxi_phone_number = null) {
  var data = {
    data: [{
      status: status
    }]
  };
  if (taxi_phone_number) {
    data.data[0]['taxi_phone_number'] = taxi_phone_number;
  }

  axios(`${API_URL}/hails/${hail.id}`, {
    method: 'put',
    headers,
    data,
  }).then(({ data }) => {
    // Received the updated hail
    hail = data.data[0];
  });
}

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index');
});

router.get('/status', function (req, res) {
  var taxi_id = req.query.taxi_id;
  // Refresh taxi status
  axios(`${API_URL}/taxis/${taxi_id}`, {
    headers,
  }).then(({ data }) => {
    // Refresh hail status if any
    if (hail) {
      axios(`${API_URL}/hails/${hail.id}`, {
        headers,
      }).then(({ data }) => {
        hail = data.data[0];
      });
      // Simulate the operator backend and pretend it was sent to the driver app
      // Must happen under 10 seconds after the hail is `received_by_operator`
      if (hail.status == 'received_by_operator') {
        update_hail_status('received_by_taxi');
      }
    }
    res.render('status', { taxi: data.data[0], hail });
  }).catch(({ response }) => {
    if (response) {
      var message = `error on GET ${response.request.path}`;
      res.render('error', { message, status: response.status, error: response.data });
    } else {
      res.render('error', { message: JSON.stringify(response), status: 0, error: "no response" });
    }
  });
});

router.post('/status', function (req, res) {
  var taxi_id = req.query.taxi_id;
  axios(`${API_URL}/taxis/${taxi_id}`, {
    method: 'put',
    headers,
    data: {
      data: [{
        status: req.body.status,
      }]
    }
  }).then(({ data }) => {
    axios(`${API_URL}/geotaxi`, {
      method: 'post',
      headers,
      data: {
        data: [{
          positions: [
            { taxi_id, lon: req.body.lon, lat: req.body.lat },
          ]
        }],
      }
    }).then(() => {
      res.redirect(`/status?taxi_id=${taxi_id}`);
    }).catch(({ response }) => {
      var message = `error on POST ${response.request.path}`
      res.render('error', { message, status: response.status, error: response.data });
    })
  }).catch(({ response }) => {
    var message = `error on PUT ${response.request.path}`
    res.render('error', { message, status: response.status, error: response.data });
  });
});

router.post('/hail', function (req, res) {
  // The global hail object to simplify this tutorial
  hail = req.body.data[0];
  // return a valid JSON response, le.taxi API will check it
  res.json({});
});

router.post('/update_hail', function (req, res) {
  var taxi_id = req.body.taxi_id;
  switch (req.body.action) {
    case 'accept':
      // taxi_phone_number is required at one step or another before the hail can be accepted
      update_hail_status('accepted_by_taxi', '0123456789');
      break;
    case 'decline':
      update_hail_status('declined_by_taxi');
      break;
    case 'declare_incident':
      update_hail_status('incident_taxi');
      break;
    case 'declare_on_board':
      update_hail_status('customer_on_board');
      break;
    case 'finish':
      update_hail_status('finished');
      break;
    case 'reset':
      hail = null;
      break;
  }
  res.redirect(`/status?taxi_id=${taxi_id}`);
});

module.exports = router;
