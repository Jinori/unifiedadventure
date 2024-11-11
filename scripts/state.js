// state.js

// State Variables
let isRestocking = false;
let atDestination = false;
let currentZoneTarget = null;
let deadPartyMembers = {};
let inventoryItemIndices = {};
let lastInviteSent = {};
let lastPartyCheck = 0;
let lastMoveAttempt = 0;  // Timestamp of the last move attempt
let isMoving = false;     // Flag to track if smart_move is currently active
let smartMoveTimer;       // Timer to track smart_move duration
let lastZoneMoveAttempt = 0;   // Timestamp of the last zone move attempt
let isZoneMoving = false;      // Flag to track if moving to a zone is in progress