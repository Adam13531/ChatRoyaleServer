import _ from 'lodash'
import Game from '../Game'
import Player from '../Player'
import Prompt from './Prompt'

export default class HoTtAkEs extends Prompt {
  constructor(game: Game) {
    const prompt = 'TyPe YoUr HoTtEsT tAkE lIkE tHiS.'
    const duplicatesAllowed = false
    const timer = 33
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

  private isUppercaseLetter(letter: string): boolean {
    return letter.toUpperCase() === letter
  }

  private isHotTake(message: string): boolean {
    // just take the letters and make sure they alternate case
    const lettersOnly = _.filter(message, (s) => /[a-zA-Z]/.test(s))
    if (_.isEmpty(lettersOnly)) {
      return false
    }

    let expectedCapital = !this.isUppercaseLetter(_.first(lettersOnly))
    for (let i = 1; i < lettersOnly.length; ++i) {
      const actualCapital = this.isUppercaseLetter(lettersOnly[i])
      if (actualCapital !== expectedCapital) {
        return false
      }
      expectedCapital = !expectedCapital
    }

    return true
  }

  public preprocessChatMessage(
    sender: Player,
    tags: Record<string, any>,
    message: string
  ) {
    if (!this.isHotTake(message)) {
      this.playerLost(sender, `YoU dIdN't TyPe LiKe ThIs`)
    }
  }
}
