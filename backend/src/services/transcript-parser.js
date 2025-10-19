function parseTranscript(transcript) {
  if (!transcript) return null;
  
  // Find confirmation message
  const confirmMatch = transcript.match(
    /Let me (?:quickly )?confirm everything[:\.]?\s+(.+?)(?:Is (?:all of )?that correct\?|Perfect!|Thank you|$)/si
  );
  
  if (!confirmMatch) {
    console.log('⚠️  No confirmation found');
    return null;
  }
  
  const confirmation = confirmMatch[1];
  console.log('📝 Confirmation text:', confirmation);
  
  // Extract each field with flexible patterns
  const fullName = confirmation.match(/(?:name is|Your name is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/)?.[1];
  const preferredName = confirmation.match(/(?:go by|you go by|prefer)\s+([A-Z][a-z]+)/)?.[1];
  
  // DOB - handle partial or full dates
  const dobMatch = confirmation.match(/born\s+([A-Za-z]+\s+\w+(?:,?\s+\d{4})?)/);
  const dob = dobMatch ? dobMatch[1] : '';
  
  // Phone - flexible format
  const phoneMatch = confirmation.match(/[Pp]hone(?:\s+number)?(?:\s+is)?\s+([\d\s\-\(\)]+?)(?:\.|,|\s+You|\s+chosen)/);
  const phone = phoneMatch ? phoneMatch[1].trim() : '';
  
  // Allergies - CRITICAL
  const allergies = [];
  const allergyMatch = confirmation.match(/(?:allerg(?:y|ies)|allergic to)\s+(?:to\s+)?([^,\.]+?)(?:\s+and\s+[Yy]ou|\.|\s+You've|\s+Is)/i);
  if (allergyMatch) {
    const allergyText = allergyMatch[1];
    allergies.push(...allergyText.split(/(?:\s+and\s+|,\s*)/));
  }
  
  // Delivery day
  const deliveryDay = confirmation.match(/(Monday|Tuesday|Wednesday|Thursday|Friday)/i)?.[1];
  
  // Main meal
  const mainMeal = confirmation.match(/(?:delivery with|chosen)\s+([^,\.]+?)(?:\.|,|\s+Meals|\s+and\s+[Nn]o)/)?.[1];
  
  // Delivery location - NEW
  const deliveryLocation = confirmation.match(/(?:left|leave|be left)\s+(?:at|on|in)\s+(?:the\s+)?([^,\.]+?)(?:\.|,|\s+[Nn]o|\s+and)/i)?.[1];
  
  // Pets - NEW
  let pets = '';
  const petsMatch = confirmation.match(/(?:pets?|dog|cat|animal)[\s:]+([^,\.]+?)(?:\.|,|\s+and\s+[Nn]o|\s+Is)/i);
  if (petsMatch) {
    pets = petsMatch[1].trim();
  } else if (/no pets/i.test(confirmation)) {
    pets = 'No';
  }
  
  // Key safe code
  const keySafeCode = confirmation.match(/(?:code|combination)(?:\s+is)?\s+(\d{3,6})/)?.[1];
  
  return {
    full_name: fullName || '',
    preferred_name: preferredName || fullName || '',
    dob: dob,
    address: '',
    phone: phone,
    email: '',
    mac_number: '',
    allergies: allergies.filter(a => a.length > 0),
    dietary_needs: [],
    delivery_day: deliveryDay || '',
    main_meal: (mainMeal || '').trim(),
    meal_size: '',
    delivery_location: deliveryLocation || '',
    key_safe_code: keySafeCode || '',
    pets: pets,
    emergency_name: '',
    emergency_relationship: '',
    emergency_phone: ''
  };
}

module.exports = { parseTranscript };
