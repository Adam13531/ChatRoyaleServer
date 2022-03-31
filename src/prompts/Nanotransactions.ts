import _ from 'lodash'
import Game from '../Game'
import Player from '../Player'
import Prompt from './Prompt'

// You can't lose this one unless you type nothing.
export default class Nanotransactions extends Prompt {
  constructor(game: Game) {
    const prompt = `How many picopennies would you spend on this game if it had nanotransactions?`
    const duplicatesAllowed = true
    const timer = 12
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

  public postprocessChatMessage(
    sender: Player,
    tags: Record<string, any>,
    message: string
  ) {}
}
