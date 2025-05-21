# ===== Config (上書き可能) =====
ACCOUNT        ?= 637423391958
REGION         ?= ap-northeast-1
PLATFORM       ?= linux/amd64
TAG            ?= latest
CONTEXT        ?= .

REPO_APP       ?= repo-aurora-serverless-practice-app
REPO_MIGRATE   ?= repo-aurora-serverless-practice-migrate

DOCKERFILE_APP     ?= Dockerfile.app
DOCKERFILE_MIGRATE ?= Dockerfile.migrate

# ecspresso
ECSPRESSO_APP_CONFIG     ?= config.yaml       
ECSPRESSO_MIGRATE_CONFIG ?= ../migrate/config.yaml  

ECR          := $(ACCOUNT).dkr.ecr.$(REGION).amazonaws.com
APP_URI      := $(ECR)/$(REPO_APP)
MIG_URI      := $(ECR)/$(REPO_MIGRATE)

# ===== Targets =====
.PHONY: help login app migrate build-app push-app build-migrate push-migrate all \
        deploy-app deploy-migrate publish-deploy-app publish-run-migrate migate-create-only

help:
	@echo "Usage:"
	@echo "  make app                     # build+push app image"
	@echo "  make migrate                 # build+push migrate image"
	@echo "  make deploy-app              # ecspresso deploy app (set image=TAG)"
	@echo "  make deploy-migrate          # ecspresso run migrate task (set image=TAG)"
	@echo "  make publish-deploy-app      # build+push app -> deploy"
	@echo "  make publish-run-migrate     # build+push migrate -> run task"
	@echo ""
	@echo "Args (override via CLI):"
	@echo "  TAG=latest PLATFORM=linux/arm64 REGION=ap-northeast-1 ACCOUNT=xxxxxxxxxxxx"
	@echo "  DOCKERFILE_APP=... DOCKERFILE_MIGRATE=..."
	@echo "  ECSPRESSO_APP_CONFIG=ecspresso/app.yaml ECSPRESSO_MIGRATE_CONFIG=ecspresso/migrate.yaml"

login:
	aws ecr get-login-password --region $(REGION) | docker login --username AWS --password-stdin $(ECR)

# ---- app image ----
build-app:
	docker build $(CONTEXT) --platform $(PLATFORM) -f $(DOCKERFILE_APP) -t $(APP_URI):$(TAG)

push-app:
	docker push $(APP_URI):$(TAG)

app: login build-app push-app

# ---- migrate image ----
build-migrate:
	docker build $(CONTEXT) --platform $(PLATFORM) -f $(DOCKERFILE_MIGRATE) -t $(MIG_URI):$(TAG)

push-migrate:
	docker push $(MIG_URI):$(TAG)

migrate: login build-migrate push-migrate

# ---- ecspresso deploy/run ----
deploy-app:
	$(ECSPRESSO) deploy --config $(ECSPRESSO_APP_CONFIG) \
		--image app=$(APP_URI):$(TAG) \
		--wait-until services-stable

# migate-create-only:
#    docker compose run --rm \
#    migrate-deploy \
#    sh -lc "prisma migrate dev --create-only --schema ./prisma/schema.prisma"

# 単発タスクとしてマイグレーション実行（タスク終了まで待つ）
deploy-migrate:
	$(ECSPRESSO) run --config $(ECSPRESSO_MIGRATE_CONFIG) \
		--image migrate=$(MIG_URI):$(TAG) \
		--wait-until tasks-stopped


# ---- combo ----
publish-deploy-app: app deploy-app
publish-run-migrate: migrate deploy-migrate

# ---- both images ----
all: publish-deploy-app publish-run-migrate