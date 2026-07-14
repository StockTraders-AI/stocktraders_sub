import StockTradersLanding from "./components/StockTradersLanding";
import StockTradersTeaser from "./components/StockTradersTeaser";

function App() {
  const pathname = window.location.pathname.replace(/\/$/, "");
  if (pathname === "/sap-ra-mat") return <StockTradersTeaser />;
  return <StockTradersLanding />;
}

export default App;
