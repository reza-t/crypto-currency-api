resource "aws_cloudwatch_dashboard" "crypto_service_dashboard" {
  dashboard_name = "CryptoServiceDashboard"
  dashboard_body = jsonencode({
    "widgets" = [
      {
        "type"   = "metric",
        "x"      = 0,
        "y"      = 0,
        "width"  = 12,
        "height" = 6,
        "properties" = {
          "metrics" = [
            ["exchangeNamespace", "failedGetPrice", "service", "cryptoService"],
            [".", "successfulGetPrice", ".", "."]
          ],
          "view"    = "timeSeries",
          "stacked" = false,
          "region"  = "eu-central-1",
          "stat"    = "Sum",
          "period"  = 300,
          "title"   = "Successful vs Failed GetPrice Calls"
        }
      }
    ]
  })
}

