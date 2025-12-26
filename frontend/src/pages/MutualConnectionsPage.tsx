import { useParams } from "react-router-dom";

export function MutualConnectionsPage() {
  const { username } = useParams();
  return <div className="text-white p-4">Mutual connections with {username}</div>;
}
