import _ from 'lodash'
import Game from '../Game'
import Player from '../Player'
import Prompt from './Prompt'

export default class FizzBuzz extends Prompt {
  constructor(game: Game) {
    const prompt =
      'If your name has an A in it, type "fizz". If it has an E, type "buzz". If it has both, type "fizzbuzz". If it has neither, type "buzzfizz".'
    const duplicatesAllowed = true
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
  }

  public preprocessChatMessage(
    sender: Player,
    tags: Record<string, any>,
    message: string
  ) {
    if (sender.didLose()) {
      return
    }

    const name = sender.displayName.toLowerCase()
    const hasA = _.includes(name, 'a')
    const hasE = _.includes(name, 'e')
    let validMessage: boolean
    if (hasA && hasE) {
      validMessage = message === 'fizzbuzz'
    } else if (hasA) {
      validMessage = message === 'fizz'
    } else if (hasE) {
      validMessage = message === 'buzz'
    } else {
      validMessage = message === 'buzzfizz'
    }

    if (!validMessage) {
      this.playerLost(sender)
    }
  }
}
