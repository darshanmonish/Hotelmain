const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envLocal.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || envVars.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSettings() {
  const newSettings = {
    "hotelName": "HOTEL VETRI VEL",
    "address": "No.87/92, VCV Road, R.S.Puram, Coimbatore - 641002.",
    "phone": "+91 9842999931, +91 9843999931"
  };

  console.log('Updating settings...');
  const { data, error } = await supabase
    .from('settings')
    .update(newSettings)
    .eq('id', 1);

  if (error) {
    console.error('Error updating settings:', error);
  } else {
    console.log('Settings updated successfully!');
  }
}

updateSettings();
