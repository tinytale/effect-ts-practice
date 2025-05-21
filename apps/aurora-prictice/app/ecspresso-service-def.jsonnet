local cfn_output = std.native('cfn_output');
local stack_name = 'AuroraPracticeStack';
local port = cfn_output(stack_name, 'AppTgPort');

{
  desiredCount: 1,
  capacityProviderStrategy: [
    { capacityProvider: 'FARGATE_SPOT', weight: 1 },
  ],
  enableExecuteCommand: true,
  platformVersion: 'LATEST',
  networkConfiguration: {
    awsvpcConfiguration: {
      subnets: [
        cfn_output(stack_name, 'PrivateSubnet1'),
        cfn_output(stack_name, 'PrivateSubnet2'),
      ],
      securityGroups: [
        cfn_output(stack_name, 'EcsSecurityGroupId'),
      ],
      // assignPublicIp: 'ENABLED',
    },
  },
  loadBalancers: [
    {
      containerName: 'app',
      targetGroupArn: cfn_output(stack_name, 'TargetGroupArn'),
      containerPort: std.parseInt(port),
    },
  ],
}
