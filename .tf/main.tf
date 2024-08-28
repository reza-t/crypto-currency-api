# Create policy to allow lambda to assume role
data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

# Create IAM role for lambda
resource "aws_iam_role" "iam_for_lambda" {
  name                = "iam_for_lambda"
  assume_role_policy  = data.aws_iam_policy_document.assume_role.json
  managed_policy_arns = ["arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"]
}

# Create permission to allow lambda to attach api gateway
resource "aws_lambda_permission" "apigw_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.crypto-currency.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.get_crypto_currency_api.execution_arn}/*/*"
}

# Create layer for lambda
resource "aws_lambda_layer_version" "nodejs_layer" {
  filename            = "../nodejs.zip"
  layer_name          = "nodejs_layer"
  compatible_runtimes = ["nodejs18.x", "nodejs20.x"]
}

resource "aws_xray_sampling_rule" "trace_all" {
  rule_name      = "trace-all"
  priority       = 1
  version        = 1
  reservoir_size = 1
  fixed_rate     = 1.0
  url_path       = "*"
  host           = "*"
  http_method    = "*"
  service_type   = "*"
  service_name   = "*"
  resource_arn   = "*"

  attributes = {}
}