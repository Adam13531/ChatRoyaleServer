import _ from 'lodash'
import Game from '../Game'
import Player from '../Player'
import Prompt from './Prompt'

const fizzWords = ['fizz', 'fozz', 'fuzz']
const buzzWords = ['bizz', 'bozz', 'bazz', 'buzz']

export default class FizzBuzz extends Prompt {
  fizzWord: string
  buzzWord: string

  constructor(game: Game) {
    const fizzWord = _.sample(fizzWords)
    const buzzWord = _.sample(buzzWords)

    const prompt = `If your name has an A in it, type "${fizzWord}". If it has an E, type "${buzzWord}". If it has both, type "${fizzWord}${buzzWord}". If it has neither, type "${buzzWord}${fizzWord}".`
    const duplicatesAllowed = true
    const timer = 20
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

    this.fizzWord = fizzWord
    this.buzzWord = buzzWord
  }

  public preprocessChatMessage(
    sender: Player,
    tags: Record<string, any>,
    message: string
  ) {
    const name = sender.displayName.toLowerCase()
    const hasA = _.includes(name, 'a')
    const hasE = _.includes(name, 'e')
    let desiredMessage: string
    if (hasA && hasE) {
      desiredMessage = `${this.fizzWord}${this.buzzWord}`
    } else if (hasA) {
      desiredMessage = `${this.fizzWord}`
    } else if (hasE) {
      desiredMessage = `${this.buzzWord}`
    } else {
      desiredMessage = `${this.buzzWord}${this.fizzWord}`
    }

    if (message !== desiredMessage) {
      this.playerLost(sender, `You should have typed ${desiredMessage}`)
    }
  }
}
