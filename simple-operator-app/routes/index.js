var express = require('express');
var router = express.Router();
var axios = require('axios');

const API_URL = 'https://dev.api.taxi'
const headers = {
  'Content-Type': 'application/json',
  'X-Api-Key': process.env.API_KEY,
}

router.get('/', function (req, res) {
  res.render('index');
});

router.get('/driver', function (req, res) {
  res.render('driver');
});

router.post('/driver', function (req, res) {
  axios(`${API_URL}/drivers`, {
    method: 'post',
    headers,
    data: {
      data: [{
        ...req.body,
        departement: {
          nom: "",
          numero: req.body.departement,
        },
        birth_date: req.body.birth_date || null,
      }]
    }
  }).then(() => {
    res.render('driver', { message: "Chauffeur créé avec succès" });
  }).catch(({ response }) => {
    res.render('driver', { error: response.data, body: req.body });
  });
})

router.get('/vehicle', function (req, res) {
  res.render('vehicle');
});

router.post('/vehicle', function (req, res) {
  axios(`${API_URL}/vehicles`, {
    method: 'post',
    headers,
    data: {
      data: [{
        ...req.body,
      }]
    }
  }).then(() => {
    res.render('vehicle', { message: "Véhicule créé avec succès" });
  }).catch(({ response }) => {
    res.render('vehicle', { error: response.data, body: req.body });
  });
})

router.get('/ads', function (req, res) {
  res.render('ads');
});

router.post('/ads', function (req, res) {
  axios(`${API_URL}/ads`, {
    method: 'post',
    headers,
    data: {
      data: [{
        ...req.body,
      }]
    }
  }).then(() => {
    res.render('ads', { message: "ADS créée avec succès" });
  }).catch(({ response }) => {
    res.render('ads', { error: response.data, body: req.body });
  });
})

router.get('/taxi', function (req, res) {
  res.render('taxi');
});

router.post('/taxi', function (req, res) {
  axios(`${API_URL}/taxis`, {
    method: 'post',
    headers,
    data: {
      data: [{
        driver: {
          professional_licence: req.body.professional_licence,
          departement: req.body.departement,
        },
        vehicle: {
          licence_plate: req.body.licence_plate,
        },
        ads: {
          numero: req.body.numero,
          insee: req.body.insee,
        }
      }]
    }
  }).then(() => {
    res.render('taxi', { message: "Taxi créé avec succès" });
  }).catch(({ response }) => {
    res.render('taxi', { error: response.data, body: req.body });
  });
})

module.exports = router;
