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
  
  // More flexible patterns
  const fullName = confirmation.match(/(?:name is|Your name is)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/)?.[1];
  const preferredName = confirmation.match(/(?:go by|you go by|prefer)\s+([A-Z][a-z]+)/)?.[1];
  
  // DOB - handle partial dates
  const dobMatch = confirmation.match(/born\s+([A-Za-z]+\s+\w+(?:,?\s+\d{4})?)/);
  const dob = dobMatch ? dobMatch[1] : '';
  
  // Phone - more flexible
  const phoneMatch = confirmation.match(/[Pp]hone(?:\s+number)?(?:\s+is)?\s+([\d\s\-\(\)]+?)(?:\.|,|\s+You|\s+chosen)/);
  const phone = phoneMatch ? phoneMatch[1].trim() : '';
  
  // Allergies
  const allergies = [];
  const allergyMatch = confirmation.match(/(?:allerg(?:y|ies)|allergic to)\s+(?:to\s+)?([^,\.]+?)(?:\s+and\s+[Yy]ou|\.|\s+You've)/i);
  if (allergyMatch) {
    const allergyText = allergyMatch[1];
    allergies.push(...allergyText.split(/(?:\s+and\s+|,\s*)/));
  }
  
  // Delivery details
  const deliveryDay = confirmation.match(/(Monday|Tuesday|Wednesday|Thursday|Friday)/i)?.[1];
  const mainMeal = confirmation.match(/(?:delivery with|chosen)\s+([^,\.]+?)(?:\.|,|and\s+[Nn]o|$)/)?.[1];
  
  // Key safe code
  const keySafeCode = confirmation.match(/(?:code|combination)(?:\s+is)?\s+(\d{3,6})/)?.[1];
  
  return {
    full_name: fullName || '',
    preferred_name: preferredName || fullName || '',
    dob: dob,
    address: '', // Not in short version
    phone: phone,
    email: '',
    mac_number: '',
    allergies: allergies.filter(a => a.length > 0),
    dietary_needs: [],
    delivery_day: deliveryDay || '',
    main_meal: (mainMeal || '').trim(),
    meal_size: '',
    key_safe_code: keySafeCode || '',
    pets: '',
    emergency_name: '',
    emergency_relationship: '',
    emergency_phone: ''
  };
}

module.exports = { parseTranscript };
