/* =====================================================
   WORLD.JS — Random Tuesday Simulator
   Pure pixel-art canvas engine — no emojis in world
   ===================================================== */

const TILE  = 16;
const SCALE = 3;
const S     = TILE * SCALE;   // 48px per tile on screen

const COLS = 22;
const ROWS = 16;

/* ─── PALETTE ─────────────────────────────────────── */
const C = {
  floorA:'#6b4c2a', floorB:'#5a3e22', floorC:'#7a5535',
  floorDark:'#3d2810', floorCrack:'#2a1c0a',
  wallTop:'#8c6840', wallMid:'#7a5c36', wallBot:'#5a3e22',
  wallShadow:'#2e1e0a', wallPlank:'#9a7848', wallHole:'#0a0604',
  doorFrame:'#4a2e10', doorOpen:'#080402',
  rugA:'#7a1515', rugB:'#5c0e0e', rugBorder:'#9e2020', rugAccent:'#c0392b',
  bedFrame:'#5a3010', bedMatt:'#8a6a40', bedMattD:'#6a5030',
  bedPillow:'#c8b88a', bedPillowD:'#a89870', bedStain:'#7a6040',
  tvBody:'#1a1a1a', tvScreenOn:'#1a3020', tvAntenna:'#1e1e1e',
  fridgeBody:'#c0c8c0', fridgeDoor:'#b0b8b0', fridgeHandle:'#888888',
  fridgeSeal:'#aab0aa', fridgeCrack:'#808880',
  tableTop:'#6b4020', tableLeg:'#4a2c10',
  chairSeat:'#5a3820', chairBack:'#4a2c10', chairLeg:'#3a2010',
  shelfBoard:'#6a4828', shelfWall:'#5a3c20',
  boxBrown:'#8a5a28', boxDark:'#6a4218', boxTape:'#c8a040',
  bucketBody:'#6080a0', bucketHandle:'#4a6080', bucketDirt:'#5a4028',
  ratBody:'#4a3828', ratEar:'#7a5848', ratEye:'#ff2020',
  plungerStick:'#8a6030', plungerCup:'#c03020', plungerCupD:'#8a2010',
  trashBag:'#2a2a2a', trashBagT:'#383838',
  sinkBody:'#b0b8b0', sinkBowl:'#808880', sinkTap:'#909898',
  toiletBody:'#c8cec8', toiletBowl:'#9098a0', toiletLid:'#b8c0b8',
  lampBase:'#8a6820', lampShade:'#c8a820', lampShadeD:'#a08010',
  clockBody:'#2a2018', clockFace:'#f0e0b0',
  bottleBody:'#2a6020', bottleCap:'#c0c0c0',
  posterBg:'#400000', posterText:'#ff4040',
  hintBg:'#ffe600', hintText:'#1a1200',
};

