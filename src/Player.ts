export default class Player {
  public displayName: string
  public username: string
  public isMod: boolean
  public userId: string
  public joinOrder: number
  public lostInRound: number

  public static PlayerFromTags(tags: Record<string, any>): Player {
    const displayName = tags['display-name'] || tags.username
    const username = tags.username
    const isMod = tags.mod
    const userId = tags['user-id']
    const joinOrder = -1
    const lostInRound = -1

    return new Player(
      displayName,
      username,
      isMod,
      userId,
      joinOrder,
      lostInRound
    )
  }

  public constructor(
    displayName: string,
    username: string,
    isMod: boolean,
    userId: string,
    joinOrder: number,
    lostInRound: number
  ) {
    this.displayName = displayName
    this.username = username
    this.isMod = isMod
    this.userId = userId
    this.joinOrder = joinOrder
    this.lostInRound = lostInRound
  }

  public didLose(): boolean {
    return this.lostInRound > -1
  }
}
