function parseTranscript(transcript) {
  console.log('🔍 Full transcript:', transcript);
  
  // Find the confirmation message - this is where all the data is
  const confirmationMatch = transcript.match(/Let me (?:quickly )?confirm everything[:\s]+(.*?)(?:Is that correct\?|$)/is);
  
  if (!confirmationMatch) {
    console.log('❌ No confirmation message found');
    return null;
  }
  
  const confirmation = confirmationMatch[1];
  console.log('📝 Confirmation text:', confirmation);
  
  // Extract full name - VERY flexible
  const nameMatch = confirmation.match(/(?:Your name is|you're)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
  const fullName = nameMatch ? nameMatch[1].trim() : '';
  
  // Extract preferred name - handle "you go by", "goes by", etc.
  const preferredMatch = confirmation.match(/you\s+(?:go|goes)\s+by\s+([A-Za-z]+)/i);
  const preferredName = preferredMatch ? preferredMatch[1].trim() : '';
  
  // Extract DOB - ultra flexible for "born in April", "born April", etc.
  const dobMatch = confirmation.match(/born\s+(?:in\s+|on\s+)?([A-Za-z]+\s+(?:the\s+)?[\w\s,\-]+(?:nineteen|twenty)\s+[\w\s\-]+)/i);
  const dob = dobMatch ? dobMatch[1].trim() : '';
  
  // Extract phone - FIXED to grab everything between "Phone number is" and the next sentence
  const phoneMatch = confirmation.match(/[Pp]hone\s+(?:number\s+)?(?:is\s+)?([^.]+?)\.(?:\s+You)/i);
  let phone = '';
  if (phoneMatch) {
    // Get the entire matched phone string
    const phoneStr = phoneMatch[1];
    console.log('📞 Raw phone match:', phoneStr);
    
    // Convert all word numbers to digits and strip everything except digits
    phone = phoneStr
      .replace(/zero/gi, '0')
      .replace(/one/gi, '1')
      .replace(/two/gi, '2')
      .replace(/three/gi, '3')
      .replace(/four/gi, '4')
      .replace(/five/gi, '5')
      .replace(/six/gi, '6')
      .replace(/seven/gi, '7')
      .replace(/eight/gi, '8')
      .replace(/nine/gi, '9')
      .replace(/[^\d]/g, '') // Remove everything that's not a digit
      .trim();
    
    console.log('📞 Converted phone:', phone);
  }
  
  // Extract delivery day
  const dayMatch = confirmation.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+delivery/i);
  const deliveryDay = dayMatch ? dayMatch[1] : '';
  
  // Extract main meal - get ONLY the meal name, not "Wednesday delivery with"
  const mealMatch = confirmation.match(/delivery\s+with\s+([^.]+?)(?:\.|Meals|,|$)/i);
  let mainMeal = '';
  if (mealMatch) {
    mainMeal = mealMatch[1]
      .replace(/^(the|a|an)\s+/i, '')
      .trim();
  }
  
  // Extract delivery location - handle "at the front door, in an esky"
  const locationMatch = confirmation.match(/(?:left|delivered|placed)\s+(?:at\s+)?(?:the\s+)?([^.]+?esky|[^.]+?door|[^.]+?back\s+door)/i);
  let deliveryLocation = '';
  if (locationMatch) {
    deliveryLocation = locationMatch[1]
      .replace(/^(at|in|the)\s+/gi, '')
      .replace(/,?\s*in\s+an?\s+esky/i, ', in esky')
      .replace(/,?\s*at\s+the\s+/gi, '')
      .trim();
  }
  
  // Extract key safe code if mentioned
  const keySafeMatch = confirmation.match(/(?:code|key safe code|key code)(?:\s+is)?\s+(\d+)/i);
  const keySafeCode = keySafeMatch ? keySafeMatch[1] : '';
  
  // Extract pets - check for "no pets" first
  let pets = '';
  
  const noPetsMatch = confirmation.match(/No pets|no pet/i);
  
  if (!noPetsMatch) {
    // Try multiple pet patterns only if "no pets" wasn't found
    const petPatterns = [
      /(?:There(?:'s|\s+is)\s+(?:a\s+)?)(.*?(?:dog|cat|rottweiler|terrier|pet).*?)(?:\s+on\s+site)?[.,]/i,
      /(?:pet(?:s)?\s+(?:on\s+site)?[,:\s]+(?:a\s+)?)(.*?(?:dog|cat|rottweiler|terrier|pet)[^.,]*)/i,
      /(?:There(?:'s|\s+is)\s+(?:a\s+)?)(large.*?(?:dog|cat|rottweiler|terrier))/i
    ];
    
    for (const pattern of petPatterns) {
      const match = confirmation.match(pattern);
      if (match && match[1]) {
        pets = match[1]
          .replace(/^(a|an|the)\s+/i, '')
          .replace(/\s+on\s+site/i, '')
          .replace(/\s*[,.].*$/, '') // Remove everything after comma or period
          .trim();
        
        console.log('🐕 Pet match found:', pets);
        break;
      }
    }
  }
  
  // Extract allergies - handle "you have a nut allergy", "just nuts", "no allergies"
  const allergies = [];
  
  // Check for "no allergies"
  const noAllergiesMatch = confirmation.match(/(?:no\s+allergies|no\s+food\s+allergies)/i);
  
  if (!noAllergiesMatch) {
    // Look for specific allergies with flexible patterns
    const allergyPatterns = [
      /you\s+have\s+(?:a\s+)?(\w+)\s+allerg(?:y|ies)/i,
      /(?:just|only)\s+(\w+)/i,
      /allergic\s+to\s+(\w+)/i
    ];
    
    for (const pattern of allergyPatterns) {
      const match = confirmation.match(pattern);
      if (match && match[1] && !match[1].match(/no|none/i)) {
        allergies.push(match[1].trim());
        break; // Only take first match to avoid duplicates
      }
    }
  }
  
  console.log('✅ Parsed data:', {
    full_name: fullName,
    preferred_name: preferredName,
    dob: dob,
    phone: phone,
    delivery_day: deliveryDay,
    main_meal: mainMeal,
    delivery_location: deliveryLocation,
    key_safe_code: keySafeCode,
    pets: pets,
    allergies: allergies
  });
  
  return {
    full_name: fullName,
    preferred_name: preferredName,
    dob: dob,
    address: '',
    phone: phone,
    email: '',
    mac_number: '',
    allergies: allergies.filter(a => a && a.length > 0).map(a => a.trim()),
    dietary_needs: [],
    delivery_day: deliveryDay,
    main_meal: mainMeal,
    meal_size: '',
    delivery_location: deliveryLocation,
    key_safe_code: keySafeCode,
    pets: pets,
    emergency_name: '',
    emergency_relationship: '',
    emergency_phone: ''
  };
}

module.exports = { parseTranscript };
