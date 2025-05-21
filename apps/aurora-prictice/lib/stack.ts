import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as dsql from "aws-cdk-lib/aws-dsql";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";
import * as rds from "aws-cdk-lib/aws-rds";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53_targets from "aws-cdk-lib/aws-route53-targets";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import type { Construct } from "constructs";

export class AuroraPracticeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "Vpc", {
      vpcName: "vpc-aurora-severless-practice",
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "public-subnet",
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: "private-subnet",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    const taskExecutionRole = new iam.Role(this, "EcsTaskExecutionRole", {
      roleName: "ecsTaskExecutionRole",
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });

    const repoApp = new ecr.Repository(this, "RepositoryApp", {
      repositoryName: "repo-aurora-serverless-practice-app",
      imageScanOnPush: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
      lifecycleRules: [
        {
          rulePriority: 1,
          description: "Keep only latest 3 images",
          maxImageCount: 3,
          tagStatus: ecr.TagStatus.ANY,
        },
      ],
    });
    repoApp.grantPull(taskExecutionRole);

    const repoMigrate = new ecr.Repository(this, "RepositoryMigrate", {
      repositoryName: "repo-aurora-serverless-practice-migrate",
      imageScanOnPush: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
      lifecycleRules: [
        {
          rulePriority: 1,
          description: "Keep only latest 3 images",
          maxImageCount: 3,
          tagStatus: ecr.TagStatus.ANY,
        },
      ],
    });
    repoMigrate.grantPull(taskExecutionRole);
    const repoJump = new ecr.Repository(this, "RepositoryJump", {
      repositoryName: "repo-aurora-serverless-practice-jump",
      imageScanOnPush: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
      lifecycleRules: [
        {
          rulePriority: 1,
          description: "Keep only latest 3 images",
          maxImageCount: 3,
          tagStatus: ecr.TagStatus.ANY,
        },
      ],
    });
    repoJump.grantPull(taskExecutionRole);

