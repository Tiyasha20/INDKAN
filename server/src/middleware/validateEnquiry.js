const required = [
  "fullName",
  "companyName",
  "email",
  "phone",
  "country",
  "city",
  "buyerType",
  "category",
];
const maxLengths = {
  fullName: 100,
  companyName: 150,
  email: 254,
  phone: 30,
  country: 100,
  city: 100,
  buyerType: 40,
  category: 60,
  product: 120,
  quantity: 100,
  packaging: 120,
  message: 2000,
};

export function validateEnquiry(body) {
  const value = {};
  const errors = {};
  for (const [key, raw] of Object.entries(body || {})) {
    if (!(key in maxLengths)) continue;
    const clean = String(raw ?? "")
      .replace(/<[^>]*>/g, "")
      .trim();
    value[key] = clean;
    if (clean.length > maxLengths[key])
      errors[key] = `Must be ${maxLengths[key]} characters or fewer.`;
  }
  for (const key of required)
    if (!value[key]) errors[key] = "This field is required.";
  if (value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email))
    errors.email = "Enter a valid email address.";
  if (value.phone && !/^\+?[\d\s().-]{7,20}$/.test(value.phone))
    errors.phone = "Enter a valid phone number with country code.";
  return { value, errors };
}
