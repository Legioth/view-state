export interface Team {
    id: string,
    name: string,
}

export interface Employee {
    id: string,
    name: string,
}

const teams: Team[] = [
    {id: "a", name: "Team 1"},
    {id: "b", name: "Team 2"},
    {id: "c", name: "Team 3"},
    {id: "d", name: "Team 4"},
    {id: "e", name: "Team 5"},
]

function delay() {
    // [800 - 1200]
    const ms = 800 + Math.random() * 400;
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export async function fetchTeams(filter: string | null): Promise<Team[]>  {
    await delay();

    if (!filter) {
        return teams;
    } else {
        return teams.filter(team => team.name.match(filter));
    }
}

export async function fetchTeamDetails(team: string): Promise<string> {
    await delay();

    return "Details for team " + team;
}

export async function fetchEmployees(team: string, sortBy?: string | null): Promise<Employee[]> {
    await delay();

    const employees: Employee[] = [];
    for(let i = 0; i < 5; i++) {
        const employee = { id: team + '-' + String.fromCharCode('a'.charCodeAt(0) + i), name: `Employee ${i + 1} in team ${team}` };
        if (sortBy == "DESC") {
            employees.splice(0, 0, employee);
        } else {
            employees.push(employee)
        }
    }

    return employees;
}

export async function fetchEmployeeDetails(employeeId: string): Promise<string> {
    await delay();

    return "Details for employee " + employeeId;
}