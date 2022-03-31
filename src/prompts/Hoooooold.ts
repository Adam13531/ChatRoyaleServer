import _ from 'lodash'
import Game from '../Game'
import Player from '../Player'
import Prompt from './Prompt'

export default class Hoooooold extends Prompt {
  constructor(game: Game) {
    const prompt = `Get a message ready, but don't send it until <2 seconds are on the timer.`
    const duplicatesAllowed = false
    const timer = 11
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

  public postprocessChatMessage(
    sender: Player,
    tags: Record<string, any>,
    message: string
  ) {
    if (this.game.getRemainingTimerTime() >= 2) {
      this.playerLost(sender, `You sent your message too soon!`)
    }
  }
}
