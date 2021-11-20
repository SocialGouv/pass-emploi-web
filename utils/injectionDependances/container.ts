import { ActionsService } from '../../services/actions.service'

interface Dependances {
  ActionsService: ActionsService
}

export class Container {
  get<Dependance extends Dependances[keyof Dependances]> (nom: keyof Dependances): Dependance {
    const dependance: Dependance = this.dependances[nom] as Dependance
    if (dependance !== undefined) return dependance
    throw new Error(`La dépendance ${nom} n'est pas définie`)
  }

  private constructor (private readonly dependances: Dependances) {
  }

  static buildDIContainer () {
    return new Container({
      ActionsService: new ActionsService()
    })
  }
}
