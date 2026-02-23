# Terraform FlyDea (esqueleto)

## Uso basico
```bash
cd infra/iac/terraform
terraform init
terraform plan -var-file=environments/dev.tfvars.example
```

## Escopo atual
- Cluster ECS base
- Repositorios ECR (`api`, `web`)
- CloudWatch Log Group
- Security Group da API

## Proximos incrementos
- ALB + listeners + certificados ACM
- Task definitions e ECS services (`api`, `web`, `geoserver`)
- Secrets Manager/SSM
- RDS/DocumentDB/Atlas private endpoint
