import { createCliRenderer,  } from "@opentui/core";
import { createRoot } from "@opentui/react";
import RootLayout from "./navigation/layouts/RootLayout";
import { createMemoryRouter,RouterProvider } from "react-router";
import { Home, NewSession, Session } from "./navigation/screens/";

const router = createMemoryRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "sessions/new",
        element: <NewSession />,
      },
      {
        path: "sessions/:id",
        element: <Session />,
      },
    ],
  },
]);
const App = () => {
  return <RouterProvider router={router} />;
};

const renderer = await createCliRenderer({
  targetFps: 60,
  exitOnCtrlC: false,
});
createRoot(renderer).render(<App />);
