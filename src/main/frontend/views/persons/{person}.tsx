import { Button } from "@vaadin/react-components";
import { urlPersonList, urlPersonView, usePersonViewState } from "Frontend/fake_generated/generatedViewState";
import { ExtendedViewConfig, ViewParameterDefinition } from "Frontend/lib/viewState";
import { Link, useParams } from "react-router-dom";
import { useLoader } from "Frontend/lib/useLoader";

/*export*/ const config: ExtendedViewConfig = {
  parameters: {
    person: {type: 'number'}
  }
}

export default function PersonView() {
    // Signal<number>
    const { person } = usePersonViewState();

    const loader = useLoader(() => loadPerson(person.value));
   
    return <>
      {loader.select(value => "This is " + value, () => "Loading with id " + person)}
      <br />
      <Link to={urlPersonView(person.value + 1)}>Next as a link</Link><br />
      <Button onClick={() => person.value++}>Next as a button</Button> <br />
      <Link to={urlPersonList()}>Back to list</Link>
    </>
}
function loadPerson(personId: number): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        // Enulate a slow request
        setTimeout(() => {
            return resolve("Person " + personId);
        }, 1000);
    });
}


