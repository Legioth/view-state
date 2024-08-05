import { HorizontalLayout, TextField, VerticalLayout } from "@vaadin/react-components";
import { LoaderStatus, useLoader } from "Frontend/lib/useLoader";
import { fetchTeams, Team } from "./_FakeBackend";
import { ExtendedViewConfig } from "Frontend/lib/viewState";
import { urlTeamDocuments, urlTeamEmployees, useTeamsViewState } from "Frontend/fake_generated/generatedViewState";
import { Link, Outlet } from "react-router-dom";
import { useEffect } from "react";

/*export*/ const config: ExtendedViewConfig = {
    parameters: {
        filter: { kind: 'query'}
    }
}

function emptyToNull(value: string) {
    return value === "" ? null : value;
}

function createTeamLink(team: string, tab: "employee" | "documents",  filter: string | null) {
    if (tab=="employee") {
        return urlTeamEmployees({team, filter});
    } else {
        return urlTeamDocuments({team, filter});
    }
}

export default function TeamsView() {
    const { filter, team, employee } = useTeamsViewState();    
    const teams = useLoader(() => fetchTeams(filter.value));

    const selectedTeam = team?.value;
    
    return <HorizontalLayout>
        <VerticalLayout>
            <TextField placeholder="Filter" onChange={(event) => filter.value = emptyToNull(event.target.value)} />
            {teams.status == LoaderStatus.LOADED ? 
                <ul>
                    {teams.value.map(team => <li key={team.id}>
                        <Link to={createTeamLink(team.id, employee ? "employee": "documents", filter.value)} style={{fontWeight: team.id == selectedTeam ? "bold" : null}}>
                            {team.name}
                        </Link>
                    </li>)}
                </ul>
             : <span>Loading teams (or error)...</span>}
        </VerticalLayout>
        <Outlet />
    </HorizontalLayout>
}