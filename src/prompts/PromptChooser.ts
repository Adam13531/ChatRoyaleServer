import _ from 'lodash'
import FizzBuzz from './FizzBuzz'
import USStates from './USStates'
import Colors from './Colors'
import MessageOfLength from './MessageOfLength'
import Spam from './Spam'
import SequenceOfNumbers from './SequenceOfNumbers'
import EliminateSomeone from './EliminateSomeone'

type PromptClass =
  | typeof FizzBuzz
  | typeof USStates
  | typeof Colors
  | typeof MessageOfLength
  | typeof Spam
  | typeof SequenceOfNumbers
  | typeof EliminateSomeone

export default class PromptChooser {
  allPrompts: Array<PromptClass>
  availablePrompts: Array<PromptClass>
  public constructor() {
    this.allPrompts = [
      FizzBuzz,
      USStates,
      Colors,
      MessageOfLength,
      Spam,
      SequenceOfNumbers,
      EliminateSomeone,
    ]
    // this.allPrompts = [EliminateSomeone]
    this.resetAvailablePrompts()
  }

  resetAvailablePrompts() {
    this.availablePrompts = _.clone(this.allPrompts)
  }

  public choosePrompt(): PromptClass {
    // Make sure we can't run out of prompts.
    if (_.isEmpty(this.availablePrompts)) {
      console.log('Ran out of available prompts. Resetting them all.')
      this.resetAvailablePrompts()
    }

    const prompt = _.sample(this.availablePrompts)
    _.pull(this.availablePrompts, prompt)

    return prompt
  }
}
