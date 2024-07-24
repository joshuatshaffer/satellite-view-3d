import { useWarnings } from "./warnings";

export function App() {
  const warnings = useWarnings();

  return (
    <>
      <ul>
        {warnings.map((warning) => (
          <li>{warning}</li>
        ))}
      </ul>
    </>
  );
}
