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
const randomFrameVideos = document.querySelectorAll("[data-random-frame-video]");
const videoToggleButtons = document.querySelectorAll("[data-video-toggle]");
const videoFullscreenButtons = document.querySelectorAll("[data-video-fullscreen]");

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

if (randomFrameVideos.length > 0) {
  randomFrameVideos.forEach((video) => {
    video.dataset.previewReady = "false";
    video.dataset.hasStarted = "false";

    const setRandomFrame = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        return;
      }

      const minTime = Math.max(0, video.duration * 0.15);
      const maxTime = Math.max(minTime, video.duration * 0.85);
      const targetTime = minTime + Math.random() * (maxTime - minTime);

      video.currentTime = targetTime;
    };

    video.addEventListener("loadedmetadata", setRandomFrame, { once: true });
    video.addEventListener(
      "seeked",
      () => {
        video.pause();
        video.dataset.previewReady = "true";
      },
      { once: true }
    );
  });
}

if (videoToggleButtons.length > 0) {
  videoToggleButtons.forEach((button) => {
    const preview = button.closest(".project-preview");
    const video = preview?.querySelector("video");
    const icon = button.querySelector("[data-video-toggle-icon]");

    if (!preview || !video || !icon) {
      return;
    }

    const setButtonState = (isPlaying) => {
      icon.innerHTML = isPlaying ? "&#10074;&#10074;" : "&#9654;";
      button.setAttribute("aria-label", isPlaying ? "Pause project preview" : "Play project preview");
      preview.classList.toggle("is-playing", isPlaying);
    };

    button.addEventListener("click", async () => {
      if (video.paused) {
        if (video.dataset.previewReady === "true" && video.dataset.hasStarted !== "true") {
          video.currentTime = 0;
        }

        try {
          await video.play();
          video.dataset.hasStarted = "true";
          setButtonState(true);
        } catch (error) {
          setButtonState(false);
        }
      } else {
        video.pause();
        setButtonState(false);
      }
    });

    video.addEventListener("ended", () => {
      video.pause();
      video.dataset.hasStarted = "false";
      setButtonState(false);
    });

    video.addEventListener("play", () => {
      setButtonState(true);
    });

    video.addEventListener("pause", () => {
      setButtonState(false);
    });
  });
}

if (videoFullscreenButtons.length > 0) {
  videoFullscreenButtons.forEach((button) => {
    const preview = button.closest(".project-preview");
    const video = preview?.querySelector("video");

    if (!video) {
      return;
    }

    button.addEventListener("click", async () => {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
          return;
        }

        if (video.requestFullscreen) {
          await video.requestFullscreen();
          return;
        }

        if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        }
      } catch (error) {
        // Ignore fullscreen errors and leave the preview unchanged.
      }
    });
  });
}
