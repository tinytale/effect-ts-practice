local cfn_output = std.native('cfn_output');
local stack_name = 'AuroraPracticeStack';
local port = cfn_output(stack_name, 'AppTgPort');

{
  family: 'task-def-debug-jump',
  networkMode: 'awsvpc',
  cpu: '256',
  memory: '512',
  requiresCompatibilities: [
    'FARGATE',
  ],
  executionRoleArn: cfn_output(stack_name, 'TaskExecutionRole'),
  taskRoleArn: cfn_output(stack_name, 'TaskRole'),
  containerDefinitions: [
    {
      name: 'jump',
      image: 'public.ecr.aws/docker/library/busybox:latest',
      entryPoint: ['sh', '-c'],
      command: ['sleep ${SLEEP_SECONDS:-600}'],
      environment: [
        { name: 'SLEEP_SECONDS', value: '600' },  // デフォルト：5分
      ],
      essential: true,
      logConfiguration: {
        logDriver: 'awslogs',
        options: {
          'awslogs-group': cfn_output(stack_name, 'JumpLogGroupName'),
          'awslogs-region': 'ap-northeast-1',
          'awslogs-stream-prefix': 'ecs',
        },
      },
    },
  ],
}
