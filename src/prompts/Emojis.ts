import _ from 'lodash'
import Game from '../Game'
import Player from '../Player'
import Prompt from './Prompt'

export default class Emojis extends Prompt {
  constructor(game: Game) {
    const prompt = 'Type a single emoji (Twitch emote do not count).'
    const duplicatesAllowed = false
    const timer = 12
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
}
