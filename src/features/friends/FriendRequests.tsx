import { useAcceptFriendRequest } from "../../hooks/useAcceptFriendRequest";
import { useFriendships } from "../../hooks/useFriendships";
import { useRemoveFriendship } from "../../hooks/useRemoveFriendship";

export function FriendRequests() {
  const { incomingPending, outgoingPending, isLoading } = useFriendships();
  const acceptRequest = useAcceptFriendRequest();
  const removeFriendship = useRemoveFriendship();

  if (isLoading) return null;

  return (
    <div className="friend-requests">
      <div>
        <h3>Incoming requests</h3>
        {incomingPending.length === 0 ? (
          <p className="friend-list-empty">No incoming requests</p>
        ) : (
          <ul className="friend-list">
            {incomingPending.map((request) => (
              <li key={request.id} className="friend-list-row">
                <span className="friend-list-username">{request.friendUsername ?? "Unknown user"}</span>
                <div className="friend-list-actions">
                  <button
                    type="button"
                    className="friend-list-action"
                    disabled={acceptRequest.isPending}
                    onClick={() => acceptRequest.mutate(request.id)}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="friend-list-action friend-list-action--danger"
                    disabled={removeFriendship.isPending}
                    onClick={() => removeFriendship.mutate(request.id)}
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3>Outgoing requests</h3>
        {outgoingPending.length === 0 ? (
          <p className="friend-list-empty">No outgoing requests</p>
        ) : (
          <ul className="friend-list">
            {outgoingPending.map((request) => (
              <li key={request.id} className="friend-list-row">
                <span className="friend-list-username">{request.friendUsername ?? "Unknown user"}</span>
                <button
                  type="button"
                  className="friend-list-action"
                  disabled={removeFriendship.isPending}
                  onClick={() => removeFriendship.mutate(request.id)}
                >
                  Cancel
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
