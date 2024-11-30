import { clientOnly } from "vike-react/clientOnly";

// The first person sky view uses many browser APIs and very little can be
// server-rendered anyway.
const FirstPersonSkyView = clientOnly(
  async () =>
    (await import("../../FirstPersonSkyView/FirstPersonSkyView"))
      .FirstPersonSkyView
);

export function Page() {
  return <FirstPersonSkyView />;
}
