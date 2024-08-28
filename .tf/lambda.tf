# Fetch our file from the local file system
data "archive_file" "lambda" {
  type        = "zip"
  source_file = "../dist/index.js"
  output_path = "../dist/index.zip"
}

#Create our lambda function
resource "aws_lambda_function" "crypto-currency" {
  filename      = "../dist/index.zip"
  function_name = "crypto-currency"
  role          = aws_iam_role.iam_for_lambda.arn
  handler       = "index.handler"

  source_code_hash = data.archive_file.lambda.output_base64sha256
  layers           = [aws_lambda_layer_version.nodejs_layer.arn]

  runtime = "nodejs20.x"
  tracing_config {
    mode = "Active"
  }
}

resource "aws_lambda_function_url" "crypto_lambda_url" {
  function_name      = aws_lambda_function.crypto-currency.function_name
  authorization_type = "NONE"
}

resource "aws_cloudwatch_log_group" "lambda_log_crypto_group" {
  name              = "/aws/lambda/${aws_lambda_function.crypto-currency.function_name}"
  retention_in_days = 1
}

output "lambda_function_url" {
  description = "The URL to invoke the Lambda function"
  value       = aws_lambda_function_url.crypto_lambda_url.function_url
}

resource "aws_iam_role_policy_attachment" "lambda_xray_policy" {
  role       = aws_iam_role.iam_for_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess"
}

resource "aws_iam_role_policy" "lambda_ssm_policy" {
  name = "LambdaSSMPolicy"
  role = aws_iam_role.iam_for_lambda.name

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "ssm:GetParameter",
        Effect = "Allow",
        Resource = "*"
      }
    ]
  })
}