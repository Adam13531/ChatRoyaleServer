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
    const name = sender.displayName.toLowerCase()
    const hasA = _.includes(name, 'a')
    const hasE = _.includes(name, 'e')
    let desiredMessage: string
    if (hasA && hasE) {
      desiredMessage = 'fizzbuzz'
    } else if (hasA) {
      desiredMessage = 'fizz'
    } else if (hasE) {
      desiredMessage = 'buzz'
    } else {
      desiredMessage = 'buzzfizz'
    }

    if (message !== desiredMessage) {
      this.playerLost(sender, `You should have typed ${desiredMessage}`)
    }
  }
}
