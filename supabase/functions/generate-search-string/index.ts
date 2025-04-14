
// Basic search string generation as a fallback
function generateBasicSearchString(text: string, type: string): string {
  // Extract all words from text
  const words = text.split(/[\s,.;:]+/).filter(word => word.length > 3);
  
  // Remove duplicates - case insensitive conversion
  const uniqueWords = Array.from(new Set(words.map(word => word.toLowerCase())))
    .map(lowerCaseWord => {
      // Find the original word with preserved casing
      const original = words.find(w => w.toLowerCase() === lowerCaseWord);
      return original || lowerCaseWord;
    });
  
  // Basic stopwords
  const stopwords = [
    "and", "the", "with", "from", "this", "that", "have", "been", "would", "there", "their",
    "nicht", "eine", "einer", "einen", "einem", "ein", "der", "die", "das", "sie", "und", 
    "für", "auf", "ist", "sind", "oder", "als", "dann", "nach", "durch", "über", "unter",
    "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between",
    "both", "but", "by", "can", "can't", "cannot", "could", "couldn't", "did", "didn't",
    "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for",
    "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having",
    "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him",
    "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in",
    "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most",
    "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only",
    "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", 
    "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than",
    "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", 
    "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those",
    "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd",
    "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's",
    "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", 
    "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your",
    "yours", "yourself", "yourselves"
  ];
  
  // Filter out stopwords (case insensitive)
  const filteredWords = uniqueWords.filter(word => !stopwords.includes(word.toLowerCase()));
  
  // Find potential skills and technologies
  const techAndSkillsPatterns = [
    /java\b/i, /javascript/i, /python/i, /c\+\+/i, /react/i, /node\.?js/i, /aws/i, /docker/i,
    /kubernetes/i, /sql/i, /nosql/i, /mongo/i, /php/i, /html/i, /css/i, /bootstrap/i, /jquery/i,
    /typescript/i, /angular/i, /vue/i, /golang/i, /ruby/i, /rust/i, /scala/i, /swift/i,
    /kotlin/i, /objective-c/i, /flutter/i, /react\s?native/i, /ios/i, /android/i, /azure/i,
    /gcp/i, /google\s?cloud/i, /firebase/i, /terraform/i, /jenkins/i, /ci\/cd/i, /git/i,
    /github/i, /jira/i, /agile/i, /scrum/i, /kanban/i, /waterfall/i, /devops/i, /sre/i,
    /machine\s?learning/i, /artificial\s?intelligence/i, /ai/i, /ml/i, /data\s?science/i,
    /big\s?data/i, /hadoop/i, /spark/i, /tableau/i, /power\s?bi/i, /excel/i, /sap/i,
    /erp/i, /crm/i, /salesforce/i, /dynamics/i, /oracle/i, /mysql/i, /postgresql/i,
    /redis/i, /cassandra/i, /blockchain/i, /crypto/i, /nft/i, /web3/i, /cloud/i, /saas/i,
    /paas/i, /iaas/i, /linux/i, /unix/i, /windows/i, /rest/i, /graphql/i, /api/i,
    /microservice/i, /architect/i, /design/i, /lead/i, /senior/i, /junior/i, /entry/i,
    /intern/i, /co-op/i, /bachelor/i, /master/i, /phd/i, /degree/i, /certification/i
  ];
  
  // Find job titles
  const jobTitlePatterns = [
    /developer/i, /engineer/i, /programmer/i, /architect/i, /analyst/i, /consultant/i,
    /manager/i, /director/i, /vp/i, /chief/i, /cto/i, /cio/i, /ceo/i, /cfo/i, /coo/i,
    /president/i, /founder/i, /co-founder/i, /owner/i, /specialist/i, /professional/i,
    /technician/i, /administrator/i, /admin/i, /support/i, /help\s?desk/i, /service/i,
    /sales/i, /marketing/i, /product/i, /project/i, /program/i, /hr/i, /human\s?resources/i,
    /recruiter/i, /talent/i, /acquisition/i, /finance/i, /accounting/i, /account/i,
    /executive/i, /assistant/i, /associate/i, /lead/i, /senior/i, /junior/i, /entry/i,
    /intern/i, /trainee/i, /graduate/i, /student/i, /professor/i, /teacher/i, /instructor/i,
    /coach/i, /mentor/i, /tutor/i, /writer/i, /editor/i, /journalist/i, /reporter/i,
    /designer/i, /graphic/i, /ui/i, /ux/i, /experience/i, /interface/i, /web/i, /mobile/i,
    /ios/i, /android/i, /game/i, /security/i, /network/i, /system/i, /database/i, /dba/i,
    /quality/i, /qa/i, /tester/i, /test/i, /devops/i, /sre/i, /reliability/i, /operations/i,
    /business/i, /intelligence/i, /data/i, /scientist/i, /analytics/i, /research/i,
    /legal/i, /lawyer/i, /attorney/i, /counsel/i, /paralegal/i, /medical/i, /doctor/i,
    /physician/i, /nurse/i, /surgeon/i, /therapist/i, /psychologist/i, /psychiatrist/i,
    /social\s?worker/i, /customer/i, /service/i, /success/i, /relations/i,
    /public/i, /community/i, /content/i, /communication/i, /driver/i, /operator/i, /technician/i,
    /finanzbuchalter/i, /buchhalter/i, /finanz/i, /steuer/i, /steuerfachangestellte/i
  ];
  
  // Find locations
  const locationPatterns = [
    /berlin/i, /münchen/i, /muenchen/i, /hamburg/i, /köln/i, /koeln/i, /frankfurt/i, 
    /stuttgart/i, /düsseldorf/i, /duesseldorf/i, /dortmund/i, /essen/i, /bremen/i, 
    /leipzig/i, /dresden/i, /hannover/i, /nürnberg/i, /nuernberg/i, /new\s?york/i, 
    /london/i, /paris/i, /tokyo/i, /singapore/i, /sydney/i, /toronto/i, /remote/i
  ];
  
  // Separate words into categories based on patterns
  const techAndSkills: string[] = [];
  const jobTitles: string[] = [];
  const locations: string[] = [];
  const otherWords: string[] = [];
  
  // Identify potential job titles, tech skills, and locations
  filteredWords.forEach(word => {
    let isTechOrSkill = false;
    let isJobTitle = false;
    let isLocation = false;
    
    // Check against tech/skills patterns
    for (const pattern of techAndSkillsPatterns) {
      if (pattern.test(word)) {
        techAndSkills.push(word);
        isTechOrSkill = true;
        break;
      }
    }
    
    // Check against job title patterns
    if (!isTechOrSkill) {
      for (const pattern of jobTitlePatterns) {
        if (pattern.test(word)) {
          jobTitles.push(word);
          isJobTitle = true;
          break;
        }
      }
    }
    
    // Check against location patterns
    if (!isTechOrSkill && !isJobTitle) {
      for (const pattern of locationPatterns) {
        if (pattern.test(word)) {
          locations.push(word);
          isLocation = true;
          break;
        }
      }
    }
    
    // If it's neither, add to other words
    if (!isTechOrSkill && !isJobTitle && !isLocation) {
      otherWords.push(word);
    }
  });
  
  // Take the most relevant words from each category
  const relevantTechAndSkills = techAndSkills.slice(0, 10);
  const relevantJobTitles = jobTitles.slice(0, 5);
  const relevantLocations = locations.slice(0, 3);
  const relevantOtherWords = otherWords.slice(0, 10);
  
  // Build search string based on type with proper Boolean logic
  let searchString = "";
  
  if (type === "recruiting") {
    // For recruiting, connect job titles, locations, and tech skills with AND
    const parts: string[] = [];
    
    // Add job titles with OR between similar roles
    if (relevantJobTitles.length > 0) {
      parts.push(relevantJobTitles.length > 1 ? 
        `(${relevantJobTitles.join(" OR ")})` : relevantJobTitles[0]);
    }
    
    // Add locations with OR between similar locations
    if (relevantLocations.length > 0) {
      parts.push(relevantLocations.length > 1 ? 
        `(${relevantLocations.join(" OR ")})` : relevantLocations[0]);
    }
    
    // Add skills with OR between similar skills
    if (relevantTechAndSkills.length > 0) {
      parts.push(relevantTechAndSkills.length > 1 ? 
        `(${relevantTechAndSkills.join(" OR ")})` : relevantTechAndSkills[0]);
    }
    
    // Add other relevant words
    if (relevantOtherWords.length > 0 && parts.length < 2) {
      parts.push(relevantOtherWords.length > 1 ? 
        `(${relevantOtherWords.join(" OR ")})` : relevantOtherWords[0]);
    }
    
    // Combine all parts with AND
    searchString = parts.join(" AND ");
    
    // Add recruiting-specific suffix
    searchString += ` AND ("resume" OR "CV" OR "curriculum vitae")`;
    
  } else { // lead_generation
    // For lead generation, focus on industry terms and job titles
    const parts: string[] = [];
    
    // Add industry/tech terms with OR between similar terms
    if (relevantTechAndSkills.length > 0) {
      parts.push(relevantTechAndSkills.length > 1 ? 
        `(${relevantTechAndSkills.join(" OR ")})` : relevantTechAndSkills[0]);
    }
    
    // Add locations
    if (relevantLocations.length > 0) {
      parts.push(relevantLocations.length > 1 ? 
        `(${relevantLocations.join(" OR ")})` : relevantLocations[0]);
    }
    
    // Add relevant words if we need more terms
    if (relevantOtherWords.length > 0 && parts.length < 2) {
      parts.push(relevantOtherWords.length > 1 ? 
        `(${relevantOtherWords.join(" OR ")})` : relevantOtherWords[0]);
    }
    
    // Combine all parts with AND
    searchString = parts.join(" AND ");
      
    // Add title filters for lead generation
    searchString += ' AND ("CEO" OR "CTO" OR "CIO" OR "CFO" OR "Director" OR "VP" OR "Vice President" OR "Head of" OR "Manager")';
  }
  
  return searchString;
}
