import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with correct credentials
const supabaseUrl = 'https://wvpxohkscgjwrykpxnoj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2cHhvaGtzY2dqd3J5a3B4bm9qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyODM3NiwiZXhwIjoyMDY1MzA0Mzc2fQ._S2AzGrYK1ZAU6EJDHC8ZJ1g0Ql1TxvXp6fPxnIAOk0';
const supabase = createClient(supabaseUrl, supabaseKey);

// Tables to inspect
const tables = [
  'website_blog',
  'carousel', 
  'Content Post Information',
  'technical_article_content'
];

async function inspectTables() {
  console.log('🔍 Starting database inspection...\n');
  
  for (const tableName of tables) {
    try {
      console.log(`\n📊 TABLE: ${tableName}`);
      console.log('=' + '='.repeat(tableName.length + 8));
      
      // Fetch sample data to understand the structure
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ Error fetching from ${tableName}:`, error.message);
        continue;
      }
      
      if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        console.log(`📋 COLUMNS (${columns.length} total):`);
        
        columns.forEach((column, index) => {
          const value = data[0][column];
          const type = typeof value;
          const preview = value ? String(value).substring(0, 100) + (String(value).length > 100 ? '...' : '') : 'null';
          
          console.log(`  ${index + 1}. ${column} (${type}): ${preview}`);
        });
        
        // Get total count
        const { count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
          
        console.log(`\n📈 Total records: ${count || 0}`);
      } else {
        console.log('📋 No data found in this table');
      }
      
    } catch (err) {
      console.error(`❌ Unexpected error with ${tableName}:`, err);
    }
  }
  
  console.log('\n✅ Database inspection complete!');
}

// Run the inspection
inspectTables().catch(console.error);
