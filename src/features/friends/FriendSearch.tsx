import { useEffect, useState } from "react";
import { useSearchUsers } from "../../hooks/useSearchUsers";
import { useSendFriendRequest } from "../../hooks/useSendFriendRequest";

export function FriendSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [errorId, setErrorId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(timeout);
  }, [query]);

  const { data: results, isLoading } = useSearchUsers(debouncedQuery);
  const sendRequest = useSendFriendRequest();

  function handleAdd(id: string) {
    setErrorId(null);
    sendRequest.mutate(id, {
      onSuccess: () => setSentIds((prev) => new Set(prev).add(id)),
      onError: () => {
        // Most likely cause: a request/friendship already exists for this pair.
        setSentIds((prev) => new Set(prev).add(id));
        setErrorId(id);
      },
    });
  }

  return (
    <div className="friend-search">
      <input
        type="text"
        className="friend-search-input"
        placeholder="Search by username…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {debouncedQuery.trim() !== "" && (
        <div className="friend-search-results">
          {isLoading ? (
            <p className="friend-search-empty">Searching…</p>
          ) : results && results.length > 0 ? (
            results.map((user) => (
              <div key={user.id} className="friend-search-row">
                <span className="friend-search-username">{user.username}</span>
                <button
                  type="button"
                  className="friend-search-action"
                  disabled={sentIds.has(user.id) || sendRequest.isPending}
                  onClick={() => handleAdd(user.id)}
                >
                  {sentIds.has(user.id) ? "Requested" : "Add friend"}
                </button>
                {errorId === user.id && (
                  <span className="friend-search-error">
                    Already requested or already friends
                  </span>
                )}
              </div>
            ))
          ) : (
            <p className="friend-search-empty">No matches</p>
          )}
        </div>
      )}
    </div>
  );
}
