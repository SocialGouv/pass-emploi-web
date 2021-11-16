import {ActionStatus, UserAction} from "interfaces/action";

export const uneAction = (overrides: Partial<UserAction> = {}): UserAction => ({
    id: "no-com-1",
    content: "Identifier ses atouts et ses compétences",
    comment: "Je suis un beau commentaire",
    creationDate: 'Thu, 21 Oct 2021 10:00:00 GMT',
    lastUpdate: '',
    creator:"Nils",
    isDone: false,
    status: ActionStatus.NotStarted,
    ...overrides

} as UserAction)