// Placeholder KPI payload used only when Google Drive credentials are not
// configured, so the dashboard is demoable end-to-end. Clearly flagged as
// sample data in the UI — never mixed with live numbers.
export const SAMPLE_KPIS = {
  reportDate: "sample",
  note: "Sample data for layout preview — not real FINA metrics.",
  channels: {
    social: {
      metrics: [
        { label: "Followers", value: "8,412", delta: "+38", trend: "up", positive: true },
        { label: "Engagement rate", value: "4.6%", delta: "+0.4pp", trend: "up", positive: true },
        { label: "Impressions", value: "21.3K", delta: "-6.1%", trend: "down", positive: false },
      ],
      highlight: "Top post: \"How supervisors validate XBRL filings\" — 312 reactions",
    },
    website: {
      metrics: [
        { label: "Sessions", value: "3,904", delta: "+11.2%", trend: "up", positive: true },
        { label: "Conversion rate", value: "2.4%", delta: "+0.2pp", trend: "up", positive: true },
        { label: "Bounce rate", value: "41.8%", delta: "-1.9pp", trend: "down", positive: true },
      ],
      highlight: "Top landing page: /suptech-platform (organic, +3 positions on 'suptech software')",
    },
    paid: {
      metrics: [
        { label: "Spend", value: "€412", delta: "+2.0%", trend: "up", positive: false },
        { label: "CPC", value: "€1.86", delta: "-4.6%", trend: "down", positive: true },
        { label: "CTR", value: "1.9%", delta: "+0.1pp", trend: "up", positive: true },
        { label: "ROAS", value: "3.2x", delta: "+0.3", trend: "up", positive: true },
        { label: "Conversions", value: "17", delta: "+3", trend: "up", positive: true },
      ],
      highlight: "",
    },
    email: {
      metrics: [
        { label: "Open rate", value: "38.2%", delta: "+1.1pp", trend: "up", positive: true },
        { label: "CTR", value: "5.4%", delta: "-0.3pp", trend: "down", positive: false },
        { label: "List growth", value: "+64", delta: "+12", trend: "up", positive: true },
        { label: "Unsubscribes", value: "0.21%", delta: "flat", trend: "flat", positive: true },
      ],
      highlight: "",
    },
  },
};
