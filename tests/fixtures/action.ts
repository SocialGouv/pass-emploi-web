import {ActionStatus, UserAction} from "../../interfaces/action";

export const uneAction = (overrides: Partial<UserAction> = {}): UserAction => ({
    id: "no-com-1",
    content: "Identifier ses atouts et ses compétences",
    comment: "Je suis un beau commentaire",
    creationDate: '',
    lastUpdate: '',
    creator:"Nils",
    isDone: false,
    status: ActionStatus.NotStarted,
    ...overrides

} as UserAction)