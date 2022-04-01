import _ from 'lodash'
import FizzBuzz from './FizzBuzz'
import USStates from './USStates'
import Colors from './Colors'
import MessageOfLength from './MessageOfLength'
import Spam from './Spam'
import SequenceOfNumbers from './SequenceOfNumbers'
import EliminateSomeone from './EliminateSomeone'
import NotTwoPlusTwo from './NotTwoPlusTwo'
import MultiplyNameLength from './MultiplyNameLength'
import GottaGoFast from './GottaGoFast'
import FirstGenPokemon from './FirstGenPokemon'
import Rage from './RAGE'
import CoinFlip from './CoinFlip'
import Emojis from './Emojis'
import Nanotransactions from './Nanotransactions'
import Chatcatenation from './Chatcatenation'
import Hoooooold from './Hoooooold'
import ListenToAdam from './ListenToAdam'
import TwitchEmotes from './TwitchEmotes'
import HoTtAkEs from './HoTtAkEs'

type PromptClass =
  | typeof FizzBuzz
  | typeof USStates
  | typeof Colors
  | typeof MessageOfLength
  | typeof Spam
  | typeof SequenceOfNumbers
  | typeof EliminateSomeone
  | typeof NotTwoPlusTwo
  | typeof MultiplyNameLength
  | typeof GottaGoFast
  | typeof FirstGenPokemon
  | typeof Rage
  | typeof CoinFlip
  | typeof Emojis
  | typeof Nanotransactions
  | typeof Chatcatenation
  | typeof Hoooooold
  | typeof ListenToAdam
  | typeof TwitchEmotes
  | typeof HoTtAkEs

export default class PromptChooser {
  allPrompts: Array<PromptClass>
  availablePrompts: Array<PromptClass>
  public constructor() {
    this.allPrompts = [
      FizzBuzz,
      USStates,
      Colors,
      MessageOfLength,
      Spam,
      SequenceOfNumbers,
      EliminateSomeone,
      NotTwoPlusTwo,
      MultiplyNameLength,
      GottaGoFast,
      FirstGenPokemon,
      Rage,
      CoinFlip,
      Emojis,
      Nanotransactions,
      Chatcatenation,
      Hoooooold,
      ListenToAdam,
      TwitchEmotes,
      HoTtAkEs,
    ]
    console.log(`${_.size(this.allPrompts)} prompts loaded`)
    // this.allPrompts = [Emojis]
    this.resetAvailablePrompts()
  }

  resetAvailablePrompts() {
    this.availablePrompts = _.clone(this.allPrompts)
  }

  public choosePrompt(): PromptClass {
    // Make sure we can't run out of prompts.
    if (_.isEmpty(this.availablePrompts)) {
      console.log('Ran out of available prompts. Resetting them all.')
      this.resetAvailablePrompts()
    }

    const prompt = _.sample(this.availablePrompts)
    _.pull(this.availablePrompts, prompt)

    return prompt
  }
}
