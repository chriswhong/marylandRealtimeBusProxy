var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var moment = require('moment');

var routes = [];

//read in routes.txt
fs.readFile(__dirname + '/../data/routes.txt', {
  encoding: 'UTF-8'
}, function read(err, data) {
  if (err) {
    console.log('Could not load route file', err);
    return;
  }


  var dataRows = data.split('\n');

  dataRows.forEach(function(row) {
    var rowData = row.split(',');
    if (parseInt(rowData[0],10) !== NaN) {
      routes.push({
        lineDirId: rowData[5] + '0',
        number: rowData[4],
        name: rowData[0]
      });
      routes.push({
        lineDirId: rowData[5] + '1',
        number: rowData[4],
        name: rowData[0]
      });
    }
  });
});


//vehicles geojson endpoint
router.get('/vehicles', function(req, res, next) {
  getVehicleData(res);
});

function getVehicleData(res) {

  var payloadString = {
    "version": "1.1",
    "method": "GetTravelPoints",
    "params": {
      "travelPointsReqs": routes,
      "interval": 1
    }
  };


  request.post({
    headers: {
      'content-type': 'application/json'
    },
    url: 'http://realtimemap.mta.maryland.gov/RealTimeManager',
    body: JSON.stringify(payloadString)
    }, function(error, response, body) {
      var data = JSON.parse(body);
 
      res.send(cleanData(data));
    });


}

//take in raw JSON, spit out geoJSON
function cleanData(rawData) {

  var geoJSON = {
    type: "FeatureCollection",
    features: []
  };

  rawData.result.travelPoints.forEach(function(line) {
    if (line.EstimatedPoints) {
      var e = line.EstimatedPoints[0];
      lineInfo = getLineInfo(line.EstimatedPoints[0].LineDirId);
      
      var vehicle = {
        type: "Feature",
        properties: {
          timestamp: moment().format(),
          heading: Math.round(e.Heading),
          lineId: Math.round(e.LineDirId/10),
          directionId: (e.LineDirId & 1) ? 1 : 0,
          direction: lineInfo.direction,
          number: lineInfo.number,
          name: lineInfo.name,
          tripId: e.TripId,
          vehicleNumber: line.VehicleNumber
        },
        geometry: {
          type: "Point",
          coordinates: [
            e.Lon,
            e.Lat
          ]
        }
      }

      geoJSON.features.push(vehicle);
    };
  });

  return geoJSON;
};

//lookup function checks with routes object to get details about a route
function getLineInfo(lineDirId) {
  lineDirId = lineDirId + '';
  var lineInfo = {};
  routes.forEach(function(line) {
    if (lineDirId === line.lineDirId) {
      lineInfo.name = line.name;
      lineInfo.number = line.number;
    }
  });
  return lineInfo
};

module.exports = router;
