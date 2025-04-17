
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import { corsHeaders } from './utils/cors.ts';
import { validatePayload } from './utils/validation.ts';
import { AuthService } from './services/authService.ts';
import { CompanyService } from './services/companyService.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Get environment variables
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    return new Response(
      JSON.stringify({
        error: 'Server configuration error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
      console.log('Received payload:', JSON.stringify(body));
    } catch (e) {
      console.error('Error parsing request body:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate the payload
    const validation = validatePayload(body);
    if (!validation.valid || !validation.data) {
      console.error('Validation error:', validation.errorMessage);
      return new Response(
        JSON.stringify({ error: validation.errorMessage }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const userData = validation.data;
    console.log('Validated user data:', JSON.stringify(userData));

    // Check if user already exists
    const { data: existingUser } = await supabaseClient.auth.admin.getUserByEmail(userData.email);
    if (existingUser) {
      console.error('User already exists with this email:', userData.email);
      return new Response(
        JSON.stringify({ 
          error: 'A user with this email address has already been registered',
          status: 422,
          code: 'email_exists'
        }),
        {
          status: 422,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize services
    const authService = new AuthService(supabaseClient);
    const companyService = new CompanyService(supabaseClient);

    // PRIMARY OPERATION: Create user in Auth
    const authResult = await authService.registerUser(userData);
    
    if (!authResult.success || !authResult.userId) {
      console.error('Failed to create user in auth system:', authResult.error);
      return new Response(
        JSON.stringify({
          error: authResult.error || 'Failed to create user',
          status: authResult.status || 500,
        }),
        {
          status: authResult.status || 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('User created successfully with ID:', authResult.userId);

    // SECONDARY OPERATIONS: Track any errors for logging and response
    let secondaryErrors = [];

    // Associate with company if company_id is provided
    if (userData.company_id) {
      try {
        const companyResult = await companyService.associateUserWithCompany(
          authResult.userId,
          userData
        );
        
        if (!companyResult.success) {
          console.warn('Company association failed:', companyResult.error);
          secondaryErrors.push({
            operation: 'company_association',
            message: companyResult.error?.message || 'Unknown error in company association',
          });
        } else {
          console.log('User associated with company successfully');
        }
      } catch (e) {
        console.error('Exception in company association:', e);
        secondaryErrors.push({
          operation: 'company_association',
          message: e.message || 'Exception in company association',
        });
      }
    } else {
      console.log('No company_id provided, skipping company association');
    }

    // Add user to user_roles table
    try {
      const { error: roleError } = await supabaseClient
        .from('user_roles')
        .insert({
          user_id: authResult.userId,
          role: userData.role || 'customer'
        });

      if (roleError) {
        console.warn('Error adding user role:', roleError);
        secondaryErrors.push({
          operation: 'user_role_assignment',
          message: roleError.message || 'Error adding user role',
        });
      } else {
        console.log('User role assigned successfully');
      }
    } catch (roleError) {
      console.error('Exception adding user role:', roleError);
      secondaryErrors.push({
        operation: 'user_role_assignment',
        message: roleError.message || 'Exception adding user role',
      });
    }

    // Return success even if secondary operations failed
    return new Response(
      JSON.stringify({
        success: true,
        userId: authResult.userId,
        secondaryErrors: secondaryErrors.length > 0 ? secondaryErrors : undefined,
      }),
      {
        status: 200, // Always return 200 if primary operation succeeded
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unhandled exception in create-user function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
