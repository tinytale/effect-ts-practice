local cfn_output = std.native('cfn_output');
local stack_name = 'AuroraPracticeStack';
local port = cfn_output(stack_name, 'AppTgPort');

{
  desiredCount: 1,
  capacityProviderStrategy: [
    { capacityProvider: 'FARGATE_SPOT', weight: 1 },
  ],
  platformVersion: 'LATEST',
  enableExecuteCommand: true,
  networkConfiguration: {
    awsvpcConfiguration: {
      subnets: [
        cfn_output(stack_name, 'PublicSubnet1'),
        cfn_output(stack_name, 'PublicSubnet2'),
      ],
      securityGroups: [
        cfn_output(stack_name, 'EcsSecurityGroupId'),
      ],
      // assignPublicIp: "ENABLED",
    },
  },
  loadBalancers: [
    {
      containerName: 'app',
      targetGroupArn: cfn_output(stack_name, 'PreviewTargetGroupArn'),
      containerPort: std.parseInt(port),
    },
  ],
}
