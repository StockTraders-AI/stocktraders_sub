import StockTradersLanding from "./components/StockTradersLanding";
import StockTradersTeaser from "./components/StockTradersTeaser";
import StockTradersTeaserDay1 from "./components/StockTradersTeaserDay1";

function App() {
  const pathname = window.location.pathname.replace(/\/$/, "");
  if (pathname === "/sap-ra-mat") return <StockTradersTeaser />;
  if (pathname === "/tri-an") return <StockTradersTeaserDay1 />;
  return <StockTradersLanding />;
}

export default App;
