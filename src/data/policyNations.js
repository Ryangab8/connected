// Policy delivery data per UK/Ireland nation.
// policyScore = current 2024 delivery score; required = score needed to meet stated commitments.
// The gap is the story.
// Sources: Nature Recovery Scotland 2024 review; OEP Jan 2024; Welsh Gov SFS consultation;
// NI Audit Office 2024; NPWS Ireland 2024.
export const NATIONS = [
  {
    id:'scotland', name:'Scotland', flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', color:'#1e4d8c', rating:'strong', ratingLabel:'Strongest',
    center:[57.0,-4.2], zoom:6,
    policyScore:78, required:95, protectedPct:18.4, carbonGt:4.2,
    keyPolicies:'Scottish Biodiversity Strategy to 2045. Natural Environment Bill 2025 — statutory targets (first in UK). Peatland ACTION: 65,000ha restored of 250,000ha target. £65M Nature Restoration Fund. South of Scotland Golden Eagle Project.',
    gap:'Gap of 17 points. AECS chronically underfunded (£29.6M vs £55M peak). Capercaillie still on path to extinction. Grouse moor persecution blocking raptor recovery.',
    trajectory:'Best positioned of all 5 nations — but still needs significant acceleration to reach its own targets.'
  },
  {
    id:'england', name:'England', flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', color:'#2d6e3e', rating:'moderate', ratingLabel:'Moderate',
    center:[52.5,-1.5], zoom:6,
    policyScore:55, required:85, protectedPct:2.83, carbonGt:1.2,
    keyPolicies:'Environment Act 2021 — legally binding species abundance target (halt decline by 2030, reverse by 2042). ELM replacing CAP. CSHT: 65,400 agreements. But SFI closed abruptly March 2025, creating immediate funding gap.',
    gap:'Gap of 30 points. Only 2.83% of land currently qualifies for 30by30 — among lowest in UK. OEP confirmed "largely off track" Jan 2024. SFI closure threatens farmland recovery.',
    trajectory:'Off track. Legally binding targets without funding mechanisms to deliver them.'
  },
  {
    id:'wales', name:'Wales', flag:'🏴󠁧󠁢󠁷󠁬󠁳󠁿', color:'#8b1a1a', rating:'moderate', ratingLabel:'Moderate',
    center:[52.1,-3.8], zoom:7,
    policyScore:52, required:82, protectedPct:9.2, carbonGt:0.55,
    keyPolicies:'Environment (Wales) Act 2016 — Section 6 biodiversity duty on public bodies. Habitat Wales Scheme (interim). Sustainable Farming Scheme delayed to 2026. 30by30 framework published 2025. LIFE Quaking Bogs peatland restoration.',
    gap:'Gap of 30 points. SFS delay leaving agri-env funding gap. No capital support for new wildflower meadow creation. Upland overgrazing continues unaddressed.',
    trajectory:'Behind schedule. Curlew near-extinct. Seagrass restoration promising but at small scale.'
  },
  {
    id:'ni', name:'N. Ireland', flag:'🇬🇧', color:'#5c3d7a', rating:'weak', ratingLabel:'Weakest',
    center:[54.7,-6.6], zoom:7,
    policyScore:28, required:70, protectedPct:5.1, carbonGt:0.3,
    keyPolicies:'First Environment Improvement Plan published Sept 2024 (14 months late). Draft Nature Recovery Strategy 2024–2032 in consultation. No statutory biodiversity targets yet in law. Rathlin LIFE Raft seabird project active.',
    gap:'Gap of 42 points — the largest of any nation. Ranked 12th worst globally for biodiversity intactness. No ELM/SFS equivalent. Rivers among most polluted in UK. Lough Neagh suffering catastrophic algae crisis from agricultural run-off.',
    trajectory:'Most urgent case. Without statutory targets, the legal framework to compel action does not exist.'
  },
  {
    id:'ireland', name:'Rep. of Ireland', flag:'🇮🇪', color:'#1e6b6b', rating:'moderate', ratingLabel:'Moderate',
    center:[53.2,-8.0], zoom:6,
    policyScore:60, required:85, protectedPct:14.4, carbonGt:1.1,
    keyPolicies:'4th NBAP 2023–2030 on statutory footing. ACRES: €1.5bn, 54,000+ farmers, 1.1M ha. EU Nature Restoration Regulation binding. Wild Atlantic Nature RBPS — results-based payments for biodiversity. Burren Beo project internationally recognised.',
    gap:'Gap of 25 points. 85% of EU-protected habitats in bad/inadequate condition. €700M annual investment gap identified. Curlew near-extinct as breeder. Raised bogs 99% lost.',
    trajectory:'Strong policy intent; significant investment gap. EU Nature Restoration Regulation provides binding external accountability.'
  }
];

