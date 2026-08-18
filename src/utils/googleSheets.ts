export interface ContactFormData {
  fullName: string;
  phone: string;
  email: string;
  whatDoYouNeed: string;
  country: string;
  state: string;
  requirement: string;
}

export const NEED_OPTIONS = [
  'New Home construction',
  'Renovation / Remodeling',
  'Commercial Space',
  'BOQ Preparation',
  'Project Management',
  'E tender service',
  'DSC Registration',
  'Others'
] as const;

export const COUNTRIES = [
  'India',
  'United Arab Emirates',
  'United States',
  'United Kingdom',
  'Singapore',
  'Malaysia',
  'Saudi Arabia',
  'Qatar',
  'Oman',
  'Kuwait',
  'Bahrain',
  'Australia',
  'Canada',
  'Germany',
  'France',
  'Other'
];

export const INDIAN_STATES = [
  'Tamil Nadu',
  'Andhra Pradesh',
  'Karnataka',
  'Kerala',
  'Telangana',
  'Maharashtra',
  'Delhi (NCT)',
  'Gujarat',
  'Puducherry',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Madhya Pradesh',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Other State / UT'
];

export const INTERNATIONAL_REGIONS: Record<string, string[]> = {
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain', 'Other Emirate'],
  'United States': ['California', 'Texas', 'New York', 'Florida', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia', 'North Carolina', 'Washington', 'New Jersey', 'Virginia', 'Other State'],
  'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland', 'Greater London', 'Other Region'],
  'Singapore': ['Central Region', 'East Region', 'North Region', 'North-East Region', 'West Region', 'All Singapore'],
  'Malaysia': ['Kuala Lumpur', 'Selangor', 'Johor', 'Penang', 'Perak', 'Sabah', 'Sarawak', 'Other State'],
  'Saudi Arabia': ['Riyadh', 'Makkah / Jeddah', 'Eastern Province', 'Madinah', 'Other Province'],
  'Qatar': ['Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor', 'Other Municipality'],
  'Oman': ['Muscat', 'Dhofar', 'Al Batinah', 'Other Governorate'],
  'Kuwait': ['Al Asimah (Capital)', 'Hawalli', 'Farwaniya', 'Ahmadi', 'Other Governorate'],
  'Bahrain': ['Capital Governorate', 'Muharraq', 'Northern Governorate', 'Southern Governorate'],
  'Australia': ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania', 'Australian Capital Territory', 'Other'],
  'Canada': ['Ontario', 'British Columbia', 'Alberta', 'Quebec', 'Manitoba', 'Saskatchewan', 'Nova Scotia', 'Other Province'],
  'Germany': ['Bavaria', 'Berlin', 'North Rhine-Westphalia', 'Baden-Württemberg', 'Hesse', 'Other State'],
  'France': ['Île-de-France', 'Auvergne-Rhône-Alpes', 'Provence-Alpes-Côte d\'Azur', 'Occitanie', 'Other Region'],
  'Other': ['Overseas / International', 'Other Region', 'Not Specified']
};

export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbymRfoHsAbP-XeVt1zlQCmWr2-jzHidwUV-u_Y5nQNBN6xClhzzhMY7kV6iKoKXvjyz/exec';

/**
 * Sends contact enquiry data to Google Apps Script webhook (which writes to Google Spreadsheet).
 * Supports JSON, URLSearchParams, and FormData to guarantee compatibility with all Google Script doPost formats.
 */
export async function sendEnquiryToGoogleSheets(data: ContactFormData): Promise<{ success: boolean; message?: string }> {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const isoDate = new Date().toISOString();

  // Multi-key payload to match any column naming in the Google Spreadsheet / Apps Script
  const payload = {
    // Exact requested keys
    'Full Name': data.fullName,
    'Mobile Number': data.phone,
    'Phone': data.phone,
    'Email Address': data.email,
    'What do you need?': data.whatDoYouNeed,
    'Country': data.country,
    'Your State': data.state,
    'Tell us about your requirement': data.requirement,
    'Submission Date': timestamp,
    
    // CamelCase variants
    fullName: data.fullName,
    mobileNumber: data.phone,
    phone: data.phone,
    email: data.email,
    whatDoYouNeed: data.whatDoYouNeed,
    country: data.country,
    state: data.state,
    requirement: data.requirement,
    date: timestamp,
    timestamp: isoDate,
    
    // Standard CRM keys
    name: data.fullName,
    emailAddress: data.email,
    service: data.whatDoYouNeed,
    location: `${data.state}, ${data.country}`,
    message: data.requirement
  };

  let submittedToGoogle = false;

  // 1. Send via URL-encoded form data (Google Apps Script e.parameter) with no-cors
  try {
    const formBody = new URLSearchParams();
    Object.entries(payload).forEach(([key, val]) => {
      formBody.append(key, String(val));
    });

    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody.toString()
    });
    submittedToGoogle = true;
  } catch (err) {
    console.warn('URL-encoded POST to Google Sheets had a warning:', err);
  }

  // 2. Also attempt JSON post fallback if needed
  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });
    submittedToGoogle = true;
  } catch (err) {
    console.warn('JSON POST to Google Sheets warning:', err);
  }

  // 3. Save to local app backend & localStorage for admin panel visibility
  try {
    await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.fullName,
        phone: data.phone,
        email: data.email,
        service: data.whatDoYouNeed,
        country: data.country,
        state: data.state,
        requirement: data.requirement,
        message: `Phone: ${data.phone} | Country: ${data.country} | State: ${data.state} | Requirement: ${data.requirement}`
      })
    });
  } catch {
    // backend fallback
  }

  try {
    const existing = localStorage.getItem('lifehut_enquiries') || '[]';
    const parsed = JSON.parse(existing);
    parsed.unshift({
      id: 'enq_' + Date.now(),
      name: data.fullName,
      phone: data.phone,
      email: data.email,
      whatDoYouNeed: data.whatDoYouNeed,
      country: data.country,
      state: data.state,
      requirement: data.requirement,
      date: timestamp
    });
    localStorage.setItem('lifehut_enquiries', JSON.stringify(parsed));
  } catch {
    // local storage fallback
  }

  return { success: true };
}
