'use strict';

const AWS = require('aws-sdk')
const bodyParser = require('body-parser')

//datos de sqs
var SQS = new AWS.SQS({});
var SES = new AWS.SES({});

const SQS_URL_AFILIADOS = process.env.SQS_URL_AFILIADOS;
const USERS_AFILIADOS_TABLE = process.env.USERS_AFILIADOS_TABLE;
const IS_OFFLINE = process.env.IS_OFFLINE;


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


module.exports.notification = (event, context, callback) => {

    console.log("### notification");

    for (const { messageId, body } of event.Records) {
        console.log("messageId body {} {} ", messageId, body);
        const varBody = JSON.parse(body);
       
        const params = {
            TableName: USERS_AFILIADOS_TABLE,
            Key: {
                userId: varBody.uuid,
            }
        };

        dynamoDB.get(params, (error, result) => {
            if (error) {
                console.log(error);
            }
            if (result.Item) {
                sendEmail(result);
            } else {
                console.log('transaction not found');
            }
        })

    }


    function sendEmail(result) {
        const { userId, beneficiary, DNI, email, account, amount, createdAt } = result.Item;
        console.log("beneficiary : ", beneficiary);

        //send email notification

        const htmlBody = `
            <!DOCTYPE html>
            <html>
            <head>
            </head>
            <body>
                <p>Hola, ${beneficiary} : </p>
                <p>Su registro de solicitud ha sido registrada satisfactoriamente. </p>               
                </p>
                <p>Importe solicitado: ${amount} </p>
            </body>
            </html>`;


        var paramsEmail = {
            Destination: {
                ToAddresses: [email]
            },
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: htmlBody
                    }
                },
                Subject: {
                    Data: "Recepción de solicitud aceptada"
                }
            },
            Source: "lmgomez.saavedra@gmail.com"
        };

        SES.sendEmail(paramsEmail, function (err, data) {
            callback(null, { err: err, data: data });
            if (err) {
                console.log(err);
                context.fail(err);
            } else {
                console.log("email send...... " + data);
                context.succeed(event);
            }
        });

    }
};