import React from "react";
import {render} from "@testing-library/react";
import RdvList from "./RdvList";
import {Rdv} from "../../interfaces/rdv";
import { screen } from "@testing-library/dom";

const uneListeDeRdv = (overrides: Rdv[] = []): Rdv[] => [
    {
        id: "1",
        title: "Rama",
        subtitle: "",
        comment: "Rendez-vous avec Rama",
        date: "Thu, 21 Oct 2021 10:00:00 GMT",
        duration: "30 min",
        modality: "Par téléphone",
    },   {
        id: "2",
        title: "Sixtine",
        subtitle: "",
        comment: "Mon premier rendez-vous",
        date: "Mon, 25 Oct 2021 12:00:00 GMT",
        duration: "25 min",
        modality: "En agence",
    },
    ...overrides
] as Rdv[];

describe("<RdvList>", () => {
    let listeRdv: Rdv[];

    it("devrait afficher un message lorsqu'il n'y a pas de rendez-vous", () => {
        listeRdv = []
        render(<RdvList rdvs={listeRdv}/>)
        expect(screen.getByText("Vous n'avez pas de rendez-vous pour le moment")).toBeInTheDocument()
    });

    it("devrait afficher les informations d'un rendez-vous", () => {
        listeRdv = uneListeDeRdv();
        render(<RdvList rdvs={listeRdv}/>)

        expect(screen.getByText("21/10/2021 (10:00 - 30 min)")).toBeInTheDocument()
        expect(screen.getByText("Rama")).toBeInTheDocument()
        expect(screen.getByText("Par téléphone")).toBeInTheDocument()
        expect(screen.getByText("Rendez-vous avec Rama")).toBeInTheDocument()
    });
})