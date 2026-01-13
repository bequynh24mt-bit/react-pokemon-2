
export const SPRITE_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";

export const POKEMON_DB = {
  starters: [
    { id: 4, name: 'Charmander', type: 'Fire', maxHp: 39, atk: 52, img: `${SPRITE_BASE}4.png`, 
      moves: [
        {name: 'Scratch', pwr: 40, type: 'Normal'},
        {name: 'Ember', pwr: 40, type: 'Fire'},
        {name: 'Flame Burst', pwr: 70, type: 'Fire'},
        {name: 'Fire Spin', pwr: 35, type: 'Fire'}
      ] },
    { id: 1, name: 'Bulbasaur', type: 'Grass', maxHp: 45, atk: 49, img: `${SPRITE_BASE}1.png`, 
      moves: [
        {name: 'Tackle', pwr: 40, type: 'Normal'},
        {name: 'Vine Whip', pwr: 45, type: 'Grass'},
        {name: 'Razor Leaf', pwr: 55, type: 'Grass'},
        {name: 'Seed Bomb', pwr: 80, type: 'Grass'}
      ] },
    { id: 7, name: 'Squirtle', type: 'Water', maxHp: 44, atk: 48, img: `${SPRITE_BASE}7.png`, 
      moves: [
        {name: 'Tackle', pwr: 40, type: 'Normal'},
        {name: 'Water Gun', pwr: 40, type: 'Water'},
        {name: 'Bubble Beam', pwr: 65, type: 'Water'},
        {name: 'Bite', pwr: 60, type: 'Dark'}
      ] }
  ],
  wild: [
    { id: 16, name: 'Pidgey', type: 'Flying', maxHp: 40, atk: 45, img: `${SPRITE_BASE}16.png`, moves: [
      {name: 'Gust', pwr: 40, type: 'Flying'},
      {name: 'Quick Attack', pwr: 40, type: 'Normal'},
      {name: 'Wing Attack', pwr: 60, type: 'Flying'},
      {name: 'Tackle', pwr: 40, type: 'Normal'}
    ] },
    { id: 19, name: 'Rattata', type: 'Normal', maxHp: 30, atk: 56, img: `${SPRITE_BASE}19.png`, moves: [
      {name: 'Tackle', pwr: 40, type: 'Normal'},
      {name: 'Bite', pwr: 60, type: 'Dark'},
      {name: 'Quick Attack', pwr: 40, type: 'Normal'},
      {name: 'Hyper Fang', pwr: 80, type: 'Normal'}
    ] },
    { id: 25, name: 'Pikachu', type: 'Electric', maxHp: 35, atk: 55, img: `${SPRITE_BASE}25.png`, moves: [
      {name: 'Thunder Shock', pwr: 40, type: 'Electric'},
      {name: 'Quick Attack', pwr: 40, type: 'Normal'},
      {name: 'Thunderbolt', pwr: 90, type: 'Electric'},
      {name: 'Electro Ball', pwr: 70, type: 'Electric'}
    ] },
    { id: 54, name: 'Psyduck', type: 'Water', maxHp: 50, atk: 52, img: `${SPRITE_BASE}54.png`, moves: [
      {name: 'Water Pulse', pwr: 60, type: 'Water'},
      {name: 'Confusion', pwr: 50, type: 'Psychic'},
      {name: 'Scratch', pwr: 40, type: 'Normal'},
      {name: 'Aqua Tail', pwr: 70, type: 'Water'}
    ] },
    { id: 129, name: 'Magikarp', type: 'Water', maxHp: 20, atk: 10, img: `${SPRITE_BASE}129.png`, moves: [
      {name: 'Splash', pwr: 0, type: 'Water'},
      {name: 'Tackle', pwr: 20, type: 'Normal'},
      {name: 'Flail', pwr: 30, type: 'Normal'},
      {name: 'Bite', pwr: 35, type: 'Dark'}
    ] },
    { id: 133, name: 'Eevee', type: 'Normal', maxHp: 55, atk: 55, img: `${SPRITE_BASE}133.png`, moves: [
      {name: 'Tackle', pwr: 40, type: 'Normal'},
      {name: 'Quick Attack', pwr: 40, type: 'Normal'},
      {name: 'Swift', pwr: 60, type: 'Normal'},
      {name: 'Bite', pwr: 60, type: 'Dark'}
    ] }
  ],
  legendary: [
    { id: 150, name: 'Mewtwo', type: 'Psychic', maxHp: 106, atk: 110, img: `${SPRITE_BASE}150.png`, moves: [
      {name: 'Psychic', pwr: 90, type: 'Psychic'},
      {name: 'Swift', pwr: 60, type: 'Normal'},
      {name: 'Psystrike', pwr: 100, type: 'Psychic'},
      {name: 'Shadow Ball', pwr: 80, type: 'Ghost'}
    ], isLegendary: true },
    { id: 384, name: 'Rayquaza', type: 'Dragon', maxHp: 105, atk: 150, img: `${SPRITE_BASE}384.png`, moves: [
      {name: 'Dragon Pulse', pwr: 85, type: 'Dragon'},
      {name: 'Extreme Speed', pwr: 80, type: 'Normal'},
      {name: 'Air Slash', pwr: 75, type: 'Flying'},
      {name: 'Outrage', pwr: 95, type: 'Dragon'}
    ], isLegendary: true }
  ]
};

export const MAP_DATA = [
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 1, 1, 1, 2, 2, 3, 0, 0, 0, 0, 0, 1, 1, 2],
  [2, 1, 1, 1, 2, 0, 0, 0, 2, 2, 2, 0, 1, 1, 2],
  [2, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 0, 0, 0, 2],
  [2, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 2],
  [2, 0, 1, 1, 1, 0, 2, 3, 2, 0, 1, 1, 1, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 1, 1, 2, 2, 0, 1, 1, 1, 0, 2, 2, 1, 1, 2],
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
];
