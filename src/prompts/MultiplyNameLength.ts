import _ from 'lodash'
import Game from '../Game'
import Player from '../Player'
import Prompt from './Prompt'

export default class MultiplyNameLength extends Prompt {
  coefficient: number

  constructor(game: Game) {
    const coefficient = _.random(13, 99)
    const prompt = `Multiply the number of characters in your name by ${coefficient}. What is the result?`
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

    this.coefficient = coefficient
  }

  public preprocessChatMessage(
    sender: Player,
    tags: Record<string, any>,
    message: string
  ) {
    const nameLength = sender.displayName.length
    const desiredMessage = `${nameLength * this.coefficient}`
    if (message !== desiredMessage) {
      this.playerLost(sender, `You should have typed ${desiredMessage}`)
    }
  }
}
