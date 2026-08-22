import { Link } from "react-router-dom";
import { FriendRequests } from "../features/friends/FriendRequests";
import { FriendSearch } from "../features/friends/FriendSearch";
import { FriendsList } from "../features/friends/FriendsList";
import { supabase } from "../lib/supabaseClient";

export function FriendsPage() {
  return (
    <div className="settings-page">
      <header className="stack-header">
        <h1>
          <Link to="/" className="stack-header-logo">
            StickyStack
          </Link>
        </h1>
        <div className="stack-header-right">
          <span className="stack-header-greeting">Friends</span>
          <Link to="/app">Back to stack</Link>
          <button type="button" onClick={() => supabase.auth.signOut()}>
            Log out
          </button>
        </div>
      </header>

      <section>
        <h2>Find a friend</h2>
        <FriendSearch />
      </section>

      <section>
        <h2>Requests</h2>
        <FriendRequests />
      </section>

      <section>
        <h2>Your friends</h2>
        <FriendsList />
      </section>
    </div>
  );
}
