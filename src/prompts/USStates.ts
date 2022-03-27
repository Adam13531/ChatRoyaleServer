import _ from 'lodash'
import Game from '../Game'
import Player from '../Player'
import Prompt from './Prompt'

const states = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
]

export default class USStates extends Prompt {
  statesRemaining: Set<string>

  constructor(game: Game) {
    const prompt = 'Name a US state.'
    const duplicatesAllowed = false
    const timer = 20
    const allowOneMessagePerPerson = true
    const requiresModeration = false
    super(
      game,
      prompt,
      duplicatesAllowed,
      timer,
      allowOneMessagePerPerson,
      requiresModeration
    )

    this.statesRemaining = new Set()
    _.forEach(states, (state) => this.statesRemaining.add(state.toLowerCase()))
  }

  public preprocessChatMessage(
    sender: Player,
    tags: Record<string, any>,
    message: string
  ) {
    if (sender.didLose()) {
      return
    }

    const lowerCase = message.toLowerCase()

    if (this.statesRemaining.has(lowerCase)) {
      this.statesRemaining.delete(lowerCase)
    } else {
      this.playerLost(sender)
    }
  }
}
