// config.js

// Configuration Constants
const CONFIG = {
    warriorName: "Jinori",
    partyLeader: "Jinori",
    followDistance: 100,
    healthThreshold: { priest: 0.85, paladin: 0.5, warrior: 0.7 },
    manaThreshold: { priest: 0.5, paladin: 0.7, warrior: 0.5 },
    potionThreshold: 30,
    maxPotions: { hpot0: 1000, mpot0: 1000 },
    merchantLocation: { map: "main", x: -57.8, y: -58.1 },
    partyMembers: ["Nizzi", "Kalai", "Jinori"],
    gearSlots: [
        "helmet", "chest", "gloves", "pants", "shoes",
        "weapon", "shield", "ring1", "ring2", "amulet"
    ],
    classAttackRange: { priest: 120, paladin: 10, warrior: 10 },
    classSkills: {
        priest: ["partyheal", "darkblessing", "absorb", "curse"],
        paladin: ["selfheal", "purify", "mshield", "smash"],
        warrior: ["stomp", "cleave", "taunt"],
    },
    zones: [
        { name: "Beginner Zone", map: "main", x: 38, y: 773, level: 1, target: "goo" },
        { name: "Intermediate Zone", map: "main", x: 483, y: 1065, level: 10, target: "bee" },
        { name: "Advanced Zone", map: "main", x: 803, y: 1543, level: 20, target: "croc" },
        { name: "Armored Zone", map: "main", x: 551, y: 1824, level: 30, target: "armadillo" },
        { name: "Snake Zone", map: "main", x: -17, y: 1890, level: 35, target: "snake" },
        { name: "Squig Zone", map: "main", x: -1180, y: 383, level: 42, target: "squig" },
        { name: "Pizio Zone", map: "main", x: -105, y: 1464, level: 50, target: "poisio" },
    ],
	bosses: ["snowman"],
    minimumBossLevel: 55, // Minimum level to engage bosses
};

// Slot Types Mapping
const SLOT_TYPES = {
    helmet: "helmet",
    chest: "chest",
    gloves: "gloves",
    pants: "pants",
    shoes: "shoes",
    weapon: "weapon",
    shield: "shield",
    ring1: "ring",
    ring2: "ring",
    amulet: "amulet",
};

const zoneMoveRetryInterval = 5000; // Minimum time between zone movement attempts
const smartMoveTimeout = 10000;  // Timeout for smart_move in ms (10 seconds)
const moveRetryInterval = 5000;  // Minimum time in ms between movement retries
const partyCheckInterval = 5000;