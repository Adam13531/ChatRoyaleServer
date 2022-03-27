import _ from 'lodash'
import Game from '../Game'
import Player from '../Player'
import Prompt from './Prompt'

export default class Colors extends Prompt {
  statesRemaining: Set<string>

  constructor(game: Game) {
    const prompt = 'Name a color.'
    const duplicatesAllowed = false
    const timer = 20
    const allowOneMessagePerPerson = true
    const requiresModeration = true
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
  ) {}
}
