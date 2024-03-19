import "./App.css";
import Login from "./components/admin/pages/login/Login";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
} from "react-router-dom";
import Dashboard from "./components/dashboard/pages/Dashboard";
import Npsresponse from "./components/forms/pages/Npsresponse";
import NpsForm from "./components/forms/pages/NpsForm";
import DomainForm from "./components/forms/pages/DomainForm";
import ProgramForm from "./components/forms/pages/ProgramForm";
import BatchForm from "./components/forms/pages/BatchForm";
import UserForm from "./components/forms/pages/UserForm";
import Npsresult from "./components/npsresult/Npsresult";
import Studentlist from "./components/forms/pages/Studentlist";
import Statics from "./components/dashboard/pages/Statics";
import NpsRegisterForm from "./components/forms/pages/NpsRegisterForm";
import UserResponse from "./components/dashboard/pages/UserResponse";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login></Login>
  },
  {
    path: "dashboard",
    element: <Dashboard></Dashboard>
  },
  {
    path: "npsresponse/:userId",
    element: <Npsresponse></Npsresponse>
  },
  {
    path: "npsform",
    element: <NpsForm></NpsForm>
  },
  {
    path: "domain",
    element: <DomainForm></DomainForm>
  },
  {
    path: "program",
    element: <ProgramForm></ProgramForm>
  },
  {
    path: "batch",
    element: <BatchForm></BatchForm>
  },
  {
    path: "users",
    element: <UserForm></UserForm>
  },
  {
    path: 'npsresult',
    element: <Npsresult></Npsresult>
  },
  {
    path: 'studentlist',
    element: <Studentlist></Studentlist>
  },
  {
    path: 'statics',
    element: <Statics></Statics>
  },
  {
    path: 'npsregisterform',
    element: <NpsRegisterForm></NpsRegisterForm>
  },
  {
    path: 'userresponse/:responseId',
    element: <UserResponse></UserResponse>
  }
]);

function App() {
  return (
    <RouterProvider router={router}></RouterProvider>
  );
}

export default App;
