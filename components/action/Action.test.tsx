import React from "react";
import {render} from "@testing-library/react";
import {screen} from "@testing-library/dom";
import Action from "./Action";
import {ActionStatus} from "../../interfaces/action";
import {uneAction} from "../../tests/fixtures/action";


describe("<Action/>", () => {
    it("devrait afficher les informations des actions d'un jeune", () => {
        const action = uneAction();
        render(<Action action={action}/>);
        expect(screen.getByText("Créé par Nils")).toBeInTheDocument()
        expect(screen.getByText("Identifier ses atouts et ses compétences")).toBeInTheDocument()
        expect(screen.getByText("Je suis un beau commentaire")).toBeInTheDocument()
        expect(screen.getByText("À faire")).toBeInTheDocument()
        expect(screen.getByText("Détail de l'action")).toBeInTheDocument()
    });

    it("devrait afficher un badge 'Commencée' quand l'action a été commencée", () => {
        const actionCommencee = uneAction({status: ActionStatus.InProgress})
        render(<Action action={actionCommencee}/>);
        expect(screen.getByText("Commencée")).toBeInTheDocument()
    });

    it("devrait afficher un badge 'Terminée' quand l'action est terminée", () => {
        const actionTerminee = uneAction({status: ActionStatus.Done})
        render(<Action action={actionTerminee}/>);
        expect(screen.getByText("Terminée")).toBeInTheDocument()
    });

    it("devrait afficher '--' quand il n'y a pas de commentaire", () => {
        const actionTerminee = uneAction({comment: ""})
        render(<Action action={actionTerminee}/>);
        expect(screen.getByText("--")).toBeInTheDocument()
    });
})