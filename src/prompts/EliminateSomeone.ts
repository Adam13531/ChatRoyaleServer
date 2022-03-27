import _ from 'lodash'
import Game from '../Game'
import Player from '../Player'
import Prompt from './Prompt'

export default class EliminateSomeone extends Prompt {
  constructor(game: Game) {
    const prompt =
      'Type the name of a player. They will be eliminated. You can do this as many times as you want.'
    const duplicatesAllowed = true
    const timer = 25
    const allowOneAnswerPerPerson = false
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
    if (sender.didLose()) {
      return
    }

    this.makePlayerLoseByName(message)
  }
}
