import _ from 'lodash'
import Game from '../Game'
import Player from '../Player'
import Prompt from './Prompt'

export default class NotTwoPlusTwo extends Prompt {
  constructor(game: Game) {
    const prompt = "What isn't 2+2?"
    const duplicatesAllowed = false
    const timer = 6
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
