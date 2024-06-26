import type { Signal } from "@vaadin/hilla-react-signals";
import { ViewStateDefinition, ViewParameterDefinition, buildQuery, expandParams, useViewState } from "Frontend/lib/viewState";

// Everything in this file (except comments describing design decisions) should be generated based on FS router configuration

// Mix of defaults from FS structure and overrides from `export config` in the view
const parametersPersonView: Record<string, ViewParameterDefinition>= {
    person: { type: 'number', kind: 'path', required: true }
};

const configPersonView: ViewStateDefinition = {
    urlGenerator: (params) => `/persons/${params.person}`,
    parameters: parametersPersonView
}

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
const parametersPersonList: Record<string, ViewParameterDefinition> = {
    filter: { type: 'string', kind: 'query', required: false },
    sort: { type: 'string', kind: 'query', required: false }
}

const configPersonList: ViewStateDefinition = {
    urlGenerator: params => `/persons${buildQuery(parametersPersonList, params)}`,
    parameters: parametersPersonList
}

export function urlPersonList(params: {filter?: string, sort?: string} = {}) {
    return configPersonList.urlGenerator(params);
}

export function usePersonListState(): { filter: Signal<string | null>, sort: Signal<string | null> } {
    return useViewState(configPersonList) as any;
}

const configEmptyView: ViewStateDefinition = {
    urlGenerator: params => `/`,
    parameters: {}
}

export function urlEmptyView() {
    return configEmptyView.urlGenerator({});
}

export function useEmptyViewState(): {} {
    return {};
}
