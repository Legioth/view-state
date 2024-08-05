import type { Signal } from "@vaadin/hilla-react-signals";
import { ViewStateDefinition, ViewParameterDefinition, buildQuery, expandParams, useViewState, init } from "Frontend/lib/viewState";

// Everything in this file (except comments describing design decisions) should be generated based on FS router configuration

// Mix of defaults from FS structure and overrides from `export config` in the view
const parametersPersonView: Record<string, ViewParameterDefinition>[] = [{
    person: { type: 'number', kind: 'path', required: true }
}];

const configPersonView = {
    name: 'PersonView',
    urlGenerator: (params) => `/persons/${params.person}`,
    parameters: parametersPersonView
} satisfies ViewStateDefinition;

// Single-value shorthand only when there's only a single (required?) parameter.
// Object is the only option when there are multple parameters to avoid surpises if the order changes.
export function urlPersonView(params: {person: number} | number): string {
    const expanded = expandParams(configPersonView, params);
    return configPersonView.urlGenerator(expanded);
}

export function usePersonViewState(): { person: Signal<number> } {
    return useViewState(configPersonView) as any;
}

// Copied from `export config` in the view with defaults filled in
const parametersPersonList: Record<string, ViewParameterDefinition>[] = [{
    filter: { type: 'string', kind: 'query', required: false },
    sort: { type: 'string', kind: 'query', required: false }
}]

const configPersonList = {
    name: 'PersonList',
    urlGenerator: params => `/persons${buildQuery(parametersPersonList, params)}`,
    parameters: parametersPersonList
} satisfies ViewStateDefinition;

export function urlPersonList(params: {filter?: string, sort?: string} = {}) {
    return configPersonList.urlGenerator(params);
}

export function usePersonListState(): { filter: Signal<string | null>, sort: Signal<string | null> } {
    return useViewState(configPersonList) as any;
}

const parametersTeamsView: Record<string, ViewParameterDefinition>[] = [{
    filter: { type: 'string', kind: 'query', required: false }
}];

const configTeamsView = {
    name: 'TeamsView',
    parameters: parametersTeamsView,
} satisfies ViewStateDefinition;

// team property is present if navigated to the teams sub view, employee and sortBy only if that tab is open
export function useTeamsViewState(): { filter: Signal<string | null>, team?: Signal<string>, employee?: Signal<string | undefined>, sortBy?: Signal<string | null>} {
    return useViewState(configTeamsView) as any;
}

// Inherit parameters from the layout
const parametersNoTeamSelectedView: Record<string, ViewParameterDefinition>[] = [{}, ...parametersTeamsView];

const configNoTeamSelectedView = {
    name: 'NoTeamSelectedView',
    urlGenerator: params => `/teams${buildQuery(parametersNoTeamSelectedView, params)}`,
    parameters: parametersNoTeamSelectedView
} satisfies ViewStateDefinition;

export function urlNoTeamSelectedView(params: {filter?: string} = {}) {
    return configNoTeamSelectedView.urlGenerator(params);
}

export function useNoTeamSelectedViewState(): { filter: Signal<string | null>} {
    return useViewState(configNoTeamSelectedView) as any;
}

const parametersTeamView: Record<string, ViewParameterDefinition>[] = [{
    team: { type: 'string', kind: 'path', required: true }    
}, ...parametersTeamsView];

const configTeamView = {
    name: 'TeamView',
    parameters: parametersTeamView
} satisfies ViewStateDefinition;

export function useTeamViewState(): { team: Signal<string>, filter: Signal<string | null>, employee?: Signal<string | undefined>} {
    return useViewState(configTeamView) as any;
}

const parametersTeamEmployees: Record<string, ViewParameterDefinition>[] = [{
    employee: { type: 'string', kind: 'path', required: false },
    sortBy: {type: 'string', kind: 'query', required: false}
}, ...parametersTeamView];

const configTeamEmployees = {
    name: 'TeamEmployees',
    urlGenerator: params => `/teams/${params.team}/employees/${params.employee || ""}${buildQuery(parametersTeamEmployees, params)}`,
    parameters: parametersTeamEmployees
} satisfies ViewStateDefinition;

export function urlTeamEmployees(params: {team: string, employee?: string, filter?: string | null, sortBy?: string | null}) {
    return configTeamEmployees.urlGenerator(params);
}

export function useTeamEmployeesState(): { employee: Signal<string | undefined>, team: Signal<string>, filter: Signal<string | null>, sortBy: Signal<string | null>} {
    return useViewState(configTeamEmployees) as any;
}

const parametersTeamDocuments: Record<string, ViewParameterDefinition>[] = [{
}, ...parametersTeamView];

const configTeamDocuments = {
    name: 'TeamDocuments',
    urlGenerator: params => `/teams/${params.team}/documents${buildQuery(parametersTeamDocuments, params)}`,
    parameters: parametersTeamDocuments
} satisfies ViewStateDefinition;

export function urlTeamDocuments(params: {team: string, filter?: string | null}) {
    return configTeamDocuments.urlGenerator(params);
}

export function useTeamDocumentsState(): { team: Signal<string>, filter: Signal<string | null>} {
    return useViewState(configTeamDocuments) as any;
}

const configEmptyView = {
    name: 'EmptyView',
    urlGenerator: params => `/`,
    parameters: [{}]
} satisfies ViewStateDefinition;

export function urlEmptyView() {
    return configEmptyView.urlGenerator({});
}

export function useEmptyViewState(): {} {
    return {};
}

init([
    configPersonView,
    configPersonList,
    configTeamsView,
    configNoTeamSelectedView,
    configTeamView,
    configTeamEmployees,
    configTeamDocuments,
    configEmptyView
]);
