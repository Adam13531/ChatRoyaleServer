import _ from 'lodash'
import Game from '../Game'
import Player from '../Player'
import Prompt from './Prompt'

export default class SequenceOfNumbers extends Prompt {
  nextNumber: number

  constructor(game: Game) {
    const nextNumber = _.random(2, 999)
    const prompt = `Type the next number in the sequence. The first person to send a message should start by typing ${nextNumber}.`
    const duplicatesAllowed = false
    const timer = 40
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

    this.nextNumber = nextNumber
  }

  public preprocessChatMessage(
    sender: Player,
    tags: Record<string, any>,
    message: string
  ) {
    if (message === `${this.nextNumber}`) {
      this.nextNumber++
    } else {
      this.playerLost(sender, `You should have typed ${this.nextNumber}`)
    }
  }
}