/* ─── MAP ─────────────────────────────────────────────
  0=wood-floor  1=dark-floor  2=cracked-floor
  3=wall-H      4=wall-V      5=corner
  6=door        7=rug         8=wall-hole
*/
const MAP = [
  [5,3,3,3,3,3,3,8,3,3,3,3,3,3,3,3,3,3,3,3,3,5],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [8,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,4],
  [4,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [5,3,3,3,3,3,3,3,3,3,6,6,3,3,3,3,3,3,3,3,3,5],
];

const SOLID_TILES = new Set([3,4,5]);

/* ─── PIXEL HELPER ──────────────────────────────────── */
function px(ctx, col, row, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(col * SCALE, row * SCALE, w * SCALE, h * SCALE);
}

/* ─── OBJECTS ────────────────────────────────────────
  tx,ty : top-left tile
  w,h   : tile dimensions
  hx,hy,hw,hh : hitbox tiles (optional override; hw=0 → no collision)
  draw(ctx) called with ctx translated to tx*S, ty*S
  label, lines[], pickable, itemId, itemName, itemDesc
*/
const OBJECTS = [];

/* ── BED (1,1 → 4w × 4h) ── */
OBJECTS.push({
  tx:1, ty:1, w:4, h:4,
  hx:1, hy:2, hw:4, hh:3,
  label:'Matelas',
  lines:[
    '"Ton lit. Matelas récupéré près d\'une benne en 2021."',
    '"Il y a une tache en forme de la France. Tu en es fier."',
    '"Ça craque. Ça grince. Ça sent. C\'est CHEZ TOI."',
  ],
  draw(ctx) {
    // Frame
    ctx.fillStyle=C.bedFrame;
    ctx.fillRect(0,0,4*S,4*S);
    // Headboard planks
    ctx.fillStyle='#7a4818';
    ctx.fillRect(SCALE,SCALE,2*S-2*SCALE,S-2*SCALE);
    ctx.fillRect(2*S+SCALE,SCALE,2*S-2*SCALE,S-2*SCALE);
    ctx.fillStyle='#3a2010';
    ctx.fillRect(2*S-SCALE,SCALE,2*SCALE,S-2*SCALE);
    // Nail dots
    ctx.fillStyle='#c8a060';
    [SCALE,4*S-2*SCALE].forEach(nx=>{
      ctx.fillRect(nx,SCALE,SCALE,SCALE);
      ctx.fillRect(nx,S-2*SCALE,SCALE,SCALE);
    });
    // Mattress
    ctx.fillStyle=C.bedMatt;
    ctx.fillRect(SCALE,S+SCALE,4*S-2*SCALE,3*S-2*SCALE);
    ctx.fillStyle=C.bedMattD;
    ctx.fillRect(SCALE,S+SCALE,4*S-2*SCALE,SCALE*2);
    // Stain
    ctx.fillStyle=C.bedStain;
    ctx.fillRect(S+6,S+S+10,14,8);
    ctx.fillRect(S+8,S+S+16,10,5);
    // Pillow
    ctx.fillStyle=C.bedPillow;
    ctx.fillRect(SCALE*3,S+SCALE*4,2*S-SCALE*5,S-SCALE*6);
    ctx.fillStyle=C.bedPillowD;
    ctx.fillRect(SCALE*3,S+SCALE*4,2*S-SCALE*5,SCALE*2);
    // Blanket crumple
    ctx.fillStyle='#9a8860';
    ctx.fillRect(2*S+SCALE*2,S+SCALE*3,2*S-SCALE*4,2*S);
    ctx.fillStyle='#8a7850';
    ctx.fillRect(2*S+SCALE*4,S+SCALE*5,S,S);
    // Frame shadow
    ctx.fillStyle='rgba(0,0,0,0.3)';
    ctx.fillRect(4*S-SCALE*2,S,SCALE*2,3*S);
    ctx.fillRect(SCALE,4*S-SCALE*2,4*S-SCALE,SCALE*2);
  }
});

/* ── TV ON STAND (18,1) ── */
OBJECTS.push({
  tx:18, ty:1, w:3, h:3,
  label:'Télé',
  lines:[
    '"CRT 1994. Elle capte 1 chaîne : météo du Kazakhstan."',
    '"L\'image clignote. Ce n\'est pas la télé. C\'est toi."',
    '"Scotchée au meuble avec 4 bandes de ruban. Solide."',
  ],
  draw(ctx) {
    // Stand
    ctx.fillStyle=C.tableLeg;
    ctx.fillRect(S,2*S,S,S);
    ctx.fillStyle=C.tableTop;
    ctx.fillRect(0,2*S,3*S,SCALE*2);
    // TV body
    ctx.fillStyle=C.tvBody;
    ctx.fillRect(0,0,3*S,2*S);
    // Bezel
    ctx.fillStyle='#111';
    ctx.fillRect(SCALE*2,SCALE*2,3*S-SCALE*4,2*S-SCALE*4);
    // Screen on
    ctx.fillStyle=C.tvScreenOn;
    ctx.fillRect(SCALE*3,SCALE*3,3*S-SCALE*6,2*S-SCALE*6);
    // Scanlines
    for(let sl=SCALE*3;sl<2*S-SCALE*5;sl+=SCALE*2){
      ctx.fillStyle='rgba(0,0,0,0.3)';
      ctx.fillRect(SCALE*3,sl,3*S-SCALE*6,SCALE);
    }
    // White flicker pixel
    if(Math.floor(Date.now()/200)%5===0){
      ctx.fillStyle='rgba(255,255,255,0.15)';
      ctx.fillRect(SCALE*3,SCALE*3,3*S-SCALE*6,2*S-SCALE*6);
    }
    // Antenna wires
    ctx.strokeStyle=C.tvAntenna; ctx.lineWidth=SCALE;
    ctx.beginPath(); ctx.moveTo(S*SCALE,0); ctx.lineTo((S-12)*SCALE,-8*SCALE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo((S+3)*SCALE,0); ctx.lineTo((S+6)*SCALE,-8*SCALE); ctx.stroke();
    // Speaker dots
    for(let d=0;d<4;d++){ctx.fillStyle='#333'; ctx.fillRect(2*S+SCALE*2,(TILE*SCALE/2)+d*SCALE*3,SCALE,SCALE);}
    // VHS label
    ctx.fillStyle='#ff2d00'; ctx.fillRect(SCALE,2*S-SCALE*4,S-SCALE,SCALE*3);
    ctx.fillStyle='#fff'; ctx.font=`${SCALE*2}px monospace`;
    ctx.textBaseline='top'; ctx.textAlign='left';
    ctx.fillText('VHS',SCALE*2,2*S-SCALE*3);
    // Scotch tape
    ctx.fillStyle='rgba(200,200,180,0.35)';
    ctx.fillRect(0,2*S-SCALE,3*S,SCALE*2);
  }
});

/* ── FRIDGE (20,4) ── */
OBJECTS.push({
  tx:20, ty:4, w:2, h:3,
  label:'Frigo',
  lines:[
    '"Contenu : moutarde périmée depuis Obama, et de l\'espoir."',
    '"Un bruit sort du frigo. Tu préfères ne pas enquêter."',
    '"La jointure est moisie. Écologique en quelque sorte."',
  ],
  draw(ctx) {
    ctx.fillStyle=C.fridgeBody; ctx.fillRect(0,0,2*S,3*S);
    // Door seam
    ctx.fillStyle=C.fridgeSeal; ctx.fillRect(0,S,2*S,SCALE*2);
    // Handle top
    ctx.fillStyle=C.fridgeHandle;
    ctx.fillRect(S+SCALE*3,SCALE*3,SCALE*2,S-SCALE*6);
    // Handle bottom
    ctx.fillRect(S+SCALE*3,S+SCALE*3,SCALE*2,S*2-SCALE*6);
    // Rust
    ctx.fillStyle='#a06040'; ctx.fillRect(SCALE,2*S+SCALE*3,SCALE*3,SCALE*2);
    ctx.fillRect(S-SCALE,2*S+SCALE*8,SCALE*2,SCALE*2);
    // Shadow
    ctx.fillStyle='rgba(0,0,0,0.25)';
    ctx.fillRect(2*S-SCALE*2,0,SCALE*2,3*S);
    ctx.fillRect(0,3*S-SCALE*2,2*S,SCALE*2);
    // Dent
    ctx.fillStyle=C.fridgeCrack;
    ctx.fillRect(SCALE*4,SCALE*5,SCALE*5,SCALE);
  }
});

/* ── SINK UNIT (18,5) ── */
OBJECTS.push({
  tx:18, ty:5, w:2, h:2,
  label:'Évier',
  lines:[
    '"L\'eau chaude est morte en 2020. L\'eau froide est tiède."',
    '"4 tasses et un bol dedans. Tu les regardes depuis lundi."',
    '"Jean-Pierre le cafard vit sous le robinet."',
  ],
  draw(ctx) {
    // Cabinet
    ctx.fillStyle=C.tableTop; ctx.fillRect(0,S,2*S,S);
    ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.fillRect(SCALE,S+SCALE,2*S-SCALE*2,S-SCALE);
    // Sink top
    ctx.fillStyle=C.sinkBody; ctx.fillRect(0,0,2*S,S);
    ctx.fillStyle=C.sinkBowl; ctx.fillRect(SCALE*2,SCALE*2,2*S-SCALE*4,S-SCALE*4);
    ctx.fillStyle='#606868'; ctx.fillRect(SCALE*3,SCALE*3,2*S-SCALE*6,S-SCALE*6);
    // Tap
    ctx.fillStyle=C.sinkTap;
    ctx.fillRect(S-SCALE,0,SCALE*2,SCALE*4);
    ctx.fillRect(S-SCALE*3,0,SCALE,SCALE*2);
    ctx.fillRect(S+SCALE*2,0,SCALE,SCALE*2);
    // Dirty water
    ctx.fillStyle='rgba(60,80,50,0.5)'; ctx.fillRect(SCALE*3,S-SCALE*3,2*S-SCALE*6,SCALE*2);
    // Crack in cabinet
    ctx.strokeStyle='#2a1a00'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(SCALE*4,S+SCALE); ctx.lineTo(SCALE*6,S+S-SCALE); ctx.stroke();
  }
});

/* ── TABLE (8,2) ── */
OBJECTS.push({
  tx:8, ty:2, w:3, h:2,
  hx:8, hy:2, hw:3, hh:2,
  label:'Table bancale',
  lines:[
    '"3 pattes + 1 Larousse = 4 pattes. Stable."',
    '"Gravé dessus : \'SORTEZ D\'ICI\'. Quelqu\'un savait."',
    '"Factures impayées étalées dessus. Décoration."',
  ],
  draw(ctx) {
    // 3 legs + book
    ctx.fillStyle=C.tableLeg;
    ctx.fillRect(0,S+SCALE,SCALE*2,S-SCALE);
    ctx.fillRect(3*S-SCALE*2,S+SCALE,SCALE*2,S-SCALE);
    ctx.fillRect(S+SCALE,S+SCALE,SCALE*2,S-SCALE*3);  // short
    // Book under short leg
    ctx.fillStyle='#4a2060'; ctx.fillRect(S-SCALE,2*S-SCALE*3,S+SCALE*2,SCALE*3);
    ctx.fillStyle='#6a4080'; ctx.fillRect(S-SCALE,2*S-SCALE*3,S+SCALE*2,SCALE);
    // Tabletop
    ctx.fillStyle=C.tableTop; ctx.fillRect(0,SCALE,3*S,S);
    ctx.fillStyle='#8a6030'; ctx.fillRect(0,SCALE,3*S,SCALE*2);
    // Engraving
    ctx.strokeStyle='#3a1a00'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(S,S/2); ctx.lineTo(S*2.5,S/2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(S,S/2+SCALE*3); ctx.lineTo(S*2.5,S/2+SCALE*3); ctx.stroke();
    // Items: papers, bottle
    ctx.fillStyle='#c8c090'; ctx.fillRect(SCALE*2,0,S,SCALE*2);
    ctx.fillStyle='#a0a070'; ctx.fillRect(SCALE*3,0,S-SCALE,SCALE);
    ctx.fillStyle=C.bottleBody; ctx.fillRect(S*2+SCALE,0,SCALE*3,SCALE*3);
    ctx.fillStyle=C.bottleCap; ctx.fillRect(S*2+SCALE,0,SCALE*3,SCALE);
    // Ashtray
    ctx.fillStyle='#555'; ctx.fillRect(SCALE,0,SCALE*4,SCALE*2);
    ctx.fillStyle='#333'; ctx.fillRect(SCALE+1,SCALE/2,SCALE*2,SCALE);
  }
});

/* ── CHAIR (7,4) ── */
OBJECTS.push({
  tx:7, ty:4, w:2, h:2,
  label:'Chaise',
  lines:[
    '"Patte fissurée. S\'asseoir dessus, c\'est de la roulette russe."',
    '"Un sac plastique dessus. Tu ne sais pas pourquoi."',
  ],
  draw(ctx) {
    ctx.fillStyle=C.chairBack;
    ctx.fillRect(SCALE,0,2*S-SCALE*2,S);
    ctx.fillStyle=C.chairSeat;
    ctx.fillRect(SCALE,0,SCALE*2,S);
    ctx.fillRect(2*S-SCALE*3,0,SCALE*2,S);
    // seat
    ctx.fillStyle=C.chairSeat; ctx.fillRect(0,S,2*S,S-SCALE);
    ctx.fillStyle=C.chairBack; ctx.fillRect(0,S,2*S,SCALE*2);
    // Cracked legs
    ctx.fillStyle=C.chairLeg; ctx.fillRect(0,2*S-SCALE*3,SCALE*2,SCALE*3);
    ctx.fillRect(2*S-SCALE*2,2*S-SCALE*3,SCALE*2,SCALE*3);
    ctx.strokeStyle='#1a0a00'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(0,2*S); ctx.lineTo(SCALE*3,(2*S-SCALE)*1); ctx.stroke();
    // Plastic bag
    ctx.fillStyle=C.trashBagT; ctx.fillRect(SCALE*3,S+SCALE*2,S-SCALE,S/2);
    ctx.fillStyle='rgba(180,180,160,0.2)'; ctx.fillRect(SCALE*3,S+SCALE*2,S-SCALE,S/2);
  }
});

/* ── SHELF (13,1) ── */
OBJECTS.push({
  tx:13, ty:1, w:4, h:2,
  hx:13, hy:1, hw:4, hh:1,
  label:'Étagère',
  lines:[
    '"Clouée de travers. Tout penche à gauche."',
    '"Une photo encadrée. Personne ne sait qui c\'est."',
    '"3 boîtes de conserve vides. Art contemporain."',
  ],
  draw(ctx) {
    // Brackets
    ctx.fillStyle=C.shelfWall;
    ctx.fillRect(SCALE,0,SCALE*2,2*S);
    ctx.fillRect(4*S-SCALE*3,0,SCALE*2,2*S);
    // Board
    ctx.fillStyle=C.shelfBoard; ctx.fillRect(0,S-SCALE*2,4*S,SCALE*3);
    ctx.fillStyle='#8a6030'; ctx.fillRect(0,S-SCALE*3,4*S,SCALE);
    // Cans
    ctx.fillStyle='#6080a0'; ctx.fillRect(SCALE*3,0,S-SCALE*4,S-SCALE*3);
    ctx.fillStyle='#8090c0'; ctx.fillRect(SCALE*3,0,S-SCALE*4,SCALE*2);
    ctx.fillStyle='#a06040'; ctx.fillRect(S+SCALE*3,0,S-SCALE*4,S-SCALE*3);
    ctx.fillStyle='#c08060'; ctx.fillRect(S+SCALE*3,0,S-SCALE*4,SCALE*2);
    // Photo frame
    ctx.fillStyle=C.tableTop; ctx.fillRect(2*S+SCALE*2,0,S-SCALE*3,S-SCALE*3);
    ctx.fillStyle='#c8c0a0'; ctx.fillRect(2*S+SCALE*3,SCALE,S-SCALE*5,S-SCALE*5);
    ctx.fillStyle='#a0b8d0'; ctx.fillRect(2*S+SCALE*4,SCALE*2,S/2,S/2);
    // Candle
    ctx.fillStyle='#f0e0b0'; ctx.fillRect(3*S+SCALE*2,S/2,SCALE*2,S/2-SCALE);
    ctx.fillStyle='#ff8000'; ctx.fillRect(3*S+SCALE*2+1,S/2-SCALE,1,SCALE*2);
    // Dust particles
    ctx.fillStyle='rgba(200,180,140,0.4)';
    ctx.fillRect(SCALE*2,S-SCALE*2,S*3,SCALE);
  }
});

/* ── SUSPICIOUS BOX (1,7) ── */
OBJECTS.push({
  tx:1, ty:7, w:2, h:2,
  label:'Boîte de G. Mouton',
  lines:[
    '"\'NE PAS TOUCHER — G. MOUTON\'. G. Mouton est mort en 2019."',
    '"Elle fait un bruit d\'eau si tu l\'agites. Ce n\'est pas de l\'eau."',
    '"La boîte te regarde. Ou c\'est toi. T\'as pas dormi."',
  ],
  draw(ctx) {
    ctx.fillStyle=C.boxBrown; ctx.fillRect(0,SCALE*2,2*S,2*S-SCALE*2);
    // Tape cross
    ctx.fillStyle=C.boxTape; ctx.fillRect(S-SCALE,SCALE*2,SCALE*2,2*S-SCALE*2);
    ctx.fillRect(0,S,2*S,SCALE*2);
    // Top flaps
    ctx.fillStyle=C.boxDark; ctx.fillRect(0,0,S-SCALE*2,SCALE*2);
    ctx.fillRect(S+SCALE*2,0,S-SCALE*2,SCALE*2);
    // Stamp
    ctx.fillStyle='rgba(180,0,0,0.35)'; ctx.fillRect(SCALE*3,S,S+SCALE,S/2);
    ctx.fillStyle='#c04040'; ctx.font=`${SCALE*2}px monospace`;
    ctx.textBaseline='top'; ctx.textAlign='left';
    ctx.fillText('!',SCALE*4,S+SCALE);
    // Shadow
    ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(0,2*S-SCALE,2*S,SCALE);
  }
});

/* ── RAT KEVIN (9,7) ── */
OBJECTS.push({
  tx:9, ty:7, w:1, h:1,
  label:'Kevin',
  lines:[
    '"C\'est Kevin. Pas de loyer. Là depuis plus longtemps que toi."',
    '"Kevin te regarde avec mépris. Kevin s\'en sort mieux."',
    '"Kevin a un plan. Kevin ne partage pas."',
  ],
  draw(ctx) {
    // Body
    ctx.fillStyle=C.ratBody; ctx.fillRect(SCALE*4,SCALE*6,S-SCALE*8,S-SCALE*8);
    // Head
    ctx.fillRect(0,SCALE*4,S-SCALE*8,S-SCALE*10);
    // Ears
    ctx.fillStyle=C.ratEar; ctx.fillRect(0,0,SCALE*4,SCALE*4);
    ctx.fillRect(SCALE*5,0,SCALE*4,SCALE*4);
    // Inner ear
    ctx.fillStyle='#c08080'; ctx.fillRect(SCALE,SCALE,SCALE*2,SCALE*2);
    ctx.fillRect(SCALE*6,SCALE,SCALE*2,SCALE*2);
    // Eye
    ctx.fillStyle=C.ratEye; ctx.fillRect(SCALE*2,SCALE*5,SCALE*2,SCALE*2);
    // Nose
    ctx.fillStyle='#ff8080'; ctx.fillRect(0,SCALE*7,SCALE*2,SCALE);
    // Tail
    ctx.strokeStyle='#2a1a10'; ctx.lineWidth=SCALE*0.7;
    ctx.beginPath();
    ctx.moveTo((S-SCALE*2)*1,(SCALE*10)*1);
    ctx.quadraticCurveTo(S,(SCALE*14)*1,(S+SCALE*4)*1,(SCALE*12)*1);
    ctx.stroke();
    // Whiskers
    ctx.strokeStyle='#c8b090'; ctx.lineWidth=0.5;
    ctx.beginPath(); ctx.moveTo(0,SCALE*6); ctx.lineTo(-SCALE*4,SCALE*5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,SCALE*7); ctx.lineTo(-SCALE*4,SCALE*8); ctx.stroke();
  }
});

/* ── TRASH PILE (1,11) ── */
OBJECTS.push({
  tx:1, ty:11, w:3, h:2,
  label:'Tas de déchets',
  lines:[
    '"Un système d\'organisation que toi seul comprends."',
    '"3 télécommandes orphelines, 1 rolodex, et la vérité."',
    '"Fouiller ici : RICHE ou tétanos. Probablement tétanos."',
  ],
  draw(ctx) {
    // Bags
    ctx.fillStyle=C.trashBag; ctx.fillRect(0,S,3*S,S);
    ctx.fillStyle=C.trashBagT; ctx.fillRect(0,S,3*S,SCALE*2);
    // Knots
    ctx.fillStyle='#4a4a4a';
    ctx.fillRect(S-SCALE*2,S-SCALE,SCALE*4,SCALE);
    ctx.fillRect(2*S+SCALE,S-SCALE,SCALE*4,SCALE);
    // Junk on top: plank, bottle, can
    ctx.fillStyle='#8a6030'; ctx.fillRect(SCALE,S-SCALE*4,S,SCALE*3);
    ctx.fillStyle=C.bottleBody; ctx.fillRect(2*S-SCALE,S-SCALE*5,SCALE*3,SCALE*5);
    ctx.fillStyle=C.bottleCap; ctx.fillRect(2*S-SCALE,S-SCALE*5,SCALE*3,SCALE);
    ctx.fillStyle='#6080a0'; ctx.fillRect(2*S+SCALE*4,S-SCALE*4,SCALE*4,SCALE*4);
    ctx.fillStyle='#8090c0'; ctx.fillRect(2*S+SCALE*4,S-SCALE*4,SCALE*4,SCALE);
    // Shadow
    ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.fillRect(0,2*S-SCALE,3*S,SCALE);
  }
});

/* ── BUCKET (14,9) ── */
OBJECTS.push({
  tx:14, ty:9, w:1, h:2,
  label:'Seau',
  lines:[
    '"Eau marron dedans. Tu l\'appelles \'soupe du plafond\'."',
    '"Le plafond fuit. Le seau est plein. Tu l\'as pas vidé."',
  ],
  draw(ctx) {
    // Handle arc
    ctx.strokeStyle=C.bucketHandle; ctx.lineWidth=SCALE;
    ctx.beginPath();
    ctx.arc(S/2,S*0.6,S*0.3,Math.PI,0);
    ctx.stroke();
    // Body
    ctx.fillStyle='#5070a0'; ctx.fillRect(SCALE,S/2+SCALE,S-SCALE*2,S);
    ctx.fillStyle=C.bucketBody; ctx.fillRect(0,S/2,S,S-SCALE);
    ctx.fillStyle='#80a0c0'; ctx.fillRect(0,S/2,S,SCALE*2); // rim
    // Dirty water
    ctx.fillStyle=C.bucketDirt; ctx.fillRect(SCALE,S+S/2-SCALE*4,S-SCALE*2,SCALE*4);
    ctx.fillStyle='rgba(120,90,50,0.5)'; ctx.fillRect(SCALE,S+S/2-SCALE*4,S-SCALE*2,SCALE);
  }
});

/* ── LAMP (16,3) ── */
OBJECTS.push({
  tx:16, ty:3, w:1, h:3,
  hx:16, hy:3, hw:1, hh:2,
  label:'Lampe de chevet',
  lines:[
    '"Elle clignote toutes les 30s. Ce n\'est pas prévu."',
    '"40W dans un abat-jour prévu pour 15W. Risqué."',
  ],
  draw(ctx) {
    // Base
    ctx.fillStyle=C.lampBase; ctx.fillRect(S/2-SCALE*2,2*S+SCALE,SCALE*4,SCALE*2);
    // Pole
    ctx.fillStyle=C.lampBase; ctx.fillRect(S/2-SCALE/2,S,SCALE,S);
    // Shade
    ctx.fillStyle=C.lampShade; ctx.fillRect(SCALE,0,S-SCALE*2,S);
    ctx.fillStyle=C.lampShadeD; ctx.fillRect(SCALE*2,SCALE,S-SCALE*4,S-SCALE*2);
    // Bulb glow flicker
    const glow = 0.15 + 0.08*Math.sin(Date.now()/600);
    ctx.fillStyle=`rgba(255,240,180,${glow})`;
    ctx.fillRect(0,0,S,S*2);
    // Bulb
    ctx.fillStyle='#ffffc0'; ctx.fillRect(S/2-SCALE,S-SCALE,SCALE*2,SCALE);
  }
});

/* ── WALL POSTER (5,1) ── */
OBJECTS.push({
  tx:5, ty:1, w:2, h:2,
  hx:5, hy:0, hw:0, hh:0,
  label:'Poster',
  lines:[
    '"\'WANTED — KEVIN LE RAT\'. Récompense : 0€."',
    '"Dessous : \'AUSSI WANTED — le proprio\'. Tu as ajouté ça."',
  ],
  draw(ctx) {
    ctx.fillStyle=C.posterBg; ctx.fillRect(0,0,2*S,2*S);
    ctx.fillStyle='#600000'; ctx.fillRect(SCALE,SCALE,2*S-SCALE*2,2*S-SCALE*2);
    // Skull pixel
    ctx.fillStyle='#f0e0b0';
    ctx.fillRect(S-SCALE*4,SCALE*3,SCALE*8,SCALE*7);
    ctx.fillStyle='#600000';
    ctx.fillRect(S-SCALE*3,SCALE*5,SCALE*2,SCALE*3);
    ctx.fillRect(S+SCALE,SCALE*5,SCALE*2,SCALE*3);
    // Text bars
    ctx.fillStyle=C.posterText; ctx.fillRect(SCALE*3,S+SCALE*3,2*S-SCALE*6,SCALE*2);
    ctx.fillStyle='#ff8080'; ctx.fillRect(SCALE*4,S+SCALE*7,2*S-SCALE*8,SCALE*2);
    // Pin
    ctx.fillStyle='#c0c0c0'; ctx.fillRect(S-SCALE,0,SCALE*2,SCALE*2);
    // Border
    ctx.strokeStyle='#ff2d00'; ctx.lineWidth=SCALE/2;
    ctx.strokeRect(SCALE,SCALE,2*S-SCALE*2,2*S-SCALE*2);
  }
});

/* ── TOILET (20,12) ── */
OBJECTS.push({
  tx:20, ty:12, w:2, h:2,
  label:'WC',
  lines:[
    '"Fonctionnent à 60%. Les 40% restants, on n\'en parle pas."',
    '"Marques sur le mur à côté. C\'est le calendrier."',
    '"L\'eau est d\'une couleur que l\'on qualifie de \'mystique\'."',
  ],
  draw(ctx) {
    // Tank
    ctx.fillStyle=C.toiletBody; ctx.fillRect(SCALE,0,2*S-SCALE*2,S);
    ctx.fillStyle=C.toiletLid; ctx.fillRect(SCALE,0,2*S-SCALE*2,SCALE*2);
    ctx.fillStyle='#d0d8d0'; ctx.fillRect(S-SCALE,SCALE*2,SCALE*2,SCALE*2);
    // Bowl
    ctx.fillStyle=C.toiletBody; ctx.fillRect(0,S,2*S,S);
    ctx.fillStyle=C.toiletBowl; ctx.fillRect(SCALE*2,S+SCALE*2,2*S-SCALE*4,S-SCALE*4);
    ctx.fillStyle='rgba(80,100,120,0.6)'; ctx.fillRect(SCALE*3,S+SCALE*4,2*S-SCALE*6,S-SCALE*6);
    // Lid
    ctx.fillStyle=C.toiletLid; ctx.fillRect(0,S,2*S,SCALE*2);
    // Stain
    ctx.fillStyle='rgba(100,100,60,0.5)'; ctx.fillRect(S,S+S*0.6,SCALE*4,SCALE*2);
  }
});

/* ── CLOCK (11,1) ── */
OBJECTS.push({
  tx:11, ty:1, w:1, h:1,
  hx:11, hy:0, hw:0, hh:0,
  label:'Horloge cassée',
  lines:[
    '"4h23 depuis 6 mois. Piles mortes. Flemme de les changer."',
    '"\'Il est toujours l\'heure quelque part.\' Toi tu t\'en fous."',
  ],
  draw(ctx) {
    ctx.fillStyle=C.clockBody; ctx.fillRect(SCALE,SCALE,S-SCALE*2,S-SCALE*2);
    ctx.fillStyle=C.clockFace; ctx.fillRect(SCALE*3,SCALE*3,S-SCALE*6,S-SCALE*6);
    // Hands
    const cx=S/2, cy=S/2;
    ctx.strokeStyle='#1a1200'; ctx.lineWidth=SCALE;
    ctx.beginPath(); ctx.moveTo(cx,cy);
    ctx.lineTo(cx+Math.cos(-Math.PI/2+2*Math.PI*4/12)*SCALE*4,
               cy+Math.sin(-Math.PI/2+2*Math.PI*4/12)*SCALE*4);
    ctx.stroke();
    ctx.lineWidth=SCALE*0.7;
    ctx.beginPath(); ctx.moveTo(cx,cy);
    ctx.lineTo(cx+Math.cos(-Math.PI/2+2*Math.PI*23/60)*SCALE*5,
               cy+Math.sin(-Math.PI/2+2*Math.PI*23/60)*SCALE*5);
    ctx.stroke();
    ctx.fillStyle='#1a1200'; ctx.fillRect(cx-SCALE,cy-SCALE,SCALE*2,SCALE*2);
  }
});

/* ── PLUNGER — PICKABLE WEAPON (19,9) ── */
OBJECTS.push({
  tx:19, ty:9, w:1, h:2,
  label:'Ventouse Sacrée',
  pickable:true,
  itemId:'plunger',
  itemName:'Ventouse Sacrée',
  itemDesc:'ATK +1 | Tue les cafards, créanciers et pire encore.',
  lines:[
    '"LA ventouse. Ton seul outil. Ta seule arme."',
    '"Elle brille d\'une aura étrange. +1 en Débrouillardise."',
    '"[ Appuie sur E pour RAMASSER ]"',
  ],
  draw(ctx) {
    // Glow aura
    const glow = 0.12 + 0.08*Math.sin(Date.now()/350);
    ctx.fillStyle=`rgba(255,220,0,${glow})`;
    ctx.fillRect(-SCALE*2,-SCALE*2,S+SCALE*4,2*S+SCALE*4);
    // Stick
    ctx.fillStyle=C.plungerStick;
    ctx.fillRect(S/2-SCALE,0,SCALE*2,2*S-SCALE*4);
    ctx.fillStyle='#6a4020'; ctx.fillRect(S/2-SCALE,0,SCALE,2*S-SCALE*4);
    // Cup
    ctx.fillStyle=C.plungerCup;
    ctx.fillRect(SCALE*2,2*S-SCALE*5,S-SCALE*4,SCALE*4);
    ctx.fillRect(0,2*S-SCALE*3,S,SCALE*2);
    ctx.fillStyle=C.plungerCupD;
    ctx.fillRect(0,2*S-SCALE*2,S,SCALE*2);
    // Sparkle
    const t=Date.now()/300;
    ctx.fillStyle='#ffe600';
    [0,1,2].forEach(i=>{
      const sx=Math.cos(t+i*2.1)*(SCALE*4)+S/2;
      const sy=Math.sin(t+i*2.1)*(SCALE*3)+S/2;
      ctx.fillRect(sx,sy,SCALE,SCALE);
    });
  }
});

/* ─── PLAYER ─────────────────────────────────────── */
let player = {
  tx:3.0, ty:5.0,  // spawn in front of bed
  facing:'down',
  frame:0, frameTimer:0,
  money:0, dignity:0,
  inventory:[],
  weapon:null,
};

/* ─── INPUT ──────────────────────────────────────── */
const keys = {};
document.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  if (e.key.toLowerCase()==='e') tryInteract();
  if (e.key.toLowerCase()==='q') toggleInventory();
  if (e.key==='Escape') togglePause();
});
document.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

/* ─── GAME STATE ─────────────────────────────────── */
let gameState   = 'playing';
let dialogQueue = [];
let dialogIdx   = 0;
let dialogObj   = null;

/* ─── CANVAS ─────────────────────────────────────── */
let canvas, ctx, uiCanvas, uiCtx;

function startWorld() {
  const wrapper = document.createElement('div');
  wrapper.id = 'game-wrapper';
  wrapper.style.cssText =
    'position:fixed;inset:0;z-index:300;background:#0e0800;' +
    'display:flex;align-items:center;justify-content:center;overflow:hidden;' +
    'cursor:url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\'><text y=\'24\' font-size=\'24\'>💸</text></svg>") 16 16, auto;';

  canvas = document.createElement('canvas');
  canvas.style.cssText = 'image-rendering:pixelated;image-rendering:crisp-edges;position:absolute;';

  uiCanvas = document.createElement('canvas');
  uiCanvas.style.cssText = 'position:absolute;top:0;left:0;image-rendering:pixelated;pointer-events:none;';

  wrapper.appendChild(canvas); wrapper.appendChild(uiCanvas);
  document.body.appendChild(wrapper);

  ctx   = canvas.getContext('2d');
  uiCtx = uiCanvas.getContext('2d');
  ctx.imageSmoothingEnabled = uiCtx.imageSmoothingEnabled = false;

  resizeGame();
  window.addEventListener('resize', resizeGame);

  setTimeout(()=>{
    showDialog(null,[
      '📢 MARDI, 07H43.',
      '"Tu te réveilles. Loyer dû dans 3 jours. Solde : -3,47€."',
      '"Aujourd\'hui tu deviens RICHE."',
      '"...ou pas. La ventouse est là. C\'est déjà quelque chose."',
    ]);
  },400);

  requestAnimationFrame(gameLoop);
}

function resizeGame(){
  const W=window.innerWidth, H=window.innerHeight;
  const mapW=COLS*S, mapH=ROWS*S;
  canvas.width=mapW; canvas.height=mapH;
  const fit=Math.min(W/mapW, H/mapH);
  canvas.style.width=mapW*fit+'px'; canvas.style.height=mapH*fit+'px';
  canvas.style.left=((W-mapW*fit)/2)+'px'; canvas.style.top=((H-mapH*fit)/2)+'px';
  uiCanvas.width=W; uiCanvas.height=H;
  uiCanvas.style.width=W+'px'; uiCanvas.style.height=H+'px';
}

/* ─── LOOP ───────────────────────────────────────── */
let lastTime=0;
function gameLoop(ts){
  const dt=Math.min((ts-lastTime)/1000,0.05); lastTime=ts;
  if(gameState==='playing') updatePlayer(dt);
  drawWorld(); drawUI();
  requestAnimationFrame(gameLoop);
}

/* ─── UPDATE ─────────────────────────────────────── */
const SPEED=6;
function updatePlayer(dt){
  let dx=0,dy=0;
  if(keys['w']||keys['arrowup'])    dy=-1;
  if(keys['s']||keys['arrowdown'])  dy= 1;
  if(keys['a']||keys['arrowleft'])  dx=-1;
  if(keys['d']||keys['arrowright']) dx= 1;
  if(dx&&dy){dx*=0.707;dy*=0.707;}
  if(dx||dy){
    const nx=player.tx+dx*SPEED*dt;
    const ny=player.ty+dy*SPEED*dt;
    if(!isSolid(nx,player.ty)) player.tx=nx;
    if(!isSolid(player.tx,ny)) player.ty=ny;
    if(Math.abs(dx)>Math.abs(dy)) player.facing=dx>0?'right':'left';
    else player.facing=dy>0?'down':'up';
    player.frameTimer+=dt;
    if(player.frameTimer>0.13){player.frameTimer=0;player.frame=(player.frame+1)%4;}
  } else player.frame=0;
}

function isSolid(tx,ty){
  const col=Math.floor(tx),row=Math.floor(ty);
  if(col<0||row<0||col>=COLS||row>=ROWS) return true;
  if(SOLID_TILES.has(MAP[row]?.[col])) return true;
  for(const obj of OBJECTS){
    const hx=obj.hx!==undefined?obj.hx:obj.tx;
    const hy=obj.hy!==undefined?obj.hy:obj.ty;
    const hw=obj.hx!==undefined?obj.hw:obj.w;
    const hh=obj.hy!==undefined?obj.hh:obj.h;
    if(hw===0||hh===0) continue;
    if(tx+0.3>hx&&tx+0.7<hx+hw&&ty+0.3>hy&&ty+0.7<hy+hh) return true;
  }
  return false;
}

/* ─── INTERACT ───────────────────────────────────── */
function tryInteract(){
  if(gameState==='dialog'){
    dialogIdx++;
    if(dialogIdx>=dialogQueue.length){
      if(dialogObj&&dialogObj.pickable&&!player.inventory.find(i=>i.id===dialogObj.itemId)){
        pickupItem(dialogObj);
      } else {
        gameState='playing'; dialogObj=null;
      }
    }
    return;
  }
  if(gameState!=='playing') return;

  const off={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
  const [ox,oy]=off[player.facing];
  const cx=Math.floor(player.tx)+ox, cy=Math.floor(player.ty)+oy;
  const px_=Math.floor(player.tx),   py_=Math.floor(player.ty);

  for(const obj of OBJECTS){
    const hit=
      (cx>=obj.tx&&cx<obj.tx+obj.w&&cy>=obj.ty&&cy<obj.ty+obj.h)||
      (px_>=obj.tx&&px_<obj.tx+obj.w&&py_>=obj.ty&&py_<obj.ty+obj.h);
    if(hit){
      if(obj.pickable&&player.inventory.find(i=>i.id===obj.itemId))
        showDialog(obj,['"Tu l\'as déjà. Elle est dans ton inventaire."']);
      else showDialog(obj,obj.lines);
      return;
    }
  }
  // Door
  if((cx===10||cx===11)&&cy===15||(px_===10||px_===11)&&py_===15)
    showDialog(null,['"La porte. L\'extérieur. Le MONDE."','"(L\'extérieur arrive bientôt...)"']);
}

function pickupItem(obj){
  player.inventory.push({id:obj.itemId,name:obj.itemName,desc:obj.itemDesc,isWeapon:true,atk:1});
  player.weapon=obj.itemId;
  const idx=OBJECTS.indexOf(obj);
  if(idx>-1) OBJECTS.splice(idx,1);
  // Show pickup dialog WITHOUT triggering pickupItem again
  dialogObj=null;
  dialogQueue=['★ OBJET RÉCUPÉRÉ : '+obj.itemName, obj.itemDesc,
    '"Tu brandis la ventouse. Quelque chose change en toi."',
    '"ATK +1. DIGNITÉ -5. RESPECTABILITÉ : INCONNUE."'];
  dialogIdx=0;
  gameState='dialog';
}

function showDialog(obj,lines){
  if(gameState==='dialog') return;
  dialogObj=obj; dialogQueue=lines; dialogIdx=0; gameState='dialog';
}
function toggleInventory(){
  if(gameState==='dialog') return;
  gameState=gameState==='inventory'?'playing':'inventory';
}
function togglePause(){
  if(gameState==='dialog'||gameState==='inventory') return;
  gameState=gameState==='paused'?'playing':'paused';
}

/* ─── DRAW WORLD ─────────────────────────────────── */
function drawWorld(){
  ctx.fillStyle='#0a0604'; ctx.fillRect(0,0,canvas.width,canvas.height);
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) drawTile(c,r,MAP[r][c]);
  const sorted=[...OBJECTS].sort((a,b)=>(a.ty+a.h)-(b.ty+b.h));
  for(const obj of sorted){
    ctx.save(); ctx.translate(obj.tx*S,obj.ty*S); obj.draw(ctx); ctx.restore();
  }
  drawPlayer();
  drawHint();
}

/* ─── TILES ──────────────────────────────────────── */
function drawTile(col,row,id){
  ctx.save(); ctx.translate(col*S,row*S);
  if(id===3||id===8){ drawWallH(); if(id===8) drawHole(); }
  else if(id===4)   drawWallV();
  else if(id===5)   drawCorner();
  else if(id===6||id===7){ drawWoodFloor(col,row); drawRug(); }
  else if(id===2)   { drawWoodFloor(col,row); drawCrack(); }
  else if(id===1)   drawDarkFloor();
  else              drawWoodFloor(col,row);
  ctx.restore();
}

function drawWoodFloor(col,row){
  const v=(col*3+row*7)%3;
  ctx.fillStyle=v===0?C.floorA:v===1?C.floorB:C.floorC;
  ctx.fillRect(0,0,S,S);
  ctx.fillStyle=C.floorDark;
  for(let p=4;p<TILE;p+=4) ctx.fillRect(0,p*SCALE,S,1);
  if((col+row*2)%4===0){
    ctx.globalAlpha=0.12; ctx.fillStyle=C.floorCrack;
    ctx.fillRect(S*0.3,0,1,S); ctx.globalAlpha=1;
  }
}
function drawDarkFloor(){
  ctx.fillStyle=C.floorDark; ctx.fillRect(0,0,S,S);
  ctx.fillStyle=C.floorCrack;
  for(let p=4;p<TILE;p+=4) ctx.fillRect(0,p*SCALE,S,1);
}
function drawCrack(){
  ctx.strokeStyle=C.floorCrack; ctx.lineWidth=SCALE*0.5;
  ctx.beginPath(); ctx.moveTo(S*0.2,S*0.1); ctx.lineTo(S*0.45,S*0.5); ctx.lineTo(S*0.35,S*0.85); ctx.stroke();
}
function drawRug(){
  const p=SCALE;
  ctx.fillStyle=C.rugA; ctx.fillRect(p,p,S-2*p,S-2*p);
  ctx.fillStyle=C.rugB; ctx.fillRect(p*3,p*3,S-p*6,S-p*6);
  ctx.fillStyle=C.rugBorder;
  ctx.fillRect(p,p,S-2*p,p); ctx.fillRect(p,S-2*p,S-2*p,p);
  ctx.fillRect(p,p,p,S-2*p); ctx.fillRect(S-2*p,p,p,S-2*p);
  ctx.fillStyle=C.rugAccent; ctx.fillRect(S/2-p,S/2-p,2*p,2*p);
}
function drawWallH(){
  for(let r=0;r<TILE;r+=4){
    ctx.fillStyle=r%8===0?C.wallTop:C.wallMid;
    ctx.fillRect(0,r*SCALE,S,4*SCALE);
  }
  ctx.fillStyle=C.wallShadow; ctx.fillRect(S/3,S/2,SCALE,SCALE);
  ctx.fillRect(S*2/3,S/3,SCALE,SCALE);
  ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(0,S-SCALE*3,S,SCALE*3);
}
function drawWallV(){
  for(let r=0;r<TILE;r+=4){
    ctx.fillStyle=r%8===0?C.wallMid:C.wallBot;
    ctx.fillRect(0,r*SCALE,S,4*SCALE);
  }
  ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.fillRect(S-SCALE*3,0,SCALE*3,S);
}
function drawCorner(){
  ctx.fillStyle=C.wallBot; ctx.fillRect(0,0,S,S);
  ctx.fillStyle='rgba(0,0,0,0.5)';
  ctx.fillRect(0,S-SCALE*3,S,SCALE*3); ctx.fillRect(S-SCALE*3,0,SCALE*3,S);
}
function drawHole(){
  ctx.fillStyle=C.wallHole;
  ctx.beginPath(); ctx.ellipse(S/2,S/2,S*0.26,S*0.18,0.1,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=C.wallShadow; ctx.lineWidth=SCALE; ctx.stroke();
}

/* ─── PLAYER PIXEL ART ───────────────────────────── */
function drawPlayer(){
  const x=player.tx*S+S/2, y=player.ty*S+S/2;
  const bob=(player.frame===1||player.frame===3)?-SCALE:0;
  const loff=player.frame===1?2:player.frame===3?-2:0;
  const aoff=player.frame===1?-2:player.frame===3?2:0;
  const p=SCALE;

  ctx.save();
  ctx.translate(x,y+bob);

  // Shadow
  ctx.globalAlpha=0.28; ctx.fillStyle='#000';
  ctx.beginPath(); ctx.ellipse(0,S*0.38,S*0.24,S*0.07,0,0,Math.PI*2); ctx.fill();
  ctx.globalAlpha=1;

  if(player.facing==='left') ctx.scale(-1,1);

  // Legs
  ctx.fillStyle='#2a2018';
  ctx.fillRect(-5*p,4*p,4*p,8*p+loff*p);
  ctx.fillRect( 1*p,4*p,4*p,8*p-loff*p);
  // Knee patch
  ctx.fillStyle='#3a3028'; ctx.fillRect(-4*p,8*p+loff*p,2*p,2*p);
  // Shoes
  ctx.fillStyle='#1a1008';
  ctx.fillRect(-6*p,12*p+loff*p,5*p,3*p);
  ctx.fillRect( 1*p,12*p-loff*p,5*p,3*p);

  // Arms
  ctx.fillStyle='#4a5a2a';
  ctx.fillRect(-9*p,-6*p+aoff*p,4*p,10*p);
  ctx.fillRect( 5*p,-6*p-aoff*p,4*p,10*p);

  // Weapon (plunger held)
  if(player.weapon==='plunger'){
    ctx.save();
    ctx.translate((player.facing==='left'?-1:1)*12*p,-4*p-aoff*p);
    ctx.fillStyle=C.plungerStick; ctx.fillRect(-p,0,p*2,10*p);
    ctx.fillStyle=C.plungerCup; ctx.fillRect(-p*2,10*p,p*4,p*3);
    ctx.fillStyle=C.plungerCupD; ctx.fillRect(-p*2,12*p,p*4,p);
    ctx.restore();
  }

  // Coat
  ctx.fillStyle='#4a5a2a'; ctx.fillRect(-6*p,-8*p,12*p,13*p);
  // Tear
  ctx.fillStyle='#2a3a10'; ctx.fillRect(2*p,-2*p,2*p,6*p);
  // Shirt
  ctx.fillStyle='#8a7050'; ctx.fillRect(-2*p,2*p,4*p,3*p);
  // Hands
  ctx.fillStyle='#c8a070';
  ctx.fillRect(-9*p,4*p+aoff*p,4*p,3*p);
  ctx.fillRect( 5*p,4*p-aoff*p,4*p,3*p);
  // Neck
  ctx.fillRect(-2*p,-9*p,4*p,2*p);
  // Head
  ctx.fillRect(-5*p,-18*p,10*p,9*p);
  // Hair
  ctx.fillStyle='#2a1a0a';
  ctx.fillRect(-5*p,-19*p,10*p,3*p);
  ctx.fillRect(-6*p,-18*p,2*p,5*p);
  ctx.fillRect( 4*p,-18*p,3*p,4*p);
  ctx.fillRect(-2*p,-19*p,2*p,2*p);
  // Face
  if(player.facing==='up'){
    ctx.fillStyle='#2a1a0a'; ctx.fillRect(-3*p,-14*p,6*p,2*p);
  } else {
    ctx.fillStyle='#1a1008';
    ctx.fillRect(-3*p,-14*p,2*p,2*p); ctx.fillRect(1*p,-14*p,2*p,2*p);
    ctx.fillStyle='#8a7060';
    ctx.fillRect(-3*p,-12*p,2*p,p); ctx.fillRect(1*p,-12*p,2*p,p);
    ctx.fillStyle='#6a5040'; ctx.fillRect(-2*p,-10*p,5*p,p);
  }
  ctx.restore();
}

/* ─── HINT ───────────────────────────────────────── */
function drawHint(){
  if(gameState!=='playing') return;
  const off={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
  const [ox,oy]=off[player.facing];
  const cx=Math.floor(player.tx)+ox, cy=Math.floor(player.ty)+oy;
  let nearObj=null;
  for(const obj of OBJECTS)
    if(cx>=obj.tx&&cx<obj.tx+obj.w&&cy>=obj.ty&&cy<obj.ty+obj.h){nearObj=obj;break;}
  const nearDoor=(cx===10||cx===11)&&cy===15;
  if(!nearObj&&!nearDoor) return;

  const tx=nearObj?(nearObj.tx+nearObj.w/2)*S:10.5*S;
  const ty=nearObj?nearObj.ty*S-SCALE*5:15*S-SCALE*5;
  const isPickup=nearObj?.pickable&&!player.inventory.find(i=>i.id===nearObj.itemId);
  const label=isPickup?'E  PRENDRE':'E';
  const bw=isPickup?S*2.2:S*0.75;
  const pulse=0.8+0.2*Math.sin(Date.now()/250);

  ctx.save();
  ctx.globalAlpha=pulse;
  ctx.fillStyle=C.hintBg; ctx.strokeStyle=C.hintText; ctx.lineWidth=SCALE;
  roundRect(ctx,tx-bw/2,ty-S*0.35,bw,S*0.55,SCALE*2);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle=C.hintText;
  ctx.font=`bold ${SCALE*4}px monospace`;
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(label,tx,ty-S*0.08);
  ctx.restore();
}

function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
  ctx.arcTo(x+w,y,x+w,y+r,r); ctx.lineTo(x+w,y+h-r);
  ctx.arcTo(x+w,y+h,x+w-r,y+h,r); ctx.lineTo(x+r,y+h);
  ctx.arcTo(x,y+h,x,y+h-r,r); ctx.lineTo(x,y+r);
  ctx.arcTo(x,y,x+r,y,r); ctx.closePath();
}

/* ─── UI ─────────────────────────────────────────── */
function drawUI(){
  uiCtx.clearRect(0,0,uiCanvas.width,uiCanvas.height);
  drawHUD();
  if(gameState==='dialog')    drawDialog();
  if(gameState==='inventory') drawInventory();
  if(gameState==='paused')    drawPause();
}

function drawHUD(){
  const W=uiCanvas.width,pad=14;
  uiCtx.fillStyle='rgba(10,6,0,0.88)'; uiCtx.fillRect(0,0,W,46);
  uiCtx.fillStyle='#ffe600'; uiCtx.fillRect(0,44,W,2);
  uiCtx.font='bold 14px "IBM Plex Mono",monospace';
  uiCtx.fillStyle='#ffe600'; uiCtx.textBaseline='middle';
  uiCtx.textAlign='left';
  uiCtx.fillText(`💰 ${player.money}€`,pad,23);
  uiCtx.fillText(`☠ DIGNITY: ${player.dignity}%`,pad+140,23);
  if(player.weapon){
    uiCtx.fillStyle='#ff6040';
    uiCtx.fillText(`⚔ ${player.inventory.find(i=>i.id===player.weapon)?.name}`,pad+340,23);
  }
  uiCtx.textAlign='right'; uiCtx.fillStyle='rgba(255,255,255,0.3)';
  uiCtx.font='10px "IBM Plex Mono",monospace';
  uiCtx.fillText('[E] Interagir  [Q] Inventaire  [ESC] Pause',W-pad,23);
}

function drawDialog(){
  if(!dialogQueue.length) return;
  const W=uiCanvas.width,H=uiCanvas.height;
  const bh=148,bw=W-48,bx=24,by=H-bh-24;
  uiCtx.save();
  uiCtx.fillStyle='rgba(8,5,0,0.94)'; uiCtx.strokeStyle='#ffe600'; uiCtx.lineWidth=3;
  uiCtx.beginPath(); uiCtx.roundRect(bx,by,bw,bh,8); uiCtx.fill(); uiCtx.stroke();
  uiCtx.fillStyle='#ffe600'; uiCtx.fillRect(bx+3,by+3,bw-6,3);
  if(dialogObj){
    const lw=Math.min(uiCtx.measureText('  '+dialogObj.label+'  ').width+24,220);
    uiCtx.fillStyle='#ffe600'; uiCtx.beginPath();
    uiCtx.roundRect(bx+16,by-16,lw,24,4); uiCtx.fill();
    uiCtx.fillStyle='#1a1200'; uiCtx.font='bold 13px "IBM Plex Mono",monospace';
    uiCtx.textAlign='left'; uiCtx.textBaseline='middle';
    uiCtx.fillText(dialogObj.label,bx+24,by-4);
  }
  uiCtx.fillStyle='#f2e8c9'; uiCtx.font='17px "Permanent Marker",cursive';
  uiCtx.textAlign='left'; uiCtx.textBaseline='top';
  wrapText(uiCtx,dialogQueue[dialogIdx]||'',bx+20,by+18,bw-48,26);
  for(let i=0;i<dialogQueue.length;i++){
    uiCtx.fillStyle=i===dialogIdx?'#ffe600':'rgba(255,230,0,0.2)';
    uiCtx.beginPath(); uiCtx.arc(bx+20+i*16,by+bh-16,5,0,Math.PI*2); uiCtx.fill();
  }
  if(Math.floor(Date.now()/500)%2===0){
    uiCtx.fillStyle='#ffe600'; uiCtx.font='20px monospace';
    uiCtx.textAlign='right'; uiCtx.textBaseline='bottom';
    uiCtx.fillText('▶',bx+bw-14,by+bh-10);
  }
  uiCtx.restore();
}

function drawInventory(){
  const W=uiCanvas.width,H=uiCanvas.height;
  uiCtx.save();
  uiCtx.fillStyle='rgba(0,0,0,0.72)'; uiCtx.fillRect(0,0,W,H);
  const bw=Math.min(560,W-40),bh=400,bx=(W-bw)/2,by=(H-bh)/2;
  uiCtx.fillStyle='#0e0800'; uiCtx.strokeStyle='#ffe600'; uiCtx.lineWidth=3;
  uiCtx.beginPath(); uiCtx.roundRect(bx,by,bw,bh,10); uiCtx.fill(); uiCtx.stroke();
  uiCtx.fillStyle='#ffe600'; uiCtx.fillRect(bx+3,by+3,bw-6,3);
  uiCtx.font='bold 20px "Permanent Marker",cursive';
  uiCtx.textAlign='center'; uiCtx.textBaseline='top';
  uiCtx.fillText('📦 INVENTAIRE DE MAGOUILLES',W/2,by+18);
  uiCtx.strokeStyle='rgba(255,230,0,0.2)'; uiCtx.lineWidth=1;
  uiCtx.beginPath(); uiCtx.moveTo(bx+20,by+55); uiCtx.lineTo(bx+bw-20,by+55); uiCtx.stroke();

  if(player.inventory.length===0){
    uiCtx.fillStyle='rgba(255,255,255,0.28)'; uiCtx.font='15px "IBM Plex Mono",monospace';
    uiCtx.textAlign='center'; uiCtx.textBaseline='middle';
    uiCtx.fillText('Vide. Comme ton frigo. Et ton âme.',W/2,by+bh/2);
  } else {
    player.inventory.forEach((item,i)=>{
      const iy=by+70+i*85;
      uiCtx.fillStyle='rgba(255,230,0,0.07)'; uiCtx.strokeStyle='rgba(255,230,0,0.25)'; uiCtx.lineWidth=1;
      uiCtx.beginPath(); uiCtx.roundRect(bx+20,iy,bw-40,75,6); uiCtx.fill(); uiCtx.stroke();
      if(item.isWeapon){
        uiCtx.fillStyle='#c03020'; uiCtx.beginPath(); uiCtx.roundRect(bx+30,iy+10,60,18,3); uiCtx.fill();
        uiCtx.fillStyle='#fff'; uiCtx.font='bold 9px monospace';
        uiCtx.textAlign='center'; uiCtx.textBaseline='middle';
        uiCtx.fillText('⚔ ARME',bx+60,iy+19);
      }
      uiCtx.fillStyle='#ffe600'; uiCtx.font='bold 15px "Permanent Marker",cursive';
      uiCtx.textAlign='left'; uiCtx.textBaseline='top';
      uiCtx.fillText(item.name,bx+100,iy+12);
      uiCtx.fillStyle='#c8b090'; uiCtx.font='12px "IBM Plex Mono",monospace';
      uiCtx.fillText(item.desc,bx+100,iy+38);
      if(item.atk){
        uiCtx.fillStyle='#ff6040'; uiCtx.font='bold 11px monospace';
        uiCtx.fillText(`ATK: +${item.atk}`,bx+30,iy+40);
      }
    });
  }
  uiCtx.fillStyle='#f2e8c9'; uiCtx.font='12px "IBM Plex Mono",monospace';
  uiCtx.textAlign='left'; uiCtx.textBaseline='bottom';
  uiCtx.fillText(`💰 ${player.money}€  |  ☠ ${player.dignity}%  |  📦 ${player.inventory.length} objet(s)`,bx+20,by+bh-14);
  uiCtx.fillStyle='rgba(255,230,0,0.4)'; uiCtx.textAlign='right';
  uiCtx.fillText('[Q] Fermer',bx+bw-16,by+bh-14);
  uiCtx.restore();
}

function drawPause(){
  const W=uiCanvas.width,H=uiCanvas.height;
  uiCtx.save();
  uiCtx.fillStyle='rgba(0,0,0,0.65)'; uiCtx.fillRect(0,0,W,H);
  uiCtx.fillStyle='#ffe600'; uiCtx.font='bold 48px "Bebas Neue",sans-serif';
  uiCtx.textAlign='center'; uiCtx.textBaseline='middle';
  uiCtx.fillText('EN PAUSE',W/2,H/2-24);
  uiCtx.fillStyle='rgba(255,255,255,0.4)'; uiCtx.font='15px "IBM Plex Mono",monospace';
  uiCtx.fillText('( ESC pour reprendre )',W/2,H/2+20);
  uiCtx.restore();
}

function wrapText(ctx,text,x,y,maxW,lineH){
  const words=text.split(' '); let line='',curY=y;
  for(const w of words){
    const t=line+w+' ';
    if(ctx.measureText(t).width>maxW&&line!==''){ctx.fillText(line.trim(),x,curY);line=w+' ';curY+=lineH;}
    else line=t;
  }
  if(line.trim()) ctx.fillText(line.trim(),x,curY);
}
