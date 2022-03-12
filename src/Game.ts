import _ from 'lodash'

enum GameState {
  Idle = 1, // waiting for a command to start things
  Lobby, // players can register themselves
  Round, // playing a round
  InBetween, // between rounds. Waiting for a command to start the next round.
  End, // The game is over
}

export type Player = {
  displayName: string
  username: string
  isMod: boolean
  userId: string
  joinOrder: number
  lostInRound: number
}

function makePlayerFromTags(tags: Record<string, any>): Player {
  return {
    displayName: tags['display-name'] || tags.username,
    username: tags.username,
    isMod: tags.mod,
    userId: tags['user-id'],
    joinOrder: -1,
    lostInRound: -1,
  }
}

export default class Game {
  // TODO: uncomment this again so that we start in Idle
  // currentState: GameState = GameState.Idle
  currentState: GameState = GameState.Lobby
  // Keys are the player's userId
  allPlayers: Record<string, Player> = {}
  currentPlayers: Record<string, Player> = {}
  roundNumber: number = 0

  canAdvanceGameState() {
    return (
      this.currentState == GameState.Idle ||
      this.currentState == GameState.Lobby
    )
  }

  public onChatMessage(tags: Record<string, any>, message: string) {
    const sender: Player = makePlayerFromTags(tags)

    if (this.currentState == GameState.Lobby) {
      this.handleLobbyChatMessage(sender)
    } else if (this.currentState == GameState.Round) {
      this.handleRoundChatMessage(sender, message)
    }
  }

  private isTrackingPlayer(player: Player) {
    return player.userId in this.allPlayers
  }

  private playerLost(player: Player) {
    // A player can't lose if we're not already tracking them
    if (!this.isTrackingPlayer(player)) {
      return
    }

    delete this.currentPlayers[player.userId]
    this.allPlayers[player.userId].lostInRound = this.roundNumber
  }

  private getPlayersRemainingString(): string {
    const threshold = 100
    const numCurrentPlayers = _.size(this.currentPlayers)
    if (numCurrentPlayers == 0) return '(no one has joined yet)'
    if (numCurrentPlayers > threshold)
      return `too many players to list (>${threshold} players)"`

    return _.map(this.currentPlayers, 'displayName')
  }

  public printStatus() {
    const numAllPlayers = _.size(this.allPlayers)
    const numCurrentPlayers = _.size(this.currentPlayers)
    const playersString = this.getPlayersRemainingString()
    console.log(`---Game status---
Game state: ${this.getStateStringFromState(this.currentState)}
Players remaining: ${numCurrentPlayers} / ${numAllPlayers}
Names: ${playersString}`)
  }

  private handleRoundChatMessage(sender: Player, message: string) {
    // TODO: code round logic
  }

  private getAllPlayerNames(): string[] {
    return _.map(this.allPlayers, 'displayName')
  }

  public getFullStateMessage(): object {
    const state = {
      type: 'STATE',
      gameState: this.currentState,
      players: this.getAllPlayerNames(),
    }
    return state
  }

  // All chat messages sent in the lobby are considered to join the player to
  // the game.
  private handleLobbyChatMessage(sender: Player) {
    // We only want to add them if we're not already tracking them.
    if (this.isTrackingPlayer(sender)) {
      return
    }

    const numPlayers = _.size(this.allPlayers)
    sender.joinOrder = numPlayers

    this.allPlayers[sender.userId] = sender
    this.currentPlayers[sender.userId] = sender

    console.log(`Player #${sender.joinOrder} joined: ${sender.displayName}`)
  }

  public getStateStringFromState(state: GameState): string {
    switch (state) {
      case GameState.Idle:
        return 'IDLE'
      case GameState.Lobby:
        return 'LOBBY'
      case GameState.Round:
        return 'ROUND'
      case GameState.InBetween:
        return 'INBETWEEN'
      case GameState.End:
        return 'END'
      default:
        return 'UNRECOGNIZED'
    }
  }

  public handleStartMessage() {
    if (!this.canAdvanceGameState()) {
      console.error(
        `Can't handle "start" message. currentState == ${this.currentState}`
      )
      return
    }

    const oldState = this.currentState

    switch (this.currentState) {
      case GameState.Idle:
        this.currentState = GameState.Lobby
        break
      case GameState.Lobby:
        this.currentState = GameState.Round
        break
      default:
        console.error(
          `Could start a round, but no handler exists for transitioning. currentState == ${this.currentState}`
        )
        return
    }

    console.error(
      `Started round. GameState went from ${this.getStateStringFromState(
        oldState
      )} → ${this.getStateStringFromState(this.currentState)}`
    )
  }
}
