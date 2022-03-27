import _ from 'lodash'
import Game from '../Game'
import Player from '../Player'
import Prompt from './Prompt'

export default class Rage extends Prompt {
  constructor(game: Game) {
    const prompt = 'ENGAGE CAPS LOCK AND COMPLAIN ABOUT SOMETHING.'
    const duplicatesAllowed = false
    const timer = 20
    const allowOneAnswerPerPerson = true
    const requiresModeration = true
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
    if (message !== message.toUpperCase()) {
      this.playerLost(sender)
    }
  }
}