export const TYPE_COLOR = {
  peatland:'#5c3d7a', woodland:'#2d5016', freshwater:'#1e4d8c',
  heathland:'#c8760a', grassland:'#7ab648', coastal:'#1e6b6b', marine:'#2a5f8a'
};

export const NATION_COLOR = {
  Scotland:'#1e4d8c', 'N. Ireland':'#5c3d7a', England:'#2d6e3e', Wales:'#8b1a1a', Ireland:'#1e6b6b'
};

export const YEAR_CONTEXT = {
  2024:'Current baseline — biodiversity in continued decline across all nations',
  2025:"SFI reopens in England. Scotland's Natural Environment Bill progresses through Parliament",
  2026:'Wales Sustainable Farming Scheme launches. Ireland ACRES midway review',
  2027:'UK 30by30 interim check. England expected to miss interim species abundance halt',
  2028:'Lough Neagh algae crisis continues without statutory NI water targets',
  2029:'Climate impacts accelerate. Seabird colonies hit by warming-driven sandeel collapse',
  2030:'30by30 deadline. UK at ~10% protected. Transformative gap becomes undeniable',
  2031:'Post-2030 reassessment. Scotland diverges sharply from other nations in recovery',
  2032:'NI Nature Recovery Strategy first review. Still lacks statutory targets in law',
  2033:'Scotland Peatland ACTION milestone: 150,000ha on road to restoration',
  2035:'Mid-century review. Turtle dove extinct as UK breeding bird under current trajectory',
  2038:'Capercaillie: last breeding pairs recorded in Scotland under current trajectory',
  2040:'Freshwater pearl mussel: functionally extinct in England and Wales',
  2042:"England's legally binding Environment Act species abundance target year",
  2045:"Scotland's target: nature positive. Currently partial track. NI still lagging",
  2050:'Net zero deadline. Nature-based solutions essential. Peatland = 30% of solution'
};

export const CHART_LABELS = {
  species:'Species abundance index (1970 = 100)',
  carbon:'Carbon stored in nature (Gt CO₂e)',
  policy:'Policy delivery score (UK average, 0–100)'
};

export const CHART_CONTEXTS = {
  species:`In 1970 this index was 100 — the baseline. It is now <strong>48</strong>, meaning the UK has roughly half the wildlife it had 55 years ago. Under current policy it falls to ~34 by 2050. Under transformative action it stabilises then rises to ~58.`,
  carbon:`<strong>Gt = gigatonne</strong> (1 billion tonnes of CO₂e stored in habitat). The UK's peatlands and woodlands currently store ~3.1 Gt. Under current policy this barely grows. Under transformative action — restoring drained peatland and expanding woodland — it could reach 5.4 Gt by 2050, equivalent to removing all UK cars from the road for decades.`,
  policy:`Each nation's current policy delivery score (out of 100) vs the score needed to meet their own stated commitments. The gap is the story: Northern Ireland needs to almost triple its delivery. England needs to add 30 points. Only Scotland is close to the required trajectory.`
};
