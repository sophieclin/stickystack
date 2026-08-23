import { Link, useParams } from "react-router-dom";
import { useFriendStack } from "../hooks/useFriendStack";
import { useFriendships } from "../hooks/useFriendships";
import { FONT_OPTIONS } from "../lib/fonts";
import { JarScene } from "../scene/JarScene";
import { StackScene } from "../scene/StackScene";

export function FriendStackPage() {
  const { friendId } = useParams<{ friendId: string }>();
  const { accepted } = useFriendships();
  const { notes, weeksById, visualMode, isLoading, error } = useFriendStack(friendId);

  const friendUsername = accepted.find((f) => f.friendId === friendId)?.friendUsername;

  return (
    <div className="stack-page">
      <header className="stack-header">
        <h1>
          <Link to="/" className="stack-header-logo">
            StickyStack
          </Link>
        </h1>
        <div className="stack-header-right">
          <span className="stack-header-greeting">{friendUsername ?? "Friend"}'s stack</span>
          <Link to="/friends">Back to friends</Link>
        </div>
      </header>

      {error ? (
        <p className="friend-stack-error">
          Couldn't load this stack — you may no longer be friends with this user.
        </p>
      ) : (
        <div className="scene-container">
          {visualMode === "stars" ? (
            <JarScene notes={notes} isLoading={isLoading} weeksById={weeksById} />
          ) : (
            <StackScene
              notes={notes}
              isLoading={isLoading}
              weeksById={weeksById}
              fontUrl={FONT_OPTIONS.caveat.meshFontUrl}
            />
          )}
          {isLoading && <p className="scene-loading">Loading stack…</p>}
        </div>
      )}
    </div>
  );
}
