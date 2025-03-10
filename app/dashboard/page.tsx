import CryptoTable from "@/components/table";

export default function Dashboard() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Coin Piyasaları</h1>
      <p className="mb-6 text-gray-500">Coinleri canlı olarak görüntüle</p>
      <CryptoTable />
    </div>
  );
}
