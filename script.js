const revealItems = document.querySelectorAll(".reveal");
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const trackedSections = document.querySelectorAll("header[id], section[id]");
const shanghaiTime = document.querySelector("[data-shanghai-time]");
const serverName = document.querySelector("[data-server-name]");
const serverInviteText = document.querySelector("[data-server-invite-text]");
const serverOnline = document.querySelector("[data-server-online]");
const serverLink = document.querySelector("[data-server-link]");
const serverAvatar = document.querySelector("[data-server-avatar]");
const sharedStatusText = document.querySelector("[data-shared-status-text]");
const sharedDiscordStatus = document.querySelector("[data-shared-discord-status]");
const youtubeEmbeds = document.querySelectorAll("[data-youtube-embed]");

if (!("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

const setActiveNav = (id) => {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", isActive);
  });
};

if (trackedSections.length > 0 && navLinks.length > 0) {
  const activeSectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visibleEntries.length > 0) {
        setActiveNav(visibleEntries[0].target.id);
      }
    },
    {
      threshold: [0.2, 0.4, 0.65],
      rootMargin: "-20% 0px -45% 0px",
    }
  );

  trackedSections.forEach((section) => activeSectionObserver.observe(section));

  const initialHash = window.location.hash.replace("#", "");
  setActiveNav(initialHash || "home");
}

if (shanghaiTime) {
  const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const updateShanghaiTime = () => {
    shanghaiTime.textContent = timeFormatter.format(new Date());
  };

  updateShanghaiTime();
  window.setInterval(updateShanghaiTime, 1000);
}

if (sharedStatusText || sharedDiscordStatus) {
  const pageStatus = (document.body.dataset.status || "offline").toLowerCase();
  const isOnline = pageStatus === "online";

  if (sharedStatusText) {
    sharedStatusText.textContent = isOnline ? "Online" : "Offline";
  }

  if (sharedDiscordStatus) {
    sharedDiscordStatus.textContent = isOnline ? "ONLINE" : "OFFLINE";
  }
}

if (serverName && serverOnline && serverLink) {
  const guildId = "1485570906527895554";
  const fallbackInvite = "https://discord.gg/5PDBqm4CBX";
  const widgetUrl = `https://discord.com/api/guilds/${guildId}/widget.json`;

  const updateServerCard = async () => {
    try {
      const response = await fetch(widgetUrl, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Widget request failed: ${response.status}`);
      }

      const data = await response.json();
      const inviteUrl = data.instant_invite || fallbackInvite;

      serverName.textContent = data.name || "kryosphere server";
      serverInviteText.textContent = inviteUrl.replace("https://", "");
      serverOnline.textContent = `${data.presence_count ?? 0} Online`;
      serverLink.href = inviteUrl;

      if (serverAvatar) {
        const initials = (data.name || "KS")
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        serverAvatar.textContent = initials;
      }
    } catch (error) {
      serverName.textContent = "kryosphere server";
      serverInviteText.textContent = "discord.gg/5PDBqm4CBX";
      serverOnline.textContent = "Enable Discord widget for live online count";
      serverLink.href = fallbackInvite;
    }
  };

  updateServerCard();
}

const getYouTubeVideoId = (url) => {
  const normalizeVideoId = (value) => {
    const trimmedValue = value?.trim() || "";
    return /^[\w-]{11}$/.test(trimmedValue) ? trimmedValue : null;
  };

  if (!url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url, window.location.href);
    const hostname = parsedUrl.hostname.replace(/^www\./, "").toLowerCase();

    if (hostname === "youtu.be") {
      return normalizeVideoId(parsedUrl.pathname.split("/").filter(Boolean)[0]);
    }

    if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "youtube-nocookie.com"
    ) {
      if (parsedUrl.pathname === "/watch") {
        return normalizeVideoId(parsedUrl.searchParams.get("v"));
      }

      const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
      if (pathParts[0] === "embed" || pathParts[0] === "shorts") {
        return normalizeVideoId(pathParts[1]);
      }
    }
  } catch (error) {
    return null;
  }

  return null;
};

if (youtubeEmbeds.length > 0) {
  youtubeEmbeds.forEach((embedRoot) => {
    const preview = embedRoot.closest(".project-preview");
    const title = preview?.dataset.youtubeTitle || "Project Video";
    const rawUrl = preview?.dataset.youtubeUrl?.trim() || "";
    const videoId = getYouTubeVideoId(rawUrl);

    if (!videoId) {
      embedRoot.innerHTML = `
        <div class="project-video-placeholder">
          <p class="project-video-placeholder-label">YouTube video pending</p>
          <p class="project-video-placeholder-title">${title}</p>
          <p class="project-video-placeholder-note">Paste the video URL into the card's <code>data-youtube-url</code> attribute.</p>
        </div>
      `;
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.className = "project-video-embed";
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
    iframe.title = `${title} YouTube video`;
    iframe.loading = "lazy";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;

    const link = document.createElement("a");
    link.className = "project-video-link";
    link.href = `https://www.youtube.com/watch?v=${videoId}`;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "Watch on YouTube";

    embedRoot.replaceChildren(iframe, link);
  });
}
