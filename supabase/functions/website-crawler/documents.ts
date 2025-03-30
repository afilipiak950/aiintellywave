
// Process document content
export function processDocumentContent(documents: any[]): string {
  let textContent = "\n\n--- UPLOADED DOCUMENTS ---\n";
  
  documents.forEach((doc, index) => {
    textContent += `\n\n--- DOCUMENT ${index + 1}: ${doc.name} ---\n${doc.content}`;
  });
  
  return textContent;
}
