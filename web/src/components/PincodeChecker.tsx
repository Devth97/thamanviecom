"use client";
import { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";

// Static pincode→city map for Karnataka + major metros (covers ~80% of orders)
const FAST_DELIVERY: Record<string, string> = {
  "574201": "Puttur", "574202": "Puttur", "574203": "Puttur",
  "575001": "Mangaluru", "575002": "Mangaluru", "575003": "Mangaluru",
  "575004": "Mangaluru", "575005": "Mangaluru", "575006": "Mangaluru",
  "574211": "Bantwal", "574219": "Belthangady", "574212": "Sullia",
  "560001": "Bengaluru", "560002": "Bengaluru", "560003": "Bengaluru",
  "560010": "Bengaluru", "560020": "Bengaluru", "560030": "Bengaluru",
  "560040": "Bengaluru", "560076": "Bengaluru", "560100": "Bengaluru",
  "570001": "Mysuru", "570002": "Mysuru", "570003": "Mysuru",
  "580001": "Hubballi", "580002": "Hubballi", "590001": "Belagavi",
  "400001": "Mumbai", "400002": "Mumbai", "400003": "Mumbai",
  "400050": "Mumbai", "400069": "Mumbai", "400070": "Mumbai",
  "110001": "Delhi", "110002": "Delhi", "110003": "Delhi",
  "110020": "Delhi", "110030": "Delhi", "110050": "Delhi",
  "600001": "Chennai", "600002": "Chennai", "600003": "Chennai",
  "600017": "Chennai", "600028": "Chennai", "600040": "Chennai",
  "500001": "Hyderabad", "500002": "Hyderabad", "500003": "Hyderabad",
  "500016": "Hyderabad", "500032": "Hyderabad", "500072": "Hyderabad",
  "411001": "Pune", "411002": "Pune", "411003": "Pune",
  "411014": "Pune", "411028": "Pune", "411048": "Pune",
  "380001": "Ahmedabad", "380006": "Ahmedabad", "380015": "Ahmedabad",
  "700001": "Kolkata", "700006": "Kolkata", "700019": "Kolkata",
};

function getDeliveryInfo(pincode: string): { city: string; days: string; type: "express" | "standard" | "unknown" } | null {
  if (!/^\d{6}$/.test(pincode)) return null;
  const city = FAST_DELIVERY[pincode];
  if (!city) {
    // State-level check by first 2 digits
    const prefix = pincode.slice(0, 2);
    const stateMap: Record<string, string> = {
      "56": "Karnataka", "57": "Karnataka", "58": "Karnataka", "59": "Karnataka",
      "40": "Maharashtra", "41": "Maharashtra",
      "11": "Delhi", "12": "Haryana",
      "60": "Tamil Nadu", "61": "Tamil Nadu",
      "50": "Telangana", "51": "Telangana",
      "70": "West Bengal",
      "38": "Gujarat", "39": "Gujarat",
    };
    const state = stateMap[prefix];
    if (state) return { city: state, days: "4–6 business days", type: "standard" };
    return { city: "your location", days: "5–8 business days", type: "standard" };
  }
  const isLocal = ["Puttur", "Bantwal", "Belthangady", "Sullia"].includes(city);
  if (isLocal) return { city, days: "1–2 business days", type: "express" };
  if (["Mangaluru", "Bengaluru", "Mysuru"].includes(city)) return { city, days: "2–3 business days", type: "express" };
  return { city, days: "3–5 business days", type: "standard" };
}

export default function PincodeChecker() {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<ReturnType<typeof getDeliveryInfo> | null>(null);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const check = () => {
    if (pincode.length !== 6) return;
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setResult(getDeliveryInfo(pincode));
      setChecked(true);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="border border-[#E8DDD0] rounded-lg p-4 bg-[#FAF6F0]">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="h-4 w-4 text-[#8B1A1A]" />
        <span className="text-sm font-semibold text-[#1A1A1A]">Check Delivery to Your Pincode</span>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={pincode}
          onChange={e => { setPincode(e.target.value.replace(/\D/g, "")); setChecked(false); }}
          onKeyDown={e => e.key === "Enter" && check()}
          placeholder="Enter 6-digit pincode"
          className="flex-1 border border-[#D4A96A] rounded px-3 py-2 text-sm outline-none focus:border-[#8B1A1A] bg-white"
        />
        <button
          onClick={check}
          disabled={pincode.length !== 6 || loading}
          className="px-4 py-2 bg-[#0D0808] text-white text-xs font-semibold rounded hover:bg-[#8B1A1A] transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
        </button>
      </div>

      {checked && result && (
        <div className={`mt-3 rounded-lg px-4 py-3 flex items-start gap-3 ${
          result.type === "express" ? "bg-[#E8F5E9] border border-[#4CAF50]/30" : "bg-[#FFF3E0] border border-[#FF9800]/30"
        }`}>
          <span className="text-xl shrink-0">{result.type === "express" ? "🚚" : "📦"}</span>
          <div>
            <p className={`text-sm font-semibold ${result.type === "express" ? "text-[#2E7D32]" : "text-[#E65100]"}`}>
              {result.type === "express" ? "Express Delivery Available!" : "Standard Delivery Available"}
            </p>
            <p className="text-xs text-[#555] mt-0.5">
              Delivers to <strong>{result.city}</strong> in <strong>{result.days}</strong>
            </p>
            <p className="text-xs text-[#888] mt-1">Free shipping · Open box return</p>
          </div>
        </div>
      )}

      {checked && !result && (
        <p className="mt-2 text-xs text-red-600">Please enter a valid 6-digit pincode.</p>
      )}
    </div>
  );
}
