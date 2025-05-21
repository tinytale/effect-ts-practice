local cfn_output = std.native('cfn_output');
local stack_name = 'AuroraPracticeStack';
local port = cfn_output(stack_name, 'AppTgPort');

{
  family: 'task-def-debug-jump',
  networkMode: 'awsvpc',
  cpu: '256',
  memory: '512',
  requiresCompatibilities: [
    'EC2',
  ],
  executionRoleArn: cfn_output(stack_name, 'TaskExecutionRole'),
  taskRoleArn: cfn_output(stack_name, 'TaskRole'),
  containerDefinitions: [
    {
      name: 'app',
      image: cfn_output(stack_name, 'RepoAppURI') + ':preview',
      portMappings: [
        {
          containerPort: std.parseInt(port),
          protocol: 'tcp',
        },
      ],
      environment: [
        { name: 'PORT', value: port },
        { name: 'HOSTNAME', value: '0.0.0.0' },
      ],
      essential: true,
      logConfiguration: {
        logDriver: 'awslogs',
        options: {
          'awslogs-group': cfn_output(stack_name, 'LogGroupName'),
          'awslogs-region': 'ap-northeast-1',
          'awslogs-stream-prefix': 'ecs',
        },
      },
    },
  ],
}
