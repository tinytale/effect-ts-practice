local cfn_output = std.native('cfn_output');
local stack_name = 'AuroraPracticeStack';
local port = cfn_output(stack_name, 'AppTgPort');

{
  family: 'task-def-debug-app',
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
      image: cfn_output(stack_name, 'RepoAppURI') + ':latest',
      portMappings: [
        {
          containerPort: std.parseInt(port),
          protocol: 'tcp',
        },
      ],
      environment: [
        { name: 'PORT', value: port },
        { name: 'HOSTNAME', value: '0.0.0.0' },
        { name: 'TZ', value: 'Asia/Tokyo' },
        { name: 'NODE_ENV', value: 'production' },
      ],
      secrets: [
        { name: 'DB_ENGINE', valueFrom: cfn_output(stack_name, 'DbSecretArn') + ':engine::' },
        { name: 'DB_HOST', valueFrom: cfn_output(stack_name, 'DbSecretArn') + ':host::' },
        { name: 'DB_PORT', valueFrom: cfn_output(stack_name, 'DbSecretArn') + ':port::' },
        { name: 'DB_USER', valueFrom: cfn_output(stack_name, 'DbSecretArn') + ':username::' },
        { name: 'DB_PASSWORD', valueFrom: cfn_output(stack_name, 'DbSecretArn') + ':password::' },
        { name: 'DB_NAME', valueFrom: cfn_output(stack_name, 'DbSecretArn') + ':dbname::' },
        { name: 'DB_SCHEMA', valueFrom: cfn_output(stack_name, 'DbSecretArn') + ':schema::' },
      ],
      essential: true,
      logConfiguration: {
        logDriver: 'awslogs',
        options: {
          'awslogs-group': cfn_output(stack_name, 'AppLogGroupName'),
          'awslogs-region': 'ap-northeast-1',
          'awslogs-stream-prefix': 'ecs',
        },
      },
    },
  ],
}
