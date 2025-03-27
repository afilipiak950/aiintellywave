
/**
 * Gmail API email retrieval functions
 */

/**
 * Fetches message list from Gmail API
 * @param accessToken Access token
 * @param count Number of messages to fetch
 * @returns Promise with message IDs
 */
export async function fetchMessageList(accessToken: string, count: number) {
  const gmailResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${count}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  const gmailData = await gmailResponse.json();
  
  if (gmailData.error) {
    throw new Error(`Gmail API error: ${gmailData.error.message}`);
  }
  
  return gmailData.messages?.slice(0, count).map((msg: any) => msg.id) || [];
}

/**
 * Fetches message details in batches
 * @param accessToken Access token
 * @param messageIds Message IDs
 * @returns Promise with email data
 */
export async function fetchMessageDetails(accessToken: string, messageIds: string[]) {
  const emailBatch = [];
  
  for (let i = 0; i < messageIds.length; i += 10) {
    const batch = messageIds.slice(i, i + 10);
    const batchPromises = batch.map(id => 
      fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }).then(res => res.json())
    );
    
    const batchResults = await Promise.all(batchPromises);
    emailBatch.push(...batchResults);
  }
  
  return emailBatch;
}

/**
 * Processes and formats email data
 * @param emails Raw email data
 * @returns Processed email data
 */
export function processEmails(emails: any[]) {
  return emails.map(email => {
    const headers = email.payload?.headers || [];
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
    const from = headers.find((h: any) => h.name === 'From')?.value || '';
    const to = headers.find((h: any) => h.name === 'To')?.value || '';
    const date = headers.find((h: any) => h.name === 'Date')?.value || '';
    
    // Extract email body (could be in different parts)
    let body = '';
    
    if (email.payload?.body && email.payload.body.data) {
      body = atob(email.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    } else if (email.payload?.parts) {
      const textPart = email.payload.parts.find((part: any) => 
        part.mimeType === 'text/plain' || part.mimeType === 'text/html'
      );
      
      if (textPart && textPart.body?.data) {
        body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      }
    }
    
    return {
      id: email.id,
      threadId: email.threadId,
      subject,
      from,
      to,
      date,
      body: body.substring(0, 10000), // Limit body size
    };
  });
}
