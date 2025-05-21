local cfn_output = std.native('cfn_output');
local stack_name = 'AuroraPracticeStack';

{
  desiredCount: 0,
  capacityProviderStrategy: [
    { capacityProvider: 'FARGATE_SPOT', weight: 1 },
  ],
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
      assignPublicIp: 'ENABLED',
    },
  },
}
