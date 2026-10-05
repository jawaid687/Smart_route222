/**
 * Built-in Preset Floor Plans conforming to the Smart Escape JSON schema.
 * 
 * Schema:
 * - nodes: [ { id, label, type, x, y } ]
 * - edges: [ { id, from, to, cost } ]
 * - initial_state: { blocked_nodes, blocked_edges, closed_exits }
 */

export const PRESET_MAPS = [
  {
    id: 'corporate_hq',
    name: {
      en: 'Corporate Headquarters',
      bn: 'করপোরেট সদর দপ্তর'
    },
    description: {
      en: 'Multi-wing office building with central atrium, executive suites, and multiple fire exits.',
      bn: 'সেন্ট্রাল অ্যাট্রিয়াম, অফিস কক্ষ এবং অগ্নিনির্বাপক বহির্গমন পথ বিশিষ্ট আধুনিক ভবন।'
    },
    defaultStart: 'R_OFFICE_101',
    data: {
      nodes: [
        { id: 'R_OFFICE_101', label: 'Office 101', type: 'room', x: 120, y: 120 },
        { id: 'R_CONF_ROOM', label: 'Conference Hall', type: 'room', x: 340, y: 100 },
        { id: 'R_SERVER_RM', label: 'Server Room', type: 'room', x: 620, y: 110 },
        { id: 'R_CAFETERIA', label: 'Cafeteria', type: 'room', x: 140, y: 380 },
        { id: 'R_LOUNGE', label: 'Staff Lounge', type: 'room', x: 600, y: 380 },
        { id: 'R_EXECUTIVE', label: 'Executive Suite', type: 'room', x: 380, y: 460 },
        
        { id: 'J_NORTH', label: 'North Junction', type: 'junction', x: 240, y: 220 },
        { id: 'J_ATRIUM', label: 'Central Atrium', type: 'junction', x: 400, y: 260 },
        { id: 'J_EAST', label: 'East Hub', type: 'junction', x: 560, y: 240 },
        { id: 'J_SOUTH', label: 'South Corridor', type: 'junction', x: 360, y: 380 },

        { id: 'EX_EAST', label: 'Exit East Gate', type: 'exit', x: 740, y: 240 },
        { id: 'EX_WEST', label: 'Exit West Wing', type: 'exit', x: 40, y: 230 },
        { id: 'EX_SOUTH_STAIR', label: 'South Stairwell', type: 'exit', x: 260, y: 500 }
      ],
      edges: [
        { id: 'E_OFFICE_JN', from: 'R_OFFICE_101', to: 'J_NORTH', cost: 12 },
        { id: 'E_CONF_JN', from: 'R_CONF_ROOM', to: 'J_NORTH', cost: 14 },
        { id: 'E_CONF_ATRIUM', from: 'R_CONF_ROOM', to: 'J_ATRIUM', cost: 16 },
        { id: 'E_SERVER_JE', from: 'R_SERVER_RM', to: 'J_EAST', cost: 13 },
        { id: 'E_JN_ATRIUM', from: 'J_NORTH', to: 'J_ATRIUM', cost: 15 },
        { id: 'E_JN_EXWEST', from: 'J_NORTH', to: 'EX_WEST', cost: 18 },
        { id: 'E_ATRIUM_JEAST', from: 'J_ATRIUM', to: 'J_EAST', cost: 16 },
        { id: 'E_ATRIUM_JSOUTH', from: 'J_ATRIUM', to: 'J_SOUTH', cost: 14 },
        { id: 'E_JEAST_EXEAST', from: 'J_EAST', to: 'EX_EAST', cost: 17 },
        { id: 'E_JEAST_LOUNGE', from: 'J_EAST', to: 'R_LOUNGE', cost: 15 },
        { id: 'E_JSOUTH_CAFE', from: 'J_SOUTH', to: 'R_CAFETERIA', cost: 20 },
        { id: 'E_CAFE_EXWEST', from: 'R_CAFETERIA', to: 'EX_WEST', cost: 24 },
        { id: 'E_JSOUTH_EXEC', from: 'J_SOUTH', to: 'R_EXECUTIVE', cost: 10 },
        { id: 'E_JSOUTH_EXSOUTH', from: 'J_SOUTH', to: 'EX_SOUTH_STAIR', cost: 13 }
      ],
      initial_state: {
        blocked_nodes: ['R_SERVER_RM'],
        blocked_edges: ['E_CONF_ATRIUM'],
        closed_exits: ['EX_SOUTH_STAIR']
      }
    }
  },
  {
    id: 'tie_breaker_lab',
    name: {
      en: 'Tie-Breaker Research Facility',
      bn: 'টাই-ব্রেকার গবেষণা কেন্দ্র'
    },
    description: {
      en: 'Designed to verify all 3 Dijkstra tie-breakers: Lowest Cost → Exit ID (EX_A vs EX_B) → Node ID sequence (J1 vs J2).',
      bn: 'দিক্সট্রার ৩টি টাই-ব্রেকার যাচাই করতে তৈরি: সর্বনিম্ন দূরত্ব → প্রস্থান আইডি → নোড ক্রম।'
    },
    defaultStart: 'ROOM_START',
    data: {
      nodes: [
        { id: 'ROOM_START', label: 'Origin Lab (Start)', type: 'room', x: 120, y: 260 },
        { id: 'J_ALPHA', label: 'Junction Alpha', type: 'junction', x: 300, y: 140 },
        { id: 'J_BETA', label: 'Junction Beta', type: 'junction', x: 300, y: 380 },
        { id: 'J_GAMMA', label: 'Junction Gamma', type: 'junction', x: 500, y: 140 },
        { id: 'J_DELTA', label: 'Junction Delta', type: 'junction', x: 500, y: 380 },
        { id: 'EX_A', label: 'Emergency Exit A', type: 'exit', x: 680, y: 140 },
        { id: 'EX_B', label: 'Emergency Exit B', type: 'exit', x: 680, y: 380 }
      ],
      edges: [
        { id: 'E1_START_ALPHA', from: 'ROOM_START', to: 'J_ALPHA', cost: 20 },
        { id: 'E2_START_BETA', from: 'ROOM_START', to: 'J_BETA', cost: 20 },
        { id: 'E3_ALPHA_GAMMA', from: 'J_ALPHA', to: 'J_GAMMA', cost: 20 },
        { id: 'E4_BETA_DELTA', from: 'J_BETA', to: 'J_DELTA', cost: 20 },
        { id: 'E5_GAMMA_EXA', from: 'J_GAMMA', to: 'EX_A', cost: 20 },
        { id: 'E6_DELTA_EXB', from: 'J_DELTA', to: 'EX_B', cost: 20 },
        { id: 'E7_CROSS_ALPHA_DELTA', from: 'J_ALPHA', to: 'J_DELTA', cost: 25 },
        { id: 'E8_CROSS_BETA_GAMMA', from: 'J_BETA', to: 'J_GAMMA', cost: 25 }
      ],
      initial_state: {
        blocked_nodes: [],
        blocked_edges: [],
        closed_exits: []
      }
    }
  },
  {
    id: 'hospital_center',
    name: {
      en: 'City Hospital Emergency Ward',
      bn: 'সিটি হাসপাতাল জরুরি বিভাগ'
    },
    description: {
      en: 'Urgent care facility with ICU, Trauma bays, and ambulance emergency ramps.',
      bn: 'আইসিইউ, ট্রমা সেন্টার এবং অ্যাম্বুলেন্স র‍্যাম্প সমন্বিত চিকিৎসা কমপ্লেক্স।'
    },
    defaultStart: 'R_ICU_1',
    data: {
      nodes: [
        { id: 'R_ICU_1', label: 'Intensive Care Unit (ICU)', type: 'room', x: 120, y: 120 },
        { id: 'R_TRAUMA', label: 'Trauma Bay', type: 'room', x: 120, y: 360 },
        { id: 'R_SURGERY', label: 'Operating Theatre', type: 'room', x: 380, y: 90 },
        { id: 'R_PHARMACY', label: 'Central Pharmacy', type: 'room', x: 380, y: 390 },
        { id: 'R_TRIAGE', label: 'Triage Room', type: 'room', x: 620, y: 120 },
        
        { id: 'J_WEST_STATION', label: 'West Nurse Station', type: 'junction', x: 260, y: 240 },
        { id: 'J_CENTRAL_CORE', label: 'Central Corridor', type: 'junction', x: 420, y: 240 },
        { id: 'J_EAST_HALL', label: 'East Triage Hub', type: 'junction', x: 580, y: 250 },

        { id: 'EX_AMBULANCE', label: 'Ambulance Ramp Exit', type: 'exit', x: 740, y: 360 },
        { id: 'EX_NORTH_DOOR', label: 'North Safety Door', type: 'exit', x: 500, y: 30 },
        { id: 'EX_WEST_GATE', label: 'West Service Exit', type: 'exit', x: 40, y: 240 }
      ],
      edges: [
        { id: 'EH_ICU_WEST', from: 'R_ICU_1', to: 'J_WEST_STATION', cost: 15 },
        { id: 'EH_TRAUMA_WEST', from: 'R_TRAUMA', to: 'J_WEST_STATION', cost: 12 },
        { id: 'EH_WEST_EXIT', from: 'J_WEST_STATION', to: 'EX_WEST_GATE', cost: 22 },
        { id: 'EH_WEST_CENTRAL', from: 'J_WEST_STATION', to: 'J_CENTRAL_CORE', cost: 18 },
        { id: 'EH_SURGERY_CENTRAL', from: 'R_SURGERY', to: 'J_CENTRAL_CORE', cost: 14 },
        { id: 'EH_SURGERY_NORTH', from: 'R_SURGERY', to: 'EX_NORTH_DOOR', cost: 12 },
        { id: 'EH_PHARM_CENTRAL', from: 'R_PHARMACY', to: 'J_CENTRAL_CORE', cost: 16 },
        { id: 'EH_CENTRAL_EAST', from: 'J_CENTRAL_CORE', to: 'J_EAST_HALL', cost: 15 },
        { id: 'EH_TRIAGE_EAST', from: 'R_TRIAGE', to: 'J_EAST_HALL', cost: 10 },
        { id: 'EH_EAST_AMBULANCE', from: 'J_EAST_HALL', to: 'EX_AMBULANCE', cost: 16 }
      ],
      initial_state: {
        blocked_nodes: ['R_PHARMACY'],
        blocked_edges: ['EH_WEST_EXIT'],
        closed_exits: ['EX_NORTH_DOOR']
      }
    }
  },
  {
    id: 'underground_metro',
    name: {
      en: 'Metro Transit Station Sub-Level',
      bn: 'মেট্রো ট্রানজিট ভূগর্ভস্থ স্টেশন'
    },
    description: {
      en: 'Subway concourse with turnstiles, platform corridors, and surface egress shafts.',
      bn: 'সাবওয়ে প্ল্যাটফর্ম, টিকিট কাউন্টার এবং ভূপৃষ্ঠের নির্গমন সিঁড়ি।'
    },
    defaultStart: 'R_PLATFORM_A',
    data: {
      nodes: [
        { id: 'R_PLATFORM_A', label: 'Platform 1-A (Southbound)', type: 'room', x: 100, y: 150 },
        { id: 'R_PLATFORM_B', label: 'Platform 2-B (Northbound)', type: 'room', x: 100, y: 350 },
        { id: 'R_TICKET_OFFICE', label: 'Station Master & Tickets', type: 'room', x: 420, y: 80 },
        { id: 'R_ELEC_ROOM', label: 'High Voltage Room', type: 'room', x: 620, y: 360 },

        { id: 'J_STAIRS_WEST', label: 'Platform Stairs', type: 'junction', x: 260, y: 250 },
        { id: 'J_CONCOURSE', label: 'Grand Concourse', type: 'junction', x: 420, y: 250 },
        { id: 'J_TURNSTILES', label: 'Fare Gate Junction', type: 'junction', x: 580, y: 220 },

        { id: 'EX_STREET_PLAZA', label: 'Street Level Plaza Exit', type: 'exit', x: 740, y: 140 },
        { id: 'EX_ESCAPE_SHAFT', label: 'Ventilation Escape Shaft', type: 'exit', x: 720, y: 440 }
      ],
      edges: [
        { id: 'EM_PLATA_STAIRS', from: 'R_PLATFORM_A', to: 'J_STAIRS_WEST', cost: 18 },
        { id: 'EM_PLATB_STAIRS', from: 'R_PLATFORM_B', to: 'J_STAIRS_WEST', cost: 18 },
        { id: 'EM_STAIRS_CONCOURSE', from: 'J_STAIRS_WEST', to: 'J_CONCOURSE', cost: 20 },
        { id: 'EM_CONCOURSE_TICKETS', from: 'J_CONCOURSE', to: 'R_TICKET_OFFICE', cost: 15 },
        { id: 'EM_CONCOURSE_TURNSTILES', from: 'J_CONCOURSE', to: 'J_TURNSTILES', cost: 16 },
        { id: 'EM_TURNSTILES_PLAZA', from: 'J_TURNSTILES', to: 'EX_STREET_PLAZA', cost: 14 },
        { id: 'EM_CONCOURSE_ELEC', from: 'J_CONCOURSE', to: 'R_ELEC_ROOM', cost: 25 },
        { id: 'EM_ELEC_SHAFT', from: 'R_ELEC_ROOM', to: 'EX_ESCAPE_SHAFT', cost: 16 }
      ],
      initial_state: {
        blocked_nodes: ['R_ELEC_ROOM'],
        blocked_edges: [],
        closed_exits: []
      }
    }
  }
];

export const SAMPLE_JSON_TEMPLATE = JSON.stringify(PRESET_MAPS[0].data, null, 2);
