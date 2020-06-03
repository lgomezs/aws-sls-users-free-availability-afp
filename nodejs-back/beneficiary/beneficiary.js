'use strict';

const commons = require('/opt/commons')
const uuid = require('uuid');
const AWS = require('aws-sdk')
const bodyParser = require('body-parser')
var validator = require("email-validator");

const USERS_AFILIADOS_TABLE = process.env.USERS_AFILIADOS_TABLE;

let dynamoDB = new AWS.DynamoDB.DocumentClient();

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
      commons.sendMessageQuee(params.Item);

      callback(null, {
        statusCode: 200,
        body: response
      })

    }
  });

};