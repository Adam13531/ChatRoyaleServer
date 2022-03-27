import _ from 'lodash'
import FizzBuzz from './FizzBuzz'
import USStates from './USStates'
import Colors from './Colors'

export default class PromptChooser {
  // Note: I don't know how to make the type more generic than "typeof
  // FizzBuzz", so I'm using this all over the place.
  allPrompts: Array<typeof FizzBuzz>
  availablePrompts: Array<typeof FizzBuzz>
  public constructor() {
    this.allPrompts = [FizzBuzz, USStates, Colors]
    this.resetAvailablePrompts()
  }

  resetAvailablePrompts() {
    this.availablePrompts = _.clone(this.allPrompts)
  }

  public choosePrompt(): typeof FizzBuzz {
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
