local cfn_output = std.native('cfn_output');
local stack_name = 'AuroraPracticeStack';

{
  desiredCount: 0,
  capacityProviderStrategy: [
    {
      capacityProvider: 'FARGATE_SPOT',
      weight: 1,
    },
  ],
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
}
