import _ from 'lodash'
import Game from '../Game'
import Player from '../Player'
import Prompt from './Prompt'

export default class ListenToAdam extends Prompt {
  constructor(game: Game) {
    const prompt = `Listen to Adam for this prompt.`
    const duplicatesAllowed = true
    const timer = 35
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

  public postprocessChatMessage(
    sender: Player,
    tags: Record<string, any>,
    message: string
  ) {}
}
