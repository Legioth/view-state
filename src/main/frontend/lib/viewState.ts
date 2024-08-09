import { batch, signal, Signal } from "@vaadin/hilla-react-signals";
import { useContext, useEffect } from "react";
import { useNavigate, Params, UNSAFE_DataRouterStateContext, useParams, useSearchParams } from "react-router-dom";

export type ExtendedViewConfig = ViewStateDefinition | {
    parameters?: Record<string, Partial<ViewParameterDefinition>>
}

export type ViewParameterDefinition = {
    type: 'string' | 'number';
    kind: 'path' | 'query';
    required: boolean;
}

export type ViewStateDefinition = {
    name: string,
    urlGenerator?: (params: Record<string, any>) => string;
    parameters: Record<string, ViewParameterDefinition>[];
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
        const names = Object.keys(config.parameters[0]);
        if (names.length != 1) {
            throw Error("Single value only allowed if there's only on paramter")
        }
        return {[names[0]]: params};
    } else {
        return params;
    }
}

const viewConfigs: Record<string, ViewStateDefinition> = {};

export function init(configs: ViewStateDefinition[]) {
    for(const viewConfig of configs) {
        viewConfigs[viewConfig.name] = viewConfig;
    }
    // Prevent accidental re-configuration
    Object.seal(viewConfigs);
}

const defaultUrlGenerator = () => { throw Error("No current URL Generator"); }

const currentMatchedNames = new Set<string>();
const currentViewState: Record<string, SignalWithSetter<any>> = {};

const matchedNamesChangeSignal = signal(0);

let currentUrlGenerator: (params: Record<string, string>) => string = defaultUrlGenerator;
let currentNavigate: (url: string) => void = (url) => { throw new Error("No navigator set") }

class SignalWithSetter<T> extends Signal<T> {
    #setter: (value: T) => void;

    constructor(initialValue: T, setter: (value: T) => void) {
        super(initialValue);
        this.#setter = setter;
    }

    set value(value: T) {
        this.setInternalValue(value);
        this.#setter(value);
    }

    get value(): T {
        return super.value;
    }

    setInternalValue(value: T) {
        super.value = value;
    }
}

export function refreshViewState() {
    // Use UNSAFE_DataRouterStateContext rather than useMatches to get access to the target element type
    const routerStateContext = useContext(UNSAFE_DataRouterStateContext);
    const matches = routerStateContext!.matches;
    const matchedNames = matches.map((m: any) => m.route.element?.type?.name as (string | undefined)).filter(x => x != undefined) as string[]; 

    const params = useParams();
    const [searchParams] = useSearchParams();

    const lastMatchConfig = viewConfigs[matchedNames[matchedNames.length - 1]];
    currentUrlGenerator = lastMatchConfig?.urlGenerator || defaultUrlGenerator;

    currentNavigate = useNavigate();

    let matchedNamesChanged = false;

    const unusedNames = findUnusedNames(matchedNames);
    unusedNames.forEach(name => {
        currentMatchedNames.delete(name);
        matchedNamesChanged = true;

        const config = viewConfigs[name];
        if (config) {
            const ownParameters = config.parameters[0];
            Object.keys(ownParameters).forEach(key => delete currentViewState[key]);
        }
    });

    const updatedValues: Record<string, string> = {};

    matchedNames.forEach(name => {
        const isNew = !currentMatchedNames.has(name)
        if (isNew) {
            matchedNamesChanged = true;
            currentMatchedNames.add(name);
        }

        const config = viewConfigs[name];
        if (config) {
            const ownParameters = config.parameters[0];
            
            for(const [key, definition] of Object.entries(ownParameters)) {
                const rawValue = definition.kind === 'path' ? params[key] : searchParams.get(key);
        
                if (rawValue === null && definition.required) {
                    throw Error(`${key} is required`);
                }            
                const convertedValue = convertValue(rawValue, definition.type);

                if (isNew) {
                    if (key in currentViewState) {
                        throw Error("Duplicate key:" + key);
                    }
    
                    currentViewState[key] = new SignalWithSetter(convertedValue, value => {
                        
                        const generatorInput: Record<string, any> = {};
                        for(const [k, v] of Object.entries(currentViewState)) {
                            generatorInput[k] = v.value;
                        }
                        // TODO: Only navigate for real changes to avoid messing up the history stack and trigger re-renders
                        currentNavigate(currentUrlGenerator(generatorInput));
                    });
                } else {
                    if (!(key in currentViewState)) {
                        throw Error("Missing key:" + key);
                    }
                    updatedValues[key] = convertedValue;
                }
            }
        }
    });

    // Always run useEffect once with all collected signal updates
    useEffect(() => {
        batch(() => {
            if (matchedNamesChanged) {
                matchedNamesChangeSignal.value = matchedNamesChangeSignal.peek() + 1;
            }
        
            for(const [key, value] of Object.entries(updatedValues)) {
                // Update without triggering URL generation
                // The signal implementation will take care of ignoring redundant updates
                currentViewState[key].setInternalValue(value);                
            }
        });
    });
}

function findUnusedNames(newNames: string[]) {
    const previousMatchedNames = new Set(currentMatchedNames);
    newNames.forEach(name => previousMatchedNames.delete(name));
    return previousMatchedNames;
}

// Could maybe do some TS magic to derive the type from the parameter definition
export function useViewState({name}: ViewStateDefinition): Record<string, Signal<any>> {
    if (!currentMatchedNames.has(name)) {
        throw Error("View is currently not matched (or refreshViewState hasn't been run): " + name);
    }

    // Read value to set up a dependency on changes
    matchedNamesChangeSignal.value;

    return currentViewState;
}

export function buildQuery(parameterChain: Record<string, ViewParameterDefinition>[], params: Record<string, Param | null>): string {
    const query = new URLSearchParams();

    for(const parameters of parameterChain) {
        for(const [key, definition] of Object.entries(parameters)) {
            if (definition.kind === 'query' && key in params) {
                const value = params[key];
                if (value !== null) {
                    query.append(key, value + "");            
                }
            }
        }
    }

    return query.size ? "?" + query.toString() : "";
}
