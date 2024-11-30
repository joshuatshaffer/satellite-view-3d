import { clientOnly } from "vike-react/clientOnly";

const App = clientOnly(async () => (await import("../../App")).App);

export function Page() {
  return <App />;
}
