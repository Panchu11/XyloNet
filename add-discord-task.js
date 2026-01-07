// Script to add "Join Discord" task to Supabase
// Run this after setting up your Supabase environment variables

const DISCORD_TASK = {
  name: 'join_discord',
  description: 'Join XyloNet Discord Community',
  task_type: 'social',
  action_url: 'https://discord.gg/suuzwn8b44',
  points: 50
};

console.log('Discord Task Configuration:');
console.log(JSON.stringify(DISCORD_TASK, null, 2));
console.log('\n--- HOW TO ADD THIS TASK ---\n');
console.log('Option 1: Via Supabase Dashboard');
console.log('1. Go to your Supabase project dashboard');
console.log('2. Navigate to Table Editor > tasks table');
console.log('3. Click "Insert" > "Insert row"');
console.log('4. Fill in the values:');
console.log('   - name: join_discord');
console.log('   - description: Join XyloNet Discord Community');
console.log('   - task_type: social');
console.log('   - action_url: https://discord.gg/suuzwn8b44');
console.log('   - points: 50');
console.log('   - is_active: true');
console.log('5. Click "Save"');
console.log('\nOption 2: Via API (requires your app to be running)');
console.log('Run this curl command:\n');
console.log(`curl -X POST http://localhost:3000/api/tasks \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(DISCORD_TASK)}'`);
console.log('\nOption 3: Via Supabase SQL Editor');
console.log('Run this SQL query:\n');
console.log(`INSERT INTO tasks (name, description, task_type, action_url, points, is_active)
VALUES ('join_discord', 'Join XyloNet Discord Community', 'social', 'https://discord.gg/suuzwn8b44', 50, true);`);
