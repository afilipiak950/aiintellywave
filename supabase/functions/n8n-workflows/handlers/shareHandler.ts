
import { corsHeaders } from "../corsHeaders.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// Function to share workflows with companies
export async function handleShareWorkflow(
  supabase: SupabaseClient, 
  workflowId: string, 
  data: any
) {
  try {
    console.log(`[n8n-workflows] Sharing workflow ${workflowId} with company ${data.companyId}`);
    
    // First verify the workflow exists
    const { data: workflow, error: workflowError } = await supabase
      .from('n8n_workflows')
      .select('*')
      .eq('n8n_workflow_id', workflowId)
      .limit(1)
      .single();
      
    if (workflowError) {
      console.error(`[n8n-workflows] Error finding workflow: ${workflowError.message}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Workflow not found: ${workflowError.message}`
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404
        }
      );
    }
    
    // Check if company exists
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', data.companyId)
      .limit(1)
      .single();
      
    if (companyError) {
      console.error(`[n8n-workflows] Error finding company: ${companyError.message}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Company not found: ${companyError.message}`
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404
        }
      );
    }
    
    // Check if share relationship already exists
    const { data: existingShare, error: shareCheckError } = await supabase
      .from('customer_workflows')
      .select('*')
      .eq('workflow_id', workflow.id)
      .eq('company_id', data.companyId)
      .limit(1);
      
    if (shareCheckError) {
      console.error(`[n8n-workflows] Error checking existing share: ${shareCheckError.message}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to check existing shares: ${shareCheckError.message}`
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        }
      );
    }
    
    if (existingShare && existingShare.length > 0) {
      // Already shared, update the share if needed
      const { error: updateError } = await supabase
        .from('customer_workflows')
        .update({ 
          updated_at: new Date().toISOString(),
          active: true
        })
        .eq('id', existingShare[0].id);
        
      if (updateError) {
        console.error(`[n8n-workflows] Error updating share: ${updateError.message}`);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Failed to update share: ${updateError.message}`
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Workflow already shared with ${company.name}. Share has been updated.`,
          share: existingShare[0]
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    } else {
      // Create new share
      const { data: newShare, error: insertError } = await supabase
        .from('customer_workflows')
        .insert([{
          workflow_id: workflow.id,
          company_id: data.companyId,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
        
      if (insertError) {
        console.error(`[n8n-workflows] Error creating share: ${insertError.message}`);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Failed to create share: ${insertError.message}`
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Workflow successfully shared with ${company.name}`,
          share: newShare
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }
    
  } catch (error: any) {
    console.error(`[n8n-workflows] Share error: ${error.message}`);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
}
