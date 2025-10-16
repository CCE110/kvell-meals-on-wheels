// Parse data from the AI's confirmation message in the transcript

function parseTranscript(concatenatedTranscript) {
  if (!concatenatedTranscript) {
    console.log('⚠️  No transcript provided');
    return null;
  }
  
  // Find the confirmation message (starts with "Your name is" or "Let me quickly confirm")
  const confirmMatch = concatenatedTranscript.match(/(?:Your name is|Let me quickly confirm everything\.\s+Your name is)\s+(.+?)(?:\s+Is all of that correct\?|$)/s);
  
  if (!confirmMatch) {
    console.log('⚠️  Could not find confirmation message in transcript');
    return null;
  }
  
  const confirmation = confirmMatch[1];
  console.log('📝 Found confirmation:', confirmation.substring(0, 100) + '...');
  
  // Extract fields using regex
  const data = {
    full_name: extractField(confirmation, /(?:^|\s)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)(?:,|\s+but)/),
    preferred_name: extractField(confirmation, /(?:go by|but you go by)\s+([^,]+),/),
    dob: extractField(confirmation, /born\s+([^.]+?)(?:\.|,)/),
    address: extractField(confirmation, /address is\s+(.+?)(?:\.|,\s+Phone)/),
    phone: extractField(confirmation, /[Pp]hone number\s+([\d\s]+?)(?:,|\.|\s+email)/),
    email: extractField(confirmation, /email\s+([\w.]+@[\w.]+)/),
    mac_number: extractField(confirmation, /(?:My )?Aged Care number is\s+(AC[\s\d]+?)(?:\.|,)/),
    allergies: extractAllergies(confirmation),
    dietary_needs: extractDietaryNeeds(confirmation),
    delivery_day: extractField(confirmation, /(Monday|Tuesday|Wednesday|Thursday|Friday)\s+delivery/),
    main_meal: extractField(confirmation, /delivery with\s+([^,]+?)(?:,|\.|\s+regular|\s+small)/),
    meal_size: extractField(confirmation, /(regular|small)\s+size/) || 'regular',
    salad: extractField(confirmation, /size,?\s+([^,]+?Salad)/),
    juice: extractField(confirmation, /(apple|orange|tropical|pine\s+orange)\s+juice/i),
    snack_pack: extractField(confirmation, /snack pack\s+([AB])/),
    delivery_location: extractField(confirmation, /left\s+(?:on|at)\s+(?:the\s+)?([^,]+?)(?:,|\.|\s+key)/),
    key_safe_code: extractField(confirmation, /key safe code\s+([\d\s]+?)(?:\.|,)/),
    pets: extractField(confirmation, /(large.*?(?:Rottweiler|dog)|friendly dog|no pets)/i),
    emergency_name: extractField(confirmation, /[Ee]mergency contact is\s+([^,]+)/),
    emergency_relationship: extractField(confirmation, /is\s+([^,]+?),\s+(?:your\s+)?(?:wife|husband|son|daughter|friend)/),
    emergency_phone: extractField(confirmation, /(?:wife|husband|son|daughter|friend)(?:,|\s+at)\s+([\d\s]+?)(?:\.|,|$)/)
  };
  
  return data;
}

function extractField(text, regex) {
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

function extractAllergies(text) {
  const allergyMatch = text.match(/(?:You have|have)\s+(?:a\s+)?([^.]+?)\s+allergy/);
  if (!allergyMatch) return [];
  return [allergyMatch[1].trim()];
}

function extractDietaryNeeds(text) {
  const needs = [];
  if (/texture-modified/.test(text)) needs.push('Texture Modified');
  if (/diabetic/.test(text)) needs.push('Diabetic');
  if (/low fat/.test(text)) needs.push('Low Fat');
  return needs;
}

function calculateAge(dobString) {
  // dobString like "April thirtieth, nineteen sixty-seven"
  const monthMap = {
    'january': 0, 'february': 1, 'march': 2, 'april': 3,
    'may': 4, 'june': 5, 'july': 6, 'august': 7,
    'september': 8, 'october': 9, 'november': 10, 'december': 11
  };
  
  const match = dobString.match(/(\w+)\s+\w+,\s+nineteen\s+(\w+)/);
  if (!match) return 0;
  
  const month = monthMap[match[1].toLowerCase()];
  const yearMatch = match[2];
  
  // Convert word numbers to digits (simplified)
  const yearNums = {
    'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90,
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9
  };
  
  let year = 1900;
  const parts = yearMatch.split('-');
  parts.forEach(part => {
    if (yearNums[part]) year += yearNums[part];
  });
  
  const birthDate = new Date(year, month, 1);
  const age = new Date().getFullYear() - birthDate.getFullYear();
  return age;
}

module.exports = { parseTranscript, calculateAge };
