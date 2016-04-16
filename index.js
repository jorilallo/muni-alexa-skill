var fetch = require('node-fetch');
var xml2js = require('xml2js');

fetch.Promise = require('bluebird');

var applicationId = "<ALEXA SDK APP ID HERE>";
var muniStop = "<MUNI STOP NUMBER HERE>";

exports.handler = function (event, context) {
  try {
    if (event.session.application.applicationId !== applicationId) {
      console.log("event.session.application.applicationId=" + event.session.application.applicationId);
      context.fail("Invalid Application ID");
    }

    if (event.request.type === "LaunchRequest") {
      getResponse(
        event.request,
        event.session,
        function callback(speechletResponse) {
          context.succeed(buildResponse(speechletResponse));
        });
    } else {
      context.succeed();
    }
  } catch (e) {
    context.fail("Exception: " + e);
  }
};

function getData(callback) {
  var parser = new xml2js.Parser();

  fetch('http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=sf-muni&stopId=' + muniStop)
  .then(function(res) {
    return res.text();
  })
  .then(function(text) {
    parser.parseString(text, function (err, result) {
      var predictions = result['body']['predictions'][0];
      var resultData = {
        predictions: [],
      };

      resultData.route = predictions['$']['routeTitle'];
      resultData.direction = predictions['direction'][0]['$']['title'];
      predictions['direction'][0]['prediction'].forEach(function(prediction){
        resultData.predictions.push(prediction['$']['minutes']);
      });

      callback(null, resultData)
    });
  })
  .catch(function(err) {
    callback(err, null);
  });
}

function getResponse(request, session, callback) {
  var speechOutput;

  getData(function(err, data) {
    if (err) {
      speechOutput = "Error fetching the schedule";
    } else {
      // Construct response text with max 3 arriving MUNIs
      speechOutput = "Next " + data.route + " " + data.direction + " will arrive in ";

      data.predictions = data.predictions.slice(0, 3)
      var predictionCount = data.predictions.length;

      for (var i = 0; i < predictionCount; i++) {
        speechOutput += data.predictions[i];
        if (i === predictionCount - 2) {
          speechOutput += ' and ';
        } else if (i < predictionCount - 1) {
          speechOutput += ', ';
        }
      }

      speechOutput += ' minutes';
    }

    callback(buildSpeechletResponse(speechOutput));
  });
}

function buildSpeechletResponse(output) {
  return {
    outputSpeech: {
      type: "PlainText",
      text: output
    },
    shouldEndSession: true
  };
}

function buildResponse(speechletResponse) {
  return {
    version: "1.0",
    sessionAttributes: {},
    response: speechletResponse
  };
}