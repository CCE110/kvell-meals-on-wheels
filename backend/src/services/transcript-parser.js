function parseTranscript(transcript) {
  if (!transcript) {
    console.log('⚠️  No transcript provided');
    return null;
  }
  
  // Find confirmation message - handle multiple formats
  const confirmMatch = transcript.match(
    /Let me (?:quickly )?confirm everything[:\.]?\s+(.+?)(?:Is (?:all of )?that correct\?|Perfect!|Goodbye|$)/si
  );
  
  if (!confirmMatch) {
    console.log('⚠️  No confirmation found in transcript');
    return null;
  }
  
  const confirmation = confirmMatch[1];
  console.log('📝 Confirmation text:', confirmation);
  
  // Extract name - flexible pattern
  const nameMatch = confirmation.match(/(?:name is|Your name is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
  const fullName = nameMatch ? nameMatch[1].trim() : '';
  
  // Extract preferred name
  const prefMatch = confirmation.match(/(?:go by|you go by|prefer|known as)\s+([A-Z][a-z]+)/i);
  const preferredName = prefMatch ? prefMatch[1].trim() : fullName;
  
  // Extract DOB - very flexible
  const dobMatch = confirmation.match(/born\s+(?:in\s+|on\s+)?([A-Za-z]+\s+\w+(?:,?\s+\d{4})?)/i);
  const dob = dobMatch ? dobMatch[1].trim() : '';
  
  // Extract phone - handle various formats
  const phoneMatch = confirmation.match(/[Pp]hone(?:\s+number)?(?:\s+is)?\s+([\d\s\-\(\),]+?)(?:\.|,|\s+You)/);
  const phone = phoneMatch ? phoneMatch[1].replace(/[,\s]/g, '').trim() : '';
  
  // Extract allergies - multiple patterns
  const allergies = [];
  
  // Pattern 1: "you have a X allergy"
  let allergyMatch = confirmation.match(/you have (?:a\s+)?([a-z]+)\s+allerg(?:y|ies)/i);
  if (allergyMatch) {
    allergies.push(allergyMatch[1]);
  }
  
  // Pattern 2: "allergic to X"
  allergyMatch = confirmation.match(/allergic to\s+([^,\.]+?)(?:\.|,|\s+and\s+[Yy]ou)/i);
  if (allergyMatch && allergies.length === 0) {
    const items = allergyMatch[1].split(/(?:\s+and\s+|,\s*)/);
    allergies.push(...items);
  }
  
  // Pattern 3: "no allergies"
  if (/no allergies/i.test(confirmation)) {
    // Keep allergies empty
  }
  
  // Extract delivery day
  const dayMatch = confirmation.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i);
  const deliveryDay = dayMatch ? dayMatch[1] : '';
  
  // Extract main meal - flexible
  const mealMatch = confirmation.match(/(?:delivery with|chosen)\s+([^,\.]+?)(?:\.|,|\s+Meals|\s+will)/i);
  const mainMeal = mealMatch ? mealMatch[1].trim() : '';
  
  // Extract delivery location - flexible patterns
  let deliveryLocation = '';
  const locMatch = confirmation.match(/(?:left|leave|be left)\s+(?:at\s+)?(?:the\s+)?([^,\.]+?)(?:,\s+in\s+|\.|\s+There)/i);
  if (locMatch) {
    deliveryLocation = locMatch[1].trim();
    
    // Check if there's an "in X" part (like "in an esky")
    const inMatch = confirmation.match(/in\s+(?:an?\s+)?([^,\.]+?)(?:\.|,|\s+There)/i);
    if (inMatch && locMatch.index < inMatch.index) {
      deliveryLocation += ', in ' + inMatch[1].trim();
    }
  }
  
  // Extract pets - flexible
  let pets = '';
  const petsMatch = confirmation.match(/There\s+is\s+(?:a\s+)?([^,\.]+?)(?:\s+on\s+site)/i);
  if (petsMatch) {
    pets = petsMatch[1].trim();
  } else if (/no pets/i.test(confirmation)) {
    pets = 'No';
  }
  
  // Extract key safe code
  const codeMatch = confirmation.match(/(?:code|combination)(?:\s+is)?\s+(\d{3,6})/i);
  const keySafeCode = codeMatch ? codeMatch[1] : '';
  
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
