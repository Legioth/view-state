import { Button } from "@vaadin/react-components";
import { urlPersonList, urlPersonView, usePersonListState } from "Frontend/fake_generated/generatedViewState";
import { ExtendedViewConfig } from "Frontend/lib/viewState";
import { Link } from "react-router-dom";

/*export*/ const config: ExtendedViewConfig = {
  parameters: {
    filter: { kind: 'query'},
    sort: { kind: 'query'}
  }
}

export default function PersonList() {
    const viewState = usePersonListState();

    const filter = viewState.filter.value;
    const sort = viewState.sort.value;

    const personIds = [...Array(10).keys()].map(x => x + 1).filter(value => {
      return !filter || ("" + value).indexOf(filter) >= 0;
    }).sort((a, b) => {
      return sort === 'DESC' ? b - a : a - b;
    });

    return <>
      Filter: {viewState.filter} <br />
      Sort: {viewState.sort} <br />
      <Link to={urlPersonList({filter: "1"})}>With filter</Link> {" | "} 
      <Link to={urlPersonList({sort: "DESC"})}>With sort</Link> {" | "}
      <Link to={urlPersonList({filter: "1", sort: "DESC"})}>With filter & sort</Link> {" | "}
      <Link to={urlPersonList()}>With none</Link>
      <br />
      <Button onClick={() => viewState.filter.value = "2"}>Set filter</Button> {" "}
      <Button onClick={() => viewState.filter.value = null}>Clear filter</Button>
      <br />
      Persons: 
      <ul>
        { personIds.map(id => <li key={id}><Link to={urlPersonView(id)}>Person {id}</Link></li>)}
      </ul>
    </>
    
}
