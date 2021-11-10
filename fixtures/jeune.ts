import { Jeune} from "interfaces/index";

export const unJeune = (overrides: Partial<Jeune> = {}): Jeune => ({
    id: "jeune-1",
    firstName: 'Kenji',
    lastName: 'Jirac',
    ...overrides

} as Jeune)