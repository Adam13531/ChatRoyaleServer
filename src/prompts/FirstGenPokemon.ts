import _ from 'lodash'
import Game from '../Game'
import Player from '../Player'
import Prompt from './Prompt'

const pokemon = new Set([
  'bulbasaur',
  'ivysaur',
  'venusaur',
  'charmander',
  'charmeleon',
  'charizard',
  'squirtle',
  'wartortle',
  'blastoise',
  'caterpie',
  'metapod',
  'butterfree',
  'weedle',
  'kakuna',
  'beedrill',
  'pidgey',
  'pidgeotto',
  'pidgeot',
  'rattata',
  'raticate',
  'spearow',
  'fearow',
  'ekans',
  'arbok',
  'pikachu',
  'raichu',
  'sandshrew',
  'sandslash',
  'nidoran',
  'nidoran♀',
  'nidorina',
  'nidoqueen',
  'nidoran♂',
  'nidorino',
  'nidoking',
  'clefairy',
  'clefable',
  'vulpix',
  'ninetales',
  'jigglypuff',
  'wigglytuff',
  'zubat',
  'golbat',
  'oddish',
  'gloom',
  'vileplume',
  'paras',
  'parasect',
  'venonat',
  'venomoth',
  'diglett',
  'dugtrio',
  'meowth',
  'persian',
  'psyduck',
  'golduck',
  'mankey',
  'primeape',
  'growlithe',
  'arcanine',
  'poliwag',
  'poliwhirl',
  'poliwrath',
  'abra',
  'kadabra',
  'alakazam',
  'machop',
  'machoke',
  'machamp',
  'bellsprout',
  'weepinbell',
  'victreebel',
  'tentacool',
  'tentacruel',
  'geodude',
  'graveler',
  'golem',
  'ponyta',
  'rapidash',
  'slowpoke',
  'slowbro',
  'magnemite',
  'magneton',
  'farfetch',
  'doduo',
  'dodrio',
  'seel',
  'dewgong',
  'grimer',
  'muk',
  'shellder',
  'cloyster',
  'gastly',
  'haunter',
  'gengar',
  'onix',
  'drowzee',
  'hypno',
  'krabby',
  'kingler',
  'voltorb',
  'electrode',
  'exeggcute',
  'exeggutor',
  'cubone',
  'marowak',
  'hitmonlee',
  'hitmonchan',
  'lickitung',
  'koffing',
  'weezing',
  'rhyhorn',
  'rhydon',
  'chansey',
  'tangela',
  'kangaskhan',
  'horsea',
  'seadra',
  'goldeen',
  'seaking',
  'staryu',
  'starmie',
  'mr. mime',
  'scyther',
  'jynx',
  'electabuzz',
  'magmar',
  'pinsir',
  'tauros',
  'magikarp',
  'gyarados',
  'lapras',
  'ditto',
  'eevee',
  'vaporeon',
  'jolteon',
  'flareon',
  'porygon',
  'omanyte',
  'omastar',
  'kabuto',
  'kabutops',
  'aerodactyl',
  'snorlax',
  'articuno',
  'zapdos',
  'moltres',
  'dratini',
  'dragonair',
  'dragonite',
  'mewtwo',
  'mew',
])

export default class FirstGenPokemon extends Prompt {
  constructor(game: Game) {
    const prompt = 'Name a first-generation Pokémon.'
    const duplicatesAllowed = false
    const timer = 23
    const allowOneAnswerPerPerson = true
    const requiresModeration = false
    super(
      game,
      prompt,
      duplicatesAllowed,
      timer,
      allowOneAnswerPerPerson,
      requiresModeration
    )
  }

  public preprocessChatMessage(
    sender: Player,
    tags: Record<string, any>,
    message: string
  ) {
    const lowerCase = message.toLowerCase()

    if (!pokemon.has(lowerCase)) {
      this.playerLost(sender, `That isn't a first-gen Pokémon`)
    }
  }
}
