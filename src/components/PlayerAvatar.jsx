import { useState } from 'react'

function getInitials(name) {
  return name
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

// Player photo, or their initials for custom players and photos that fail to load.
// The name is always shown next to the avatar, so the image itself is decorative (alt="").
function PlayerAvatar({ player, size = 'md' }) {
  const [failed, setFailed] = useState(false)

  if (!player.photo || failed) {
    return (
      <span className={`player-avatar player-avatar--${size} player-avatar--initials`} aria-hidden="true">
        {getInitials(player.name)}
      </span>
    )
  }

  return (
    <img
      className={`player-avatar player-avatar--${size}`}
      src={player.photo}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

export default PlayerAvatar
