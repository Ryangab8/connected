import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const interventions = [
  {
    id: 1,
    cascadeId: 'cascade-01',
    title: 'The Sand Eel Collapse',
    summary: 'Industrial fishing crashes the North Sea food web',
    intervention: 'Protect sand eel populations',
    atStakeSummary: "Without sand eel protections, the North Sea food web collapses from the bottom up — taking seabird colonies with it.",
    atStakeDetails: [
      'One in four UK puffins lost since 2000',
      '62% of UK seabird species declining',
      'BTO models predict potential 90% puffin decline by 2050',
      'Kittiwake populations halved since the 1960s, now globally threatened'
    ],
    whatsDone: "The UK banned industrial sand eel fishing in UK North Sea waters effective March 2024. An earlier 20,000 km² closure off Scotland's east coast (from 2000) already produced measurable improvement in kittiwake breeding success.",
    protects: ['Atlantic Puffin', 'Grey Seal', 'Atlantic Salmon', 'Kittiwakes', 'Guillemots', 'Razorbills', 'Harbour Porpoises'],
    whatYouCanDo: "Support the Marine Conservation Society's campaigns for marine protected areas. Choose sustainably sourced fish (look for MSC certification). Reduce carbon footprint to slow ocean warming that shifts plankton communities.",
    keyOrg: {
      name: 'Marine Conservation Society',
      url: 'https://www.mcsuk.org/'
    },
    status: 'In progress — ban enacted 2024, monitoring ongoing'
  },
  {
    id: 2,
    cascadeId: 'cascade-02',
    title: 'The Mink Invasion',
    summary: 'American mink devastate native riverbank wildlife',
    intervention: 'Remove American mink from waterways',
    atStakeSummary: "Unchecked mink populations drove the fastest mammal decline in British history and continue to devastate riverbank ecosystems.",
    atStakeDetails: [
      'Water vole population collapsed 94% — the fastest mammal decline in British history',
      'From 8 million water voles to fewer than 186,000',
      'Riverbank ecosystems lose their "mini-engineers" — dense scrub replaces diverse grassland',
      'Kingfishers and other bank-nesting birds face increased predation'
    ],
    whatsDone: 'The Waterlife Recovery Trust coordinates mink eradication across ~5% of England, with documented water vole recovery wherever mink are removed. Otter recovery is naturally displacing mink — mink occupancy dropped from 77% to 23% within one year of otter arrival on the Upper Thames.',
    protects: ['Water Vole', 'Kingfisher', 'Common Frog', 'Riparian invertebrate communities'],
    whatYouCanDo: 'Report mink sightings to your local Wildlife Trust or the Waterlife Recovery Trust. Support otter conservation — a thriving otter population is the best long-term mink control. Volunteer for local mink monitoring rafts.',
    keyOrg: {
      name: 'Waterlife Recovery Trust',
      url: 'https://www.waterliferecoverytrust.org.uk/'
    },
    status: 'Partially reversing — otter recovery driving mink decline'
  },
  {
    id: 3,
    cascadeId: 'cascade-03',
    title: 'The Grey Squirrel Invasion',
    summary: 'North American grey squirrels outcompete native reds',
    intervention: 'Control grey squirrel populations and protect red squirrel refuges',
    atStakeSummary: "Grey squirrels are simultaneously replacing red squirrels and destroying the next generation of oak woodland that 2,300 species depend on.",
    atStakeDetails: [
      'Red squirrels outnumbered 10 to 1 (2.7 million grey vs 287,000 red)',
      'Squirrelpox virus is ~100% fatal to red squirrels',
      '£37 million annual damage from bark stripping in England and Wales',
      'The next generation of mature oaks — each supporting 2,300+ species — is at risk'
    ],
    whatsDone: 'The UK Squirrel Accord coordinates grey squirrel management. Oral contraceptive research is underway (fertility control via hazelnut bait). Pine marten recovery in Scotland and Ireland is naturally suppressing grey squirrels — in areas where pine martens returned, red squirrels recovered without human intervention.',
    protects: ['Red Squirrel', 'Oak', '2,300+ oak-dependent species including 326 species found only on oak'],
    whatYouCanDo: "Support the Red Squirrel Survival Trust. If you manage woodland, consider pine marten-friendly habitat. Report red squirrel sightings to help track populations. Don't feed grey squirrels in gardens near red squirrel areas.",
    keyOrg: {
      name: 'UK Squirrel Accord',
      url: 'https://squirrelaccord.uk/',
      secondary: {
        name: 'Red Squirrel Survival Trust',
        url: 'https://rsst.org.uk/'
      }
    },
    status: 'Active research — pine marten biological control showing promise'
  },
  {
    id: 4,
    cascadeId: 'cascade-04',
    title: 'The Badger-Hedgehog Triangle',
    summary: 'Badger predation and habitat loss drive hedgehog decline',
    intervention: 'Create hedgehog-friendly habitats in gardens and urban areas',
    atStakeSummary: "Britain's hedgehog population has crashed 97% in a single human lifetime — from 30 million to fewer than 900,000.",
    atStakeDetails: [
      'Hedgehog numbers fell from 30 million in the 1950s to fewer than 900,000',
      'That\'s a roughly 97% decline in a single lifetime',
      'Hedgehogs now absent from 71% of surveyed countryside sites',
      'Without hedgehog predation, slug and snail populations rise, impacting gardens and native plants'
    ],
    whatsDone: 'Hedgehog Street (run by PTES and BHPS) coordinates the national Hedgehog Highway campaign — cutting 13cm gaps in garden fences to create connected habitat corridors. Over 100,000 hedgehog highways have been registered. Urban and suburban gardens are now critical refuges where hedgehog densities can be higher than in farmland (where badger predation pressure is strongest).',
    protects: ['Hedgehog', 'Slug and snail populations naturally controlled', 'Soil invertebrate communities'],
    whatYouCanDo: 'Cut a 13×13cm hole in your garden fence (a "hedgehog highway"). Stop using slug pellets — hedgehogs eat slugs naturally. Leave wild patches in your garden. Build a log pile for hibernation. Check before strimming or mowing.',
    keyOrg: {
      name: 'Hedgehog Street',
      url: 'https://www.hedgehogstreet.org/'
    },
    status: 'Community-driven — 100,000+ hedgehog highways created'
  },
  {
    id: 5,
    cascadeId: 'cascade-05',
    title: 'The Invisible Foundation',
    summary: 'Earthworm decline undermines the entire terrestrial ecosystem',
    intervention: 'Adopt regenerative farming practices',
    atStakeSummary: "A third of Britain's earthworms have disappeared, silently undermining the soil that supports every terrestrial food chain above it.",
    atStakeDetails: [
      'Earthworm populations down 33–41% over 25 years',
      '42% of UK farmland fields may be "over-worked" with missing earthworm groups',
      '8 predator species in this network lose a critical food source',
      'Plant production drops by an estimated 25% without earthworm soil engineering'
    ],
    whatsDone: "The UK government's Environmental Land Management (ELM) schemes now incentivize soil health practices. Research by Rothamsted Research and the Earthworm Society of Britain is quantifying decline and testing recovery methods. No-till farming trials have shown earthworm populations can recover within 3-5 years of practice change.",
    protects: ['Badger', 'Hedgehog', 'Red Fox', 'Tawny Owl', 'Barn Owl', 'Skylark', 'Common Frog', 'Oak', 'Bluebell', 'Hawthorn', 'Heather'],
    whatYouCanDo: 'Buy from farms using regenerative practices. Compost food waste. In your own garden, avoid over-tilling, leave leaf litter, reduce chemical inputs. Support the Soil Association.',
    keyOrg: {
      name: 'Earthworm Society of Britain',
      url: 'https://www.earthwormsoc.org.uk/',
      secondary: {
        name: 'Soil Association',
        url: 'https://www.soilassociation.org/'
      }
    },
    status: 'Early stages — policy framework exists, farmer uptake growing'
  },
  {
    id: 6,
    cascadeId: 'cascade-06',
    title: 'The Salmon Artery',
    summary: 'Salmon decline cuts the marine-to-freshwater nutrient pipeline',
    intervention: 'Restore river connectivity and water quality',
    atStakeSummary: "Atlantic salmon are now Endangered in Britain, and their decline severs a 2,000-year-old nutrient pipeline connecting ocean to river.",
    atStakeDetails: [
      'Atlantic salmon now classified Endangered in Great Britain — down 63% over three generations',
      'Rivers lose their marine nutrient pipeline — a process documented over 2,000 years',
      'A negative feedback loop: fewer salmon → less nutrients → fewer aquatic invertebrates → even fewer juvenile salmon',
      'Otters shift to alternative prey, increasing pressure on crayfish, frogs, and other freshwater species'
    ],
    whatsDone: "The Environment Agency's barrier removal programme has opened hundreds of miles of river. The Atlantic Salmon Trust coordinates international conservation efforts. Scotland's Missing Salmon Project tracks marine survival. River restoration projects (re-meandering, riparian planting, weir removal) show rapid salmon recovery when access is restored.",
    protects: ['Atlantic Salmon', 'Otter', 'Kingfisher', 'Grey Seal', 'Riparian trees and invertebrates'],
    whatYouCanDo: 'Support river clean-up events. Report pollution incidents to the Environment Agency. Support the Atlantic Salmon Trust or your local rivers trust. Avoid products containing microbeads that pollute waterways.',
    keyOrg: {
      name: 'Atlantic Salmon Trust',
      url: 'https://atlanticsalmontrust.org/',
      secondary: {
        name: 'The Rivers Trust',
        url: 'https://theriverstrust.org/'
      }
    },
    status: 'Active — river barrier removals accelerating'
  },
  {
    id: 7,
    cascadeId: 'cascade-07',
    title: 'The Pollinator Spiral',
    summary: 'Wildflower loss and pesticides drive pollinator collapse',
    intervention: 'Restore wildflower habitats and reduce pesticide use',
    atStakeSummary: "A third of British pollinators are declining, and the food web they support — worth up to £690 million annually — is simplifying dangerously.",
    atStakeDetails: [
      'One-third of UK bee and hoverfly species declining',
      'Pollinator ranges shrank by 25% — a net loss of 2.7 million occupied grid cells',
      'Two UK bumblebee species already extinct',
      'Just 4 plant species now account for more than half of all nectar in Britain — a dangerously simplified food web',
      'UK pollination services valued at £400–690 million annually at risk'
    ],
    whatsDone: "The National Pollinator Strategy (2014, refreshed 2024) coordinates UK-wide action. Agri-environment schemes pay farmers for wildflower margins. The UK banned outdoor use of three neonicotinoid pesticides in 2018. B-Lines project by Buglife creates insect pathways across the landscape.",
    protects: ['Buff-tailed Bumblebee', 'Small Tortoiseshell', 'Swift', 'Skylark', 'Hundreds of pollinator species'],
    whatYouCanDo: 'Plant pollinator-friendly flowers (lavender, heather, wildflower mixes). Don\'t mow your lawn in May ("No Mow May"). Avoid pesticides in your garden. Buy organic where possible. Support Buglife\'s B-Lines project.',
    keyOrg: {
      name: 'Buglife',
      url: 'https://www.buglife.org.uk/',
      secondary: {
        name: 'Bumblebee Conservation Trust',
        url: 'https://www.bumblebeeconservation.org/'
      }
    },
    status: 'Mixed — pesticide restrictions enacted, habitat still declining'
  },
  {
    id: 8,
    cascadeId: 'cascade-08',
    title: 'The Hen Harrier Conflict',
    summary: 'Illegal persecution on grouse moors devastates raptor populations',
    intervention: 'End illegal raptor persecution on grouse moors',
    atStakeSummary: "Illegal persecution has reduced England's hen harrier population to less than 4% of what the landscape could support.",
    atStakeDetails: [
      'England could support 300+ nesting pairs of hen harriers based on habitat availability, compared to the current 4-12 annual nesting attempts',
      'Satellite-tagged hen harriers repeatedly disappear over grouse moors',
      'Removing a natural predator allows unnaturally high grouse densities, increasing grazing pressure on heather habitat',
      'The ecological paradox: the same moor management that creates harrier habitat incentivizes harrier persecution'
    ],
    whatsDone: 'The Hen Harrier Action Plan includes a controversial brood management scheme. Satellite tagging by RSPB has documented persecution — tagged birds repeatedly disappear over grouse moors. Diversionary feeding (providing alternative food near harrier nests) has shown some success in reducing grouse chick predation.',
    protects: ['Hen Harrier', 'Red Grouse', 'Upland pollinators', 'Moorland ecosystem balance'],
    whatYouCanDo: "Support RSPB's Skydancer project. Report suspected raptor persecution to police. Write to your MP supporting licensing reform for grouse moors. Visit and support hen harrier watchpoints.",
    keyOrg: {
      name: 'RSPB Hen Harrier LIFE Project',
      url: 'https://www.rspb.org.uk/our-work/conservation/projects/hen-harrier-life/'
    },
    status: 'Contested — persecution continues despite being illegal'
  }
];

