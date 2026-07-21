import { SearchableSelect } from "@/components/ui/searchable-select";

/**
 * Common world currencies with symbol, default INR.
 */
export const CURRENCIES = [
  { value: "INR", label: "INR — Indian Rupee (₹)", symbol: "₹" },
  { value: "USD", label: "USD — US Dollar ($)", symbol: "$" },
  { value: "GBP", label: "GBP — British Pound (£)", symbol: "£" },
  { value: "EUR", label: "EUR — Euro (€)", symbol: "€" },
  { value: "AED", label: "AED — UAE Dirham (د.إ)", symbol: "د.إ" },
  { value: "SGD", label: "SGD — Singapore Dollar (S$)", symbol: "S$" },
  { value: "AUD", label: "AUD — Australian Dollar (A$)", symbol: "A$" },
  { value: "CAD", label: "CAD — Canadian Dollar (C$)", symbol: "C$" },
  { value: "NZD", label: "NZD — New Zealand Dollar (NZ$)", symbol: "NZ$" },
  { value: "MYR", label: "MYR — Malaysian Ringgit (RM)", symbol: "RM" },
  { value: "ZAR", label: "ZAR — South African Rand (R)", symbol: "R" },
  { value: "KES", label: "KES — Kenyan Shilling (KSh)", symbol: "KSh" },
  { value: "NPR", label: "NPR — Nepalese Rupee (रू)", symbol: "रू" },
  { value: "PKR", label: "PKR — Pakistani Rupee (₨)", symbol: "₨" },
  { value: "LKR", label: "LKR — Sri Lankan Rupee (₨)", symbol: "₨" },
  { value: "BDT", label: "BDT — Bangladeshi Taka (৳)", symbol: "৳" },
  { value: "QAR", label: "QAR — Qatari Riyal (QR)", symbol: "QR" },
  { value: "SAR", label: "SAR — Saudi Riyal (SR)", symbol: "SR" },
  { value: "BHD", label: "BHD — Bahraini Dinar (BD)", symbol: "BD" },
  { value: "KWD", label: "KWD — Kuwaiti Dinar (KD)", symbol: "KD" },
  { value: "OMR", label: "OMR — Omani Rial (OR)", symbol: "OR" },
  { value: "JPY", label: "JPY — Japanese Yen (¥)", symbol: "¥" },
  { value: "CNY", label: "CNY — Chinese Yuan (¥)", symbol: "¥" },
];

export const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({ value: c.value, label: c.label }));

/** Get symbol for a currency code */
export function getCurrencySymbol(code) {
  return CURRENCIES.find((c) => c.value === code)?.symbol || code || "₹";
}

/**
 * CurrencySelect — Dropdown of common currencies, default INR.
 *
 * Props: value, onValueChange, placeholder, className, disabled, id
 */
export default function CurrencySelect({
  value = "INR",
  onValueChange,
  placeholder = "Select currency",
  className = "",
  disabled = false,
  id,
}) {
  return (
    <SearchableSelect
      id={id}
      value={value || "INR"}
      onValueChange={onValueChange}
      options={CURRENCY_OPTIONS}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    />
  );
}
