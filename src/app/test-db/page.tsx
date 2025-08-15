import { supabase } from '@/lib/supabase'

export default async function TestDBPage() {
  try {
    // Test database connection by querying the regions table
    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .limit(5)

    if (error) {
      throw error
    }

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
        
        {data && data.length > 0 ? (
          <div>
            <p className="text-green-600 mb-4">✅ Database connection successful!</p>
            <p className="mb-2">First 5 regions from database:</p>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        ) : (
          <div>
            <p className="text-green-600 mb-4">✅ Database connection successful!</p>
            <p className="text-yellow-600">No data found in regions table (this is expected if the table is empty)</p>
          </div>
        )}
      </div>
    )
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
        <p className="text-red-600 mb-4">❌ Database connection failed!</p>
        <div className="bg-red-50 p-4 rounded">
          <pre className="text-red-800">
            {error instanceof Error ? error.message : 'Unknown error'}
          </pre>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>Make sure to:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Set NEXT_PUBLIC_SUPABASE_URL in .env.local</li>
            <li>Set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local</li>
            <li>Ensure your Supabase project is running</li>
            <li>Check that the regions table exists</li>
          </ul>
        </div>
      </div>
    )
  }
}