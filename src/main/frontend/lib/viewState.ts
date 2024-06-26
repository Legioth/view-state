import { Signal, useSignal, useSignalEffect } from "@vaadin/hilla-react-signals";
import { useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

export type ExtendedViewConfig = ViewStateDefinition | {
    parameters?: Record<string, Partial<ViewParameterDefinition>>
}

export type ViewParameterDefinition = {
    type: 'string' | 'number';
    kind: 'path' | 'query';
    required: boolean;
}

export type ViewStateDefinition = {
    urlGenerator: (params: Record<string, any>) => string,
    parameters: Record<string, ViewParameterDefinition>;
}

type Param = string | number

function convertValue(value: string | null | undefined, type: 'string' | 'number'): any {
    if (type === 'number' && value) {
        return +value;
    } else {
        return value;
    }
}

export function expandParams(config: ViewStateDefinition, params: Record<string, Param> | Param): Record<string, Param> {
    if (typeof params !== 'object') {
        // TODO only consider required parameters?
        const names = Object.keys(config.parameters);
        if (names.length != 1) {
            throw Error("Single value only allowed if there's only on paramter")
        }
        return {[names[0]]: params};
    } else {
        return params;
    }
}

// Could maybe do some TS magic to derive the type from the parameter definition
export function useViewState({parameters, urlGenerator}: ViewStateDefinition): Record<string, Signal<any>> {
    const params = useParams();
    const [searchParams] = useSearchParams();

    const navigate = useNavigate();

    const state: Record<string, Signal<any>> = {};
    for(const [key, definition] of Object.entries(parameters)) {
        const rawValue = definition.kind === 'path' ? params[key] : searchParams.get(key);

        if (rawValue === null && definition.required) {
            throw Error(`${key} is required`);
        }

        const value = convertValue(rawValue, definition.type);
        const s = useSignal(value);
        // TODO: Sync router state and signal value in a way that doesn't trigger another re-render
        useEffect(() => {s.value = value}, [value]);

        state[key] = s;
    }

    useSignalEffect(() => {
        const generatorInput: Record<string, any> = {};
        for(const key of Object.keys(parameters)) {
            generatorInput[key] = state[key].value;
        }
        // TODO: Only navigate for real changes to avoid messing up the history stack and trigger re-renders
        navigate(urlGenerator(generatorInput));
    });

    return state;
}

export function buildQuery(parametersPersonList: Record<string, ViewParameterDefinition>, params: Record<string, Param | null>): string {
    const query = new URLSearchParams();

    for(const [key, definition] of Object.entries(parametersPersonList)) {
        if (definition.kind === 'query' && key in params) {
            const value = params[key];
            if (value !== null) {
                query.append(key, value + "");            
            }
        }
    }

    return query.size ? "?" + query.toString() : "";
}
