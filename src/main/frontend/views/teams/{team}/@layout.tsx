import { urlTeamDocuments, urlTeamEmployees, useTeamViewState } from "Frontend/fake_generated/generatedViewState";
import { Outlet, useNavigate, useParams } from "react-router-dom"
import { fetchTeamDetails } from "../_FakeBackend";
import { LoaderStatus, useLoader } from "Frontend/lib/useLoader";
import { HorizontalLayout, Tab, Tabs } from "@vaadin/react-components";

export default function TeamView() {
    const navigate = useNavigate();
    const {team, employee, filter} = useTeamViewState();

    const details = useLoader(() => fetchTeamDetails(team.value));

    function selectTab(tabIndex: number) {
        if (tabIndex == 0) {
            navigate(urlTeamEmployees({team: team.value, filter: filter.value}))
        } else {
            navigate(urlTeamDocuments({team: team.value, filter: filter.value}))
        }
    }

    return (
        <HorizontalLayout>
            {details.status === LoaderStatus.LOADED ? details.value : "Loading detail (or error)"}
            <div style={{"border": "1px solid black"}}>
                <Tabs selected={employee !== undefined ? 0 : 1} onSelectedChanged={event => selectTab(event.detail.value)}>
                    <Tab>Employees</Tab>
                    <Tab>Documents</Tab>
                </Tabs>
                <Outlet /></div>
        </HorizontalLayout>
    )    
}