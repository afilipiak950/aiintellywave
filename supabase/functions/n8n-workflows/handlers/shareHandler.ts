
import { corsHeaders } from "../corsHeaders.ts";
import { getSupabaseClient } from "../utils.ts";

export async function handleShare(workflowId: string, data: any) {
  console.log(`[n8n-workflows:share] Sharing workflow ${workflowId} with company ${data?.companyId}`);
  
  try {
    if (!workflowId) {
      throw new Error("No workflow ID provided");
    }
    
    if (!data || !data.companyId) {
      throw new Error("No company ID provided");
    }
    
    // Create a Supabase client (we don't have the request object here, so we use fake one)
    const fakeRequest = new Request("https://example.com", {
      headers: new Headers({
        authorization: data.authorization
      })
    });
    
    const supabase = await getSupabaseClient(fakeRequest);
    
    // Check if the workflow exists
    const { data: workflow, error: workflowError } = await supabase
      .from('n8n_workflows')
      .select('id')
      .eq('n8n_workflow_id', workflowId)
      .single();
    
    if (workflowError) {
      console.error(`[n8n-workflows:share] Error finding workflow:`, workflowError);
      throw new Error(`Workflow not found: ${workflowError.message}`);
    }
    
    // Check if the company exists
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('id', data.companyId)
      .single();
    
    if (companyError) {
      console.error(`[n8n-workflows:share] Error finding company:`, companyError);
      throw new Error(`Company not found: ${companyError.message}`);
    }
    
    // Check if this workflow is already shared with this company
    const { data: existingShare, error: existingShareError } = await supabase
      .from('customer_workflows')
      .select('id')
      .eq('workflow_id', workflow.id)
      .eq('company_id', data.companyId)
      .maybeSingle();
    
    if (existingShareError) {
      console.error(`[n8n-workflows:share] Error checking existing share:`, existingShareError);
      throw new Error(`Error checking existing share: ${existingShareError.message}`);
    }
    
    if (existingShare) {
      console.log(`[n8n-workflows:share] Workflow already shared with company ${data.companyId}`);
      return new Response(
        JSON.stringify({
          success: true,
          message: "Workflow is already shared with this company",
          shareId: existingShare.id
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Share the workflow with the company
    const { data: share, error: shareError } = await supabase
      .from('customer_workflows')
      .insert({
        workflow_id: workflow.id,
        company_id: data.companyId
      })
      .select()
      .single();
    
    if (shareError) {
      console.error(`[n8n-workflows:share] Error sharing workflow:`, shareError);
      throw new Error(`Error sharing workflow: ${shareError.message}`);
    }
    
    console.log(`[n8n-workflows:share] Successfully shared workflow ${workflowId} with company ${data.companyId}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Workflow shared successfully",
        share
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error("[n8n-workflows:share] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}
