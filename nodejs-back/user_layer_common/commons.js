'use strict';

const AWS = require('aws-sdk')
var SQS = new AWS.SQS({});
const SQS_URL_AFILIADOS = process.env.SQS_URL_AFILIADOS;


module.exports.sendMessageQuee = (item, context, callback) => {
    console.log("event ", item);
    try {
        const timestamp = new Date().getTime();

        //Message body is JSON to send queue
        const messageBody = {
            "uuid": item.userId.toString(),
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


};