function InterventionCard({ intervention }) {
  const [expanded, setExpanded] = useState({ happening: false, youCanDo: false, atStake: false });

  const toggleSection = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getStatusColor = (status) => {
    if (status.includes('In progress') || status.includes('Active')) return '#2d6a4f';
    if (status.includes('Community-driven')) return '#52b788';
    if (status.includes('Contested')) return '#e63946';
    if (status.includes('Mixed')) return '#fb8500';
    if (status.includes('Early stages')) return '#219ebc';
    return '#636e72';
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        marginBottom: '2rem'
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#2d3436' }}>
          {intervention.title}
        </h3>
        <p style={{ fontSize: '0.95rem', color: '#636e72', fontStyle: 'italic' }}>
          {intervention.summary}
        </p>
      </div>

      {/* Intervention Point */}
      <div style={{
        background: 'rgba(45, 106, 79, 0.08)',
        border: '2px solid #2d6a4f',
        borderRadius: '8px',
        padding: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2d6a4f', marginBottom: '0.5rem', fontWeight: 600 }}>
          The Intervention Point
        </div>
        <div style={{ fontSize: '1.25rem', color: '#2d3436', fontWeight: 600 }}>
          {intervention.intervention}
        </div>
      </div>

      {/* What's at Stake */}
      <div style={{
        background: 'rgba(239, 68, 68, 0.06)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '8px',
        padding: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#dc2626', marginBottom: '0.75rem', fontWeight: 600 }}>
          What's at Stake
        </div>
        <div style={{ fontSize: '1.05rem', color: '#2d3436', fontWeight: 600, lineHeight: 1.5, marginBottom: '0.75rem' }}>
          {intervention.atStakeSummary}
        </div>
        <button
          onClick={() => toggleSection('atStake')}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#dc2626',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>{expanded.atStake ? 'Hide details' : 'See the details'}</span>
          <span style={{ fontSize: '0.75rem', transform: expanded.atStake ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
            ▼
          </span>
        </button>
        {expanded.atStake && (
          <div style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            {intervention.atStakeDetails.map((detail, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: '0.75rem',
                marginBottom: '0.75rem',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#dc2626',
                  marginTop: '0.5rem',
                  flexShrink: 0
                }} />
                <div style={{ fontSize: '0.95rem', color: '#636e72', lineHeight: 1.6 }}>
                  {detail}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* What it protects */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2d3436', marginBottom: '0.75rem' }}>
          What this protects →
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {intervention.protects.map((species, i) => (
            <div key={i} style={{
              padding: '0.4rem 0.75rem',
              background: '#f8f7f4',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '0.85rem',
              color: '#2d3436'
            }}>
              {species}
            </div>
          ))}
        </div>
      </div>

      {/* Expandable sections */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => toggleSection('happening')}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            background: expanded.happening ? '#f8f7f4' : '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 500,
            color: '#2d3436',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f8f7f4'}
          onMouseLeave={(e) => e.currentTarget.style.background = expanded.happening ? '#f8f7f4' : '#ffffff'}
        >
          <span>What's happening</span>
          <span style={{ fontSize: '1.25rem', transform: expanded.happening ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
            ▼
          </span>
        </button>
        {expanded.happening && (
          <div style={{
            padding: '1rem',
            background: '#f8f7f4',
            borderLeft: '1px solid #e5e7eb',
            borderRight: '1px solid #e5e7eb',
            borderBottom: '1px solid #e5e7eb',
            borderBottomLeftRadius: '6px',
            borderBottomRightRadius: '6px',
            fontSize: '0.95rem',
            lineHeight: 1.7,
            color: '#636e72'
          }}>
            {intervention.whatsDone}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => toggleSection('youCanDo')}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            background: expanded.youCanDo ? '#f8f7f4' : '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 500,
            color: '#2d3436',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f8f7f4'}
          onMouseLeave={(e) => e.currentTarget.style.background = expanded.youCanDo ? '#f8f7f4' : '#ffffff'}
        >
          <span>What you can do</span>
          <span style={{ fontSize: '1.25rem', transform: expanded.youCanDo ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
            ▼
          </span>
        </button>
        {expanded.youCanDo && (
          <div style={{
            padding: '1rem',
            background: '#f8f7f4',
            borderLeft: '1px solid #e5e7eb',
            borderRight: '1px solid #e5e7eb',
            borderBottom: '1px solid #e5e7eb',
            borderBottomLeftRadius: '6px',
            borderBottomRightRadius: '6px',
            fontSize: '0.95rem',
            lineHeight: 1.7,
            color: '#636e72'
          }}>
            {intervention.whatYouCanDo}
          </div>
        )}
      </div>

      {/* Key org and status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <a
            href={intervention.keyOrg.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.875rem',
              color: '#2d6a4f',
              textDecoration: 'none',
              fontWeight: 500,
              borderBottom: '1px solid transparent',
              transition: 'border-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = '#2d6a4f'}
            onMouseLeave={(e) => e.currentTarget.style.borderBottomColor = 'transparent'}
          >
            {intervention.keyOrg.name} →
          </a>
          {intervention.keyOrg.secondary && (
            <a
              href={intervention.keyOrg.secondary.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.875rem',
                color: '#2d6a4f',
                textDecoration: 'none',
                fontWeight: 500,
                borderBottom: '1px solid transparent',
                transition: 'border-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = '#2d6a4f'}
              onMouseLeave={(e) => e.currentTarget.style.borderBottomColor = 'transparent'}
            >
              {intervention.keyOrg.secondary.name} →
            </a>
          )}
        </div>
        <div style={{
          padding: '0.4rem 0.75rem',
          background: `${getStatusColor(intervention.status)}15`,
          border: `1px solid ${getStatusColor(intervention.status)}`,
          borderRadius: '6px',
          fontSize: '0.75rem',
          color: getStatusColor(intervention.status),
          fontWeight: 500
        }}>
          {intervention.status}
        </div>
      </div>

      {/* Link to cascade */}
      <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #e5e7eb' }}>
        <Link
          to={`/stories/${intervention.cascadeId}`}
          style={{
            fontSize: '0.875rem',
            color: '#636e72',
            textDecoration: 'none',
            fontWeight: 500,
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#2d6a4f'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#636e72'}
        >
          See the full cascade story →
        </Link>
      </div>
    </motion.div>
  );
}

function ActPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        paddingTop: '70px',
        minHeight: '100vh',
        background: '#f8f7f4'
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Hero section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: '3rem', textAlign: 'center' }}
        >
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: '#2d3436' }}>
            Break the Chain
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#2d6a4f', marginBottom: '2rem', fontWeight: 500 }}>
            Every cascade starts somewhere. Stop it at the source, and the whole ecosystem benefits.
          </p>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#636e72', maxWidth: '800px', margin: '0 auto' }}>
            The eight ecological cascades in this project show how the decline of one species ripples through dozens of others. But that same interconnectedness means recovery works the same way. A single well-placed intervention at the top of a cascade chain can benefit five, ten, or twenty species downstream. Conservation doesn't have to mean saving every species one by one — it means understanding the web well enough to know where to act.
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '3rem',
            marginBottom: '4rem',
            padding: '2rem',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#2d6a4f', marginBottom: '0.25rem' }}>8</div>
            <div style={{ fontSize: '0.875rem', color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Intervention Points</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#2d6a4f', marginBottom: '0.25rem' }}>29</div>
            <div style={{ fontSize: '0.875rem', color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Species Protected</div>
          </div>
        </motion.div>

        {/* Intervention cards */}
        {interventions.map((intervention, index) => (
          <motion.div
            key={intervention.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.05 }}
          >
            <InterventionCard intervention={intervention} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default ActPage;
