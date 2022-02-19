# ApiGateway HttpApi Eventbridge

![Block-diagram](./bloc-diagram.png)

## Testing

```sh
curl --location --request POST '<your api endpoint>' --header 'Content-Type: application/json' \
--data-raw '{
    "Detail":{
        "message": "This is my test"
    }
}'
```

Then check the logs for the Lambda function using the sam logs command. Change the stack name to your stack name.

```sh
sam logs --stack-name <your stack name> -n MyTriggeredLambda
```

## Cleanup

```bash
sam delete --stack-name <your-stack-name>
```
