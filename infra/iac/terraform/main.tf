terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# Placeholder de rede (substituir por data sources ou modulo VPC existente)
resource "aws_security_group" "api" {
  name        = "${local.name_prefix}-api-sg"
  description = "Security group for FlyDea API"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 4000
    to_port     = 4000
    protocol    = "tcp"
    cidr_blocks = var.private_cidrs
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = local.tags
}

# Cluster ECS base (servicos web/api/geoserver serao definidos por task definitions por ambiente)
resource "aws_ecs_cluster" "this" {
  name = "${local.name_prefix}-cluster"
  tags = local.tags
}

# Log group central da aplicacao
resource "aws_cloudwatch_log_group" "app" {
  name              = "/flydea/${var.environment}"
  retention_in_days = var.log_retention_days
  tags              = local.tags
}

# ECR base para imagens
resource "aws_ecr_repository" "api" {
  name = "${local.name_prefix}-api"
  tags = local.tags
}

resource "aws_ecr_repository" "web" {
  name = "${local.name_prefix}-web"
  tags = local.tags
}
