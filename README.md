# Aplicacion con aws serverless (API Gateway, SQS, SNS, Trigger)

Este modelo ejemplo de aplicacion recibe una peticion POST, para procesar los tramites de retiros de fondos de AFP's.

## Requerimientos

    - Cuenta en aws
    
    - Configurar aws client (sls)
        npm install -g serverless
        serveless config credentials --provider aws --key <YOUR-KEY> --secret <YOUR-SECRET>

    - Crear una cola standar (SQS)
        Se debera de modificar el enviroment de la URL de la cola: custom.sqsUrlAfiliados, por su endpoint de su cola creada.
    

## Servicios de azure utilizados:

    - API GATEWAY
    - lambdas desarrollados en nodejs
    - SQS (Simple Queue Service)
    - SNS (Simple Notification Service)
    - Trigger


La arquitectura propuesta es:

![Screenshot](img/aws-sls-user.png?raw=true "POST")


## librerias 

    npm install --save aws-sdk serverless-http serverless-http body-parser
    npm install --save-dev serverless-offline serverless-dynamodb-local
    npm install email-validator --save


## Deploy to aws

    sls deploy
 

## Body para envio de tramite de solicitud:


    curl --location --request POST 'https://dsc4xjme52.execute-api.us-east-1.amazonaws.com/dev/saveSolicitude' \
    --header 'Content-Type: application/json' \
    --data-raw '{
        "beneficiary": "Luis miguel gomez",
        "DNI": "42554133",
        "checkDigit": "1",
        "birthday": "20/03/1994",
        "email":"gomez_saavedra@hotmail.com",
        "amount": "100.00",
        "account": "122121212324342113"
    }'


## Remove components aws

    sls remove