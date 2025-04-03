
// Simplified Supabase client implementation for edge function
export function createClient(url: string, key: string, options?: any) {
  const headers = { 'X-Client-Info': 'supabase-js/2.0.0' };
  
  return {
    from: (table: string) => ({
      select: (columns?: string) => {
        let query = { table, columns };
        
        return {
          eq: (column: string, value: any) => {
            query = { ...query, filter: { column, value, operator: 'eq' } };
            return {
              maybeSingle: async () => {
                const result = await executeQuery({ ...query, isSingle: true, maybeSingle: true });
                return { data: result.data?.[0] || null, error: result.error };
              },
              single: async () => {
                const result = await executeQuery({ ...query, isSingle: true });
                return { data: result.data?.[0], error: result.error };
              }
            };
          },
          maybeSingle: async () => {
            const result = await executeQuery({ ...query, isSingle: true, maybeSingle: true });
            return { data: result.data?.[0] || null, error: result.error };
          }
        };
      },
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            single: async () => {
              const result = await executeQuery({ 
                table, 
                data, 
                filter: { column, value, operator: 'eq' }, 
                method: 'PATCH',
                isSingle: true 
              });
              return { data: result.data?.[0], error: result.error };
            }
          })
        })
      }),
      insert: (data: any) => ({
        select: () => ({
          single: async () => {
            const result = await executeQuery({ 
              table, 
              data, 
              method: 'POST',
              isSingle: true 
            });
            return { data: result.data?.[0], error: result.error };
          }
        })
      })
    }),
    auth: {
      setSession: async () => ({})
    }
  };
  
  async function executeQuery(query: any) {
    try {
      const endpoint = `${url}/rest/v1/${query.table}${query.columns ? `?select=${query.columns}` : ''}`;
      
      let requestInit = {
        method: query.method || 'GET',
        headers: {
          ...headers,
          'Authorization': `Bearer ${key}`,
          'apikey': key,
          'Content-Type': 'application/json',
          'Prefer': query.isSingle && !query.maybeSingle ? 'return=representation,count=exact' : 'return=representation'
        },
        body: undefined as string | undefined
      };
      
      // Add body for POST/PATCH requests
      if (['POST', 'PATCH'].includes(requestInit.method) && query.data) {
        requestInit.body = JSON.stringify(query.data);
      }
      
      // Add filter for specific queries
      let finalEndpoint = endpoint;
      if (query.filter) {
        const { column, value, operator } = query.filter;
        if (operator === 'eq') {
          finalEndpoint += finalEndpoint.includes('?') 
            ? `&${column}=eq.${value}` 
            : `?${column}=eq.${value}`;
        }
      }
      
      console.log(`[n8n-workflows:db] Executing ${requestInit.method} request to ${finalEndpoint}`);
      const response = await fetch(finalEndpoint, requestInit);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[n8n-workflows:db] Supabase error: ${response.status} ${errorText}`);
        return { 
          data: null, 
          error: { message: `Supabase error: ${response.status} ${errorText}` } 
        };
      }
      
      const data = await response.json();
      return { data: Array.isArray(data) ? data : [data], error: null };
    } catch (error: any) {
      console.error('[n8n-workflows:db] Error executing query:', error);
      return { data: null, error: { message: error.message } };
    }
  }
}
