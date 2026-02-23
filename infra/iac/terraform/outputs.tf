output "ecs_cluster_name" {
  value = aws_ecs_cluster.this.name
}

output "api_ecr_repository_url" {
  value = aws_ecr_repository.api.repository_url
}

output "web_ecr_repository_url" {
  value = aws_ecr_repository.web.repository_url
}

output "log_group_name" {
  value = aws_cloudwatch_log_group.app.name
}