    const albSg = new ec2.SecurityGroup(this, "AlbSecurigyGroup", {
      vpc,
      allowAllOutbound: true,
    });
    albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), "Allow HTTP");
    albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), "Allow HTTPS");

    const ecsAppSg = new ec2.SecurityGroup(this, "EcsSg", {
      vpc,
      allowAllOutbound: true,
    });

    // const ecsSg = new ec2.SecurityGroup(this, "EcsSg", {
    //   vpc,
    //   allowAllOutbound: true,
    // });

    const AppTgPort = 8080;
    ecsAppSg.addIngressRule(
      albSg,
      ec2.Port.tcp(AppTgPort),
      "Allow ALB From App",
    );

    const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: "tiny-tale.com",
    });

    const wildcardCert = new acm.Certificate(this, "PreviewWildcardCert", {
      domainName: "*.debug.tiny-tale.com", //
      subjectAlternativeNames: ["debug.tiny-tale.com"], // ルートも追加
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    new cdk.CfnOutput(this, "WildcardCertArn", {
      value: wildcardCert.certificateArn,
    });

    const alb = new elbv2.ApplicationLoadBalancer(this, "ALB", {
      vpc,
      internetFacing: true,
      loadBalancerName: "alb-postgres-app",
      securityGroup: albSg,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });

    new route53.ARecord(this, "WildCardAlbAliasRecord", {
      zone: hostedZone,
      recordName: "*.debug",
      target: route53.RecordTarget.fromAlias(
        new route53_targets.LoadBalancerTarget(alb),
      ),
    });

    new route53.ARecord(this, "AlbAliasRecord", {
      zone: hostedZone,
      recordName: "debug",
      target: route53.RecordTarget.fromAlias(
        new route53_targets.LoadBalancerTarget(alb),
      ),
    });

    alb.addListener("ListenerHttp", {
      port: 80,
      defaultAction: elbv2.ListenerAction.redirect({
        protocol: "HTTPS",
        port: "443",
      }),
    });

    const listener = alb.addListener("ListenerHttps", {
      port: 443,
      certificates: [wildcardCert],
      open: true,
    });

    const targetGroup = new elbv2.ApplicationTargetGroup(this, "ECSFargateTG", {
      targetGroupName: "main",
      vpc,
      port: AppTgPort,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        path: "/hello",
        interval: cdk.Duration.seconds(5),
        timeout: cdk.Duration.seconds(2),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 2,
      },
    });

    const preview = new elbv2.ApplicationTargetGroup(
      this,
      "ECSFargatePreviewTG",
      {
        targetGroupName: "pr-0001",
        vpc,
        port: AppTgPort,
        protocol: elbv2.ApplicationProtocol.HTTP,
        targetType: elbv2.TargetType.IP,
        healthCheck: {
          path: "/hello",
          interval: cdk.Duration.seconds(5),
          timeout: cdk.Duration.seconds(2),
          healthyThresholdCount: 2,
          unhealthyThresholdCount: 2,
        },
      },
    );

    listener.addTargetGroups("ECS", {
      targetGroups: [targetGroup],
    });

    listener.addAction("RulePr0001", {
      priority: 10001, // 一意な数値にする
      conditions: [
        elbv2.ListenerCondition.hostHeaders(["pr-0001.debug.tiny-tale.com"]),
      ],
      action: elbv2.ListenerAction.forward([preview]),
    });

    const taskRole = new iam.Role(this, "EcsTaskRole", {
      roleName: "ecsTaskRole",
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });

    taskRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "ssmmessages:CreateControlChannel",
          "ssmmessages:CreateDataChannel",
          "ssmmessages:OpenControlChannel",
          "ssmmessages:OpenDataChannel",
        ],
        resources: ["*"],
      }),
    );

    const dbSg = new ec2.SecurityGroup(this, "DBSg", {
      vpc,
      allowAllOutbound: true,
    });

    dbSg.addIngressRule(ecsAppSg, ec2.Port.tcp(5432));

    const vpcEndpointSg = new ec2.SecurityGroup(this, "VpcEndpointSg", {
      vpc,
      allowAllOutbound: true,
    });

    vpcEndpointSg.addIngressRule(
      ecsAppSg,
      ec2.Port.tcp(443), // Secrets Manager は HTTPS (443)
      "Allow ECS task to access Secrets Manager endp",
    );

    vpc.addInterfaceEndpoint("SecretsManagerEndpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
      subnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [vpcEndpointSg],
    });

    vpc.addInterfaceEndpoint("EcrDockerEndpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [vpcEndpointSg],
      // privateDnsEnabled: true,
    });

    vpc.addInterfaceEndpoint("EcrApiEndpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.ECR,
      subnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [vpcEndpointSg],
      // privateDnsEnabled: true,
    });

    vpc.addInterfaceEndpoint("SsmEndpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.SSM,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [vpcEndpointSg],
      // privateDnsEnabled: true,
    });

    vpc.addInterfaceEndpoint("SsmMessagesEndpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.SSM_MESSAGES,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [vpcEndpointSg],
      // privateDnsEnabled: true,
    });

    vpc.addInterfaceEndpoint("Ec2MessagesEndpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.EC2_MESSAGES,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [vpcEndpointSg],
    });

    vpc.addInterfaceEndpoint("CloudWatchLogsEndpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
      subnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [vpcEndpointSg],
    });

    vpc.addGatewayEndpoint("S3GatewayEndpoint", {
      service: ec2.GatewayVpcEndpointAwsService.S3,
      subnets: [{ subnetType: ec2.SubnetType.PRIVATE_ISOLATED }],
    });

    // vpc.addGatewayEndpoint("DynamoDbGatewayEndpoint", {
    //   service: ec2.GatewayVpcEndpointAwsService.DYNAMODB,
    //   subnets: [{ subnetType: ec2.SubnetType.PRIVATE_ISOLATED }],
    // });

    const dbSecret = new Secret(this, "DBSecret", {
      secretName: "debug-aurora-serverelss",
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: "dbuser",
          dbname: "postgres",
          engine: "postgres",
          schema: "app",
        }),
        generateStringKey: "password",
        excludeCharacters: ":/?#[]@!$&'()*+,;~=%\"\\",
      },
    });
    dbSecret.grantRead(taskExecutionRole);

    const clusterParameterGroup = new rds.ParameterGroup(
      this,
      "ClusterParamGroup",
      {
        engine: rds.DatabaseClusterEngine.auroraPostgres({
          version: rds.AuroraPostgresEngineVersion.VER_17_5,
        }),
        parameters: {
          timezone: "UTC",
          log_min_duration_statement: "500",
          // log_statement: "ddl",
          // log_connections: "1",
          // log_disconnections: "1",
          // log_checkpoints: "1",
          // log_lock_waits: "1",
          // work_mem: "8MB",
          // maintenance_work_mem: "128MB",
          // idle_in_transaction_session_timeout: "30000",
          // statement_timeout: "60000",
          // track_activity_query_size: "4096",
          // log_temp_files: "0",
          // temp_file_limit: "524288000",
        },
      },
    );
    const aurora = new rds.DatabaseCluster(this, "AuroraCluster", {
      clusterIdentifier: "aurora-severless-debug",
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_17_5,
      }),
      credentials: rds.Credentials.fromSecret(dbSecret),
      serverlessV2MinCapacity: 0,
      serverlessV2MaxCapacity: 1,
      backup: {
        retention: cdk.Duration.days(1),
      },
      serverlessV2AutoPauseDuration: cdk.Duration.minutes(5),
      writer: rds.ClusterInstance.serverlessV2("Writer"),
      parameterGroup: clusterParameterGroup,
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      cloudwatchLogsRetention: cdk.aws_logs.RetentionDays.ONE_DAY,
      defaultDatabaseName: "postgres",
      securityGroups: [dbSg],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const cluster = new ecs.Cluster(this, "FargateCluster", {
      clusterName: "auror-serverless-debug",
      vpc,
    });
    cluster.enableFargateCapacityProviders();

    const appLogGroup = new logs.LogGroup(this, "EcsAppLogGroup", {
      logGroupName: "/ecs/example-app",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.ONE_WEEK,
    });
    appLogGroup.grantWrite(taskExecutionRole);

    const migrateLogGroup = new logs.LogGroup(this, "EcsMigrateLogGroup", {
      logGroupName: "/ecs/example-migrate",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.ONE_WEEK,
    });
    migrateLogGroup.grantWrite(taskExecutionRole);

    const jumpLogGroup = new logs.LogGroup(this, "EcsJumpLogGroup", {
      logGroupName: "/ecs/example-jump",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.ONE_WEEK,
    });
    jumpLogGroup.grantWrite(taskExecutionRole);

    new cdk.CfnOutput(this, "AppTgPort", {
      value: AppTgPort.toString(),
    });

    new cdk.CfnOutput(this, "DbSecretArn", {
      value: dbSecret.secretArn,
    });

    new cdk.CfnOutput(this, "PreviewTargetGroupArn", {
      value: preview.targetGroupArn,
    });

    new cdk.CfnOutput(this, "RepoAppURI", {
      value: repoApp.repositoryUri,
    });

    new cdk.CfnOutput(this, "RepoMigrateURI", {
      value: repoMigrate.repositoryUri,
    });

    new cdk.CfnOutput(this, "RepoJumpURI", {
      value: repoJump.repositoryUri,
    });

    new cdk.CfnOutput(this, "AppLogGroupName", {
      value: appLogGroup.logGroupName,
    });

    new cdk.CfnOutput(this, "MigrateLogGroupName", {
      value: migrateLogGroup.logGroupName,
    });
    new cdk.CfnOutput(this, "JumpLogGroupName", {
      value: jumpLogGroup.logGroupName,
    });

    /// ecspressoで参照する
    new cdk.CfnOutput(this, "ClusterName", {
      value: cluster.clusterName,
    });

    new cdk.CfnOutput(this, "TaskExecutionRole", {
      value: taskExecutionRole.roleArn,
    });

    new cdk.CfnOutput(this, "TaskRole", {
      value: taskRole.roleArn,
    });

    new cdk.CfnOutput(this, "TargetGroupArn", {
      value: targetGroup.targetGroupArn,
    });

    new cdk.CfnOutput(this, "EcsSecurityGroupId", {
      value: ecsAppSg.securityGroupId,
    });

    vpc.publicSubnets.forEach((subnet, i) => {
      new cdk.CfnOutput(this, `PublicSubnet${i + 1}`, {
        value: subnet.subnetId,
      });
    });

    vpc.isolatedSubnets.forEach((subnet, i) => {
      new cdk.CfnOutput(this, `PrivateSubnet${i + 1}`, {
        value: subnet.subnetId,
      });
    });
  }
}
