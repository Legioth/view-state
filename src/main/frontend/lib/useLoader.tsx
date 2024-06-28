import { ReadonlySignal, useComputed, useSignal, useSignalEffect } from "@vaadin/hilla-react-signals";
import { ReactElement } from "react";

export enum LoaderStatus {
    LOADING, ERROR, LOADED
}
type ElementOrString = ReactElement | string;

export type LoaderState<T> = {
    select: (onValue: (value: T) => ElementOrString, onLoading?: string | (() => ElementOrString), onError?: (error: any) => ElementOrString) => ElementOrString;
} & ({
    readonly status: LoaderStatus.LOADING;
    value?: T;
} | {
    readonly status: LoaderStatus.LOADED;
    value: T;
} | {
    readonly status: LoaderStatus.ERROR;
    readonly error: any;
});

type InternalState<T> = LoaderState<T> & {
    readonly counter: number;
};

function select<T>(this: LoaderState<T>,
    onValue: (value: T) => ElementOrString,
    onLoading?: string | (() => ElementOrString),
    onError?: (error: any) => ElementOrString): ElementOrString {
    if (this.status === LoaderStatus.LOADED) {
        return onValue(this.value);
    } if (this.status === LoaderStatus.LOADING) {
        if (onLoading) {
            if (typeof onLoading == 'string') {
                return onLoading;
            } else {
                return onLoading();
            }
        } else if ("value" in this) {
            console.log("here", this.value);
            return onValue(this.value!);
        } else {
            return "";
        }
    } else {
        if (onError) {
            return onError(this.error);
        } else {
            throw this.error;
        }
    }
}

export function useLoaderSignal<T>(callback: () => Promise<T>): ReadonlySignal<LoaderState<T>> {
    const signal = useSignal<InternalState<T>>({ status: LoaderStatus.LOADING, select, counter: 0 });

    useSignalEffect(() => {
        const previousState = signal.peek();
        const counter = previousState.counter + 1;

        if (("value" in previousState)) {
            const value = previousState.value;
            signal.value = { status: LoaderStatus.LOADING, select, counter, value };
        } else {
            signal.value = { status: LoaderStatus.LOADING, select, counter };
        }

        callback().then(value => {
            if (counter == signal.peek().counter) {
                signal.value = { status: LoaderStatus.LOADED, select, counter, value };
            }
        }, error => {
            if (counter == signal.peek().counter) {
                signal.value = { status: LoaderStatus.ERROR, select, counter, error };
            }
        });
    });
    return useComputed(() => signal.value);
}
export function useLoader<T>(callback: () => Promise<T>): LoaderState<T> {
    return useLoaderSignal(callback).value;
}
