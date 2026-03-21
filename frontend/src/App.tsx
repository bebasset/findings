import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/home";
import FindingPage from "./pages/finding";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/finding/:id" element={<FindingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
