resource "aws_apigatewayv2_api" "get_crypto_currency_api" {
  name          = "get_crypto_currency_api"
  protocol_type = "HTTP"
  target        = aws_lambda_function.crypto-currency.invoke_arn
}

