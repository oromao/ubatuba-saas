variable "project_name" {
  description = "Nome do projeto"
  type        = string
  default     = "flydea"
}

variable "environment" {
  description = "Ambiente (dev/staging/prod)"
  type        = string
}

variable "aws_region" {
  description = "Regiao AWS"
  type        = string
  default     = "sa-east-1"
}

variable "vpc_id" {
  description = "VPC alvo"
  type        = string
}

variable "private_cidrs" {
  description = "CIDRs permitidos para trafego interno"
  type        = list(string)
  default     = ["10.0.0.0/16"]
}

variable "log_retention_days" {
  description = "Retencao de logs no CloudWatch"
  type        = number
  default     = 30
}
