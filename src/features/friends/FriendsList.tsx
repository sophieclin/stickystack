import { Link } from "react-router-dom";
import { useFriendships } from "../../hooks/useFriendships";
import { useRemoveFriendship } from "../../hooks/useRemoveFriendship";

export function FriendsList() {
  const { accepted, isLoading } = useFriendships();
  const removeFriendship = useRemoveFriendship();

  if (isLoading) return null;

  if (accepted.length === 0) {
    return <p className="friend-list-empty">No friends yet</p>;
  }

  return (
    <ul className="friend-list">
      {accepted.map((friendship) => (
        <li key={friendship.id} className="friend-list-row">
          <Link to={`/friends/${friendship.friendId}`} className="friend-list-username">
            {friendship.friendUsername ?? "Unknown user"}
          </Link>
          <button
            type="button"
            className="friend-list-action friend-list-action--danger"
            disabled={removeFriendship.isPending}
            onClick={() => removeFriendship.mutate(friendship.id)}
          >
            Unfriend
          </button>
        </li>
      ))}
    </ul>
  );
}
