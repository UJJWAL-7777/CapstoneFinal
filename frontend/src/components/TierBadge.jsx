const COLORS = {
  Bronze: "bg-[#a9744f]",
  Silver: "bg-[#8a94a6]",
  Gold: "bg-gradient-to-r from-[#c9a24b] to-[#d4b96a]",
  Platinum: "bg-gradient-to-r from-[#5b6b8c] to-[#7b8ba8]",
};

export default function TierBadge({ tier }) {
  return (
    <span className={`text-white text-[11px] font-sans font-bold px-2.5 py-0.5 rounded-full ${COLORS[tier] || "bg-ink-faint"}`}>
      {tier}
    </span>
  );
}
