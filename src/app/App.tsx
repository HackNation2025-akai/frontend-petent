import { BrowserRouter, Route, Routes } from "react-router";

import AppProviders from "./providers/AppProviders";
import PetentFormPage from "@/features/petent/routes/PetentFormPage";

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PetentFormPage />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}

