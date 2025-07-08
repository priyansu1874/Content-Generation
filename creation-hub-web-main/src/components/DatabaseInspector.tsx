import React, { useState, useEffect } from 'react';
import { supabase } from '@/config/supabaseClient';

interface TableInfo {
  name: string;
  columns: string[];
  sampleData: Record<string, any> | null;
  totalRecords: number;
  error?: string;
}

const DatabaseInspector: React.FC = () => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const tablesToInspect = [
    'website_blog',
    'carousel', 
    'Content Post Information',
    'technical_article_content'
  ];

  useEffect(() => {
    const inspectTables = async () => {
      const results: TableInfo[] = [];
      
      for (const tableName of tablesToInspect) {
        try {
          console.log(`Inspecting table: ${tableName}`);
          
          // Fetch sample data
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (error) {
            results.push({
              name: tableName,
              columns: [],
              sampleData: null,
              totalRecords: 0,
              error: error.message
            });
            continue;
          }
          
          // Get total count
          const { count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
          
          const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
          
          results.push({
            name: tableName,
            columns,
            sampleData: data && data.length > 0 ? data[0] : null,
            totalRecords: count || 0
          });
          
        } catch (err) {
          results.push({
            name: tableName,
            columns: [],
            sampleData: null,
            totalRecords: 0,
            error: err instanceof Error ? err.message : 'Unknown error'
          });
        }
      }
      
      setTables(results);
      setLoading(false);
    };

    inspectTables();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Database Inspector</h1>
        <div className="text-center">Loading database structure...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Database Inspector</h1>
      
      {tables.map((table, index) => (
        <div key={index} className="mb-8 p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">
            📊 {table.name}
          </h2>
          
          {table.error ? (
            <div className="text-red-600 mb-4">
              ❌ Error: {table.error}
            </div>
          ) : (
            <>
              <div className="mb-4">
                <strong>Total Records:</strong> {table.totalRecords}
              </div>
              
              <div className="mb-4">
                <strong>Columns ({table.columns.length}):</strong>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                  {table.columns.map((column, colIndex) => (
                    <div key={colIndex} className="bg-gray-100 px-3 py-1 rounded text-sm">
                      {column}
                    </div>
                  ))}
                </div>
              </div>
              
              {table.sampleData && (
                <div className="mb-4">
                  <strong>Sample Data:</strong>
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    {Object.entries(table.sampleData).map(([key, value], dataIndex) => (
                      <div key={dataIndex} className="flex">
                        <div className="w-48 font-semibold text-gray-700 bg-gray-50 px-3 py-2 rounded-l border-r">
                          {key}
                        </div>
                        <div className="flex-1 px-3 py-2 bg-white border rounded-r text-sm">
                          {value === null ? (
                            <span className="text-gray-400 italic">null</span>
                          ) : typeof value === 'object' ? (
                            <pre className="text-xs overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
                          ) : (
                            <span className="break-all">
                              {String(value).length > 200 
                                ? String(value).substring(0, 200) + '...' 
                                : String(value)
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default DatabaseInspector;
