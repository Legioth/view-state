import { Button } from "@vaadin/react-components";
import { urlPersonList, urlPersonView, usePersonViewState } from "Frontend/fake_generated/generatedViewState";
import { ExtendedViewConfig, ViewParameterDefinition } from "Frontend/lib/viewState";
import { Link, useParams } from "react-router-dom";

/*export*/ const config: ExtendedViewConfig = {
  parameters: {
    person: {type: 'number'}
  }
}

export default function PersonView() {
    // Signal<number>
    const { person } = usePersonViewState();
   
    return <>
      This is person {person}
      <br />
      <Link to={urlPersonView(person.value + 1)}>Next as a link</Link><br />
      <Button onClick={() => person.value++}>Next as a button</Button> <br />
      <Link to={urlPersonList()}>Back to list</Link>
    </>
}
