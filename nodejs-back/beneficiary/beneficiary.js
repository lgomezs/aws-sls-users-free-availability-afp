'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk')
const bodyParser = require('body-parser')
var validator = require("email-validator");

const USERS_AFILIADOS_TABLE = process.env.USERS_AFILIADOS_TABLE;
const IS_OFFLINE = process.env.IS_OFFLINE;

//datos de sqs
var SQS = new AWS.SQS({});
const SQS_URL_AFILIADOS = process.env.SQS_URL_AFILIADOS;

let dynamoDB;


if (IS_OFFLINE === 'true') {
  dynamoDB = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000'
  });
} else {
  console.log("AWS.DynamoDB.DocumentClient()");
  dynamoDB = new AWS.DynamoDB.DocumentClient();
}


module.exports.saveSolicitude = (event, context, callback) => {
  console.log('requestBody: ' + event.body);
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);

  if (!validator.validate(data.email)) {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify('invalid email')
    })
  }

  const params = {
    TableName: USERS_AFILIADOS_TABLE,
    Item: {
      'userId': uuid.v1(),
      'beneficiary': data.beneficiary,
      'dni': data.DNI,
      'checkDigit': data.DcheckDigitNI,  
      'birthday': data.birthday,       
      'email': data.email,
      'amount': data.amount,
      'account': data.account,
      'createdAt': timestamp,
      'updatedAt': timestamp
    },
  };

  console.log('params: ' + JSON.stringify(params.Item));

  dynamoDB.put(params, (error) => {
    if (error) {
      console.log(error);

      callback({
        statusCode: 500,
        body: JSON.stringify(error)
      })

    } else {
      var response = JSON.stringify(params.Item);
      sendMessageQuee(params.Item);

      callback(null, {
        statusCode: 200,
        body: response
      })

    }
  });


  async function sendMessageQuee(Item) {
    try {

      console.log("response.userId : " + Item.userId);

      //Message body is JSON to send queue
      const messageBody = {
        "uuid": Item.userId.toString(),
        "orderSent": timestamp
      }

      const responseSQS = SQS.sendMessage({
        MessageBody: JSON.stringify(messageBody),
        QueueUrl: SQS_URL_AFILIADOS
      }).promise();

      console.log("message put in queue: " + responseSQS);

    } catch (e) {
      console.log("Error send to queue ", e);
    }
  }

};