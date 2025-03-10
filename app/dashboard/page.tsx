import CryptoTable from "@/components/table";

export default function Dashboard() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Cryptocurrency Market</h1>
      <p className="mb-6 text-gray-500">Live prices and stats for top cryptocurrencies</p>
      <CryptoTable />
    </div>
  );
}
