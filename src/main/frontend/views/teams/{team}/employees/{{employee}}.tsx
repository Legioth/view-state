import { urlTeamEmployees, useTeamEmployeesState } from "Frontend/fake_generated/generatedViewState"
import { LoaderStatus, useLoader } from "Frontend/lib/useLoader";
import { Link, useParams } from "react-router-dom"
import { fetchEmployeeDetails, fetchEmployees } from "../../_FakeBackend";
import { ExtendedViewConfig } from "Frontend/lib/viewState";
import { Checkbox, VerticalLayout } from "@vaadin/react-components";
import { Signal } from "@vaadin/hilla-react-signals";

/*export*/ const config: ExtendedViewConfig = {
    parameters: {
        sortBy: { kind: 'query'}
      }
    }

export default function TeamEmployees() {
    const {employee, team, sortBy, filter} = useTeamEmployeesState();

    const employees = useLoader(() => fetchEmployees(team.value, sortBy.value))

    return (
        <VerticalLayout>
            <Checkbox label="Sort DESC" checked={sortBy.value === 'DESC'} onCheckedChanged={e => sortBy.value = e.detail.value ? 'DESC' : null} />
            {employees.status == LoaderStatus.LOADED ? <ul>
                {employees.value.map(e => <li key={e.id}>
                    <Link to={urlTeamEmployees({team: team.value, employee: e.id, filter: filter.value, sortBy: sortBy.value})}
                            style={{fontWeight: e.id == employee.value ? "bold" : "normal"}}>
                        {e.name}
                    </Link>
                </li>)}
            </ul> : <span>Loading employees (or error)</span>}
            {employee.value ? <EmployeeDetails employee={employee} /> : <span>No employee selected</span>}
        </VerticalLayout> 
    )
}

function EmployeeDetails({employee}: {employee: Signal<string | undefined>}) {
    const employeeInfo = useLoader(async () => fetchEmployeeDetails(employee.value!));
    
    return employeeInfo.status === LoaderStatus.LOADED ? employeeInfo.value : "Loading employee info (or error)";
}
